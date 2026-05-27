# ElectroShop

**Tienda de hardware gamer de alto rendimiento** — Proyecto full-stack con Next.js 16, Clean Architecture, TypeScript estricto y Tailwind CSS v4.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.3-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://electroshop-store.vercel.app)
[![Portfolio](https://img.shields.io/badge/Proyecto-Portfolio_|_Demo-8B5CF6)](https://electroshop-store.vercel.app)

---

## Propuesta de Valor

ElectroShop es un ecommerce de componentes de PC construido con **Clean Architecture** y **Feature-Based Design**. Cada modulo de dominio (`auth`, `cart`, `products`, `checkout`, `admin`) vive aislado en `src/features/` con una API publica expuesta a traves de barrel exports. Las reglas de `eslint-plugin-import` con `no-restricted-paths` garantizan que la capa de framework (`app/`) no acceda directamente a los internos de los features, y que los atomos de UI (`components/ui/`) permanezcan agnosticos de dominio.

La experiencia de usuario prioriza **velocidad y cero friccion**: carrito sincronizado automaticamente entre sesiones guest y usuarios autenticados, checkout multi-paso con validacion en tiempo real y persistencia en localStorage, y un dashboard de administracion con metricas de negocio, gestion de stock y analiticas de ventas.

> **Estado actual**: Portfolio funcional — no se procesan pagos reales. El frontend, la logica de negocio y el panel admin estan completos. La pasarela de pago usa datos demo.

---

## Arquitectura y Stack Tecnico

### Decisiones de diseno

| Decision | Tecnologia | Justificacion |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server Components por defecto, Server Actions para mutaciones, ISR para dashboard. |
| **Lenguaje** | **TypeScript 6** (`strict: true`) | Migracion completa bottom-up (213 archivos, 0 JS). Tipos canonicos de dominio exportados desde `src/types/`. Schemas Zod con `z.infer` para tipos runtime ↔ compilacion. |
| **Estilos** | **Tailwind CSS v4** | CSS atomico con `@theme` para design tokens. `@tailwindcss/postcss` como plugin de build. Sin runtime cost. Migrado desde CSS Modules (~60 `.module.css` eliminados). Iconos con Lucide React. |
| **ORM** | Prisma + PostgreSQL (Neon) | Type-safe queries, schema declarativo, `$transaction` para operaciones atomicas de carrito y ordenes. |
| **Autenticacion** | iron-session | Cookies selladas y encriptadas. Sin JWT, sin tabla de sesiones, sin estado en servidor. Ideal para serverless. |
| **Estado global** | Zustand (auth) + Context/Reducer (cart) | Zustand solo para auth. El carrito usa `useReducer` porque su logica es local y no necesita propagarse globalmente. |
| **Validacion** | Zod 4 | Schemas compartidos entre cliente y servidor. Validacion en API routes y Server Actions. |
| **Imagenes** | Cloudinary | Upload widget en admin, transformaciones on-the-fly, `blurDataURL` para LCP. |
| **Email** | Nodemailer + Gmail SMTP | Templates HTML inline para recuperacion de contrasena. |
| **Hosting** | Vercel | Serverless functions, edge proxy, deploy continuo desde `main`. |

### Por que Server Components por defecto

Solo ~30% de los componentes llevan `"use client"`. Las paginas de listado (productos, ordenes, usuarios) son **Server Components** que fetchean datos directo de Prisma sin API intermedia. Los componentes interactivos (tablas con filtros, modales, toggles) son Client Components que reciben datos como props. Esta separacion minimiza el JavaScript enviado al cliente y maximiza el rendimiento percibido.

---

## Deep Dive: Logica de Negocio

### Sincronizacion de Carrito (Guest → User Merge)

El problema: un usuario agrega productos al carrito como visitante y luego inicia sesion. El carrito guest (en `localStorage`) debe fusionarse con el carrito existente en base de datos sin perder items de ninguna fuente.

```javascript
// src/features/cart/actions/syncCart.ts — Algoritmo de merge idempotente
await prisma.$transaction(async (tx) => {
  // 1. Obtener stock actual y estado active de cada producto
  const products = await tx.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, stock: true, active: true },
  });

  // 2. Obtener items existentes en DB para este usuario
  const existingItems = await tx.cartItem.findMany({
    where: { userId, productId: { in: productIds } },
  });

  for (const item of incomingItems) {
    const product = products.find(p => p.id === item.productId);
    // Producto eliminado o sin stock → eliminar del carrito
    if (!product || !product.active || product.stock === 0) {
      await tx.cartItem.deleteMany({ where: { userId, productId: item.productId } });
      continue;
    }

    const existing = existingItems.find(e => e.productId === item.productId);
    // Merge idempotente: Math.max garantiza que correr sync
    // dos veces produce el mismo resultado
    const mergedQty = Math.max(item.quantity, existing?.quantity || 0);
    // Capear al stock disponible
    const finalQty = Math.min(mergedQty, product.stock);

    if (finalQty <= 0) {
      await tx.cartItem.deleteMany({ where: { userId, productId: item.productId } });
    } else {
      await tx.cartItem.upsert({
        where: { userId_productId: { userId, productId: item.productId } },
        create: { userId, productId: item.productId, quantity: finalQty },
        update: { quantity: finalQty },
      });
    }
  }
});
```

**Estado del sistema:**
- **Guest**: carrito en `localStorage` clave `"cart"`. Sin interaccion con DB.
- **Usuario autenticado**: DB como fuente de verdad. Auto-save con debounce de 2s. Flag `cart_is_synced` en `localStorage` previene re-merges.
- **Multi-tab**: event listener `storage` detecta syncs en otras pestanas y re-fetchea.
- **Logout**: flush inmediato a DB antes de limpiar estado local.

**Modelo Prisma:**
```prisma
model CartItem {
  id        Int      @id @default(autoincrement())
  quantity  Int      @default(1)
  userId    String
  productId Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([userId, productId])  // Un item por usuario-producto
  @@index([userId])
}
```

### Autenticacion Stateless con iron-session

**Sin JWT. Sin tabla de sesiones. Sin estado en servidor.** La sesion se almacena en una cookie encriptada (`ecommerce-session`) que solo el servidor puede descifrar con `SESSION_SECRET`.

```javascript
// src/lib/session.ts
export const sessionOptions = {
  password: process.env.SESSION_SECRET,  // 32 bytes base64
  cookieName: "ecommerce-session",
  cookieOptions: {
    httpOnly: true,           // Inaccesible desde JavaScript
    secure: process.env.NODE_ENV === "production",  // Solo HTTPS
    sameSite: "lax",         // Proteccion CSRF
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
};
```

**Buenas practicas de seguridad aplicadas:**
- **Rate limiting**: sliding window in-memory (5 intentos / 60s) en login, register y forgot-password. IP desde `x-forwarded-for`.
- **Prevencion de enumeracion de emails**: forgot-password retorna el mismo mensaje exista o no el email.
- **Soft-delete con anonimizacion**: usuarios eliminados conservan sus ordenes pero su PII se reemplaza (`email → deleted_<hash>@deleted.local`, `password → "DELETED"`). Extension de Prisma Client filtra automaticamente `deletedAt: null` en queries.
- **Contrasenas**: `@node-rs/bcrypt` (Rust nativo), cost factor 12.
- **Headers de seguridad**: Content-Security-Policy, HSTS (produccion), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin.
- **Sanitizacion de tarjeta**: solo se persisten `last4`, `expiry` y `holder`. Nunca el numero completo.

**Flujo de autorizacion en 3 capas:**
1. **Proxy** (`proxy.ts`): redirect granular — auth pages, admin routes, checkout y perfil.
2. **Server Actions**: `requireAuth()` y `requireAdmin()` como primera linea de cada accion.
3. **API Routes**: verificacion inline de sesion por endpoint.

```typescript
// src/proxy.ts — Matcher de rutas protegidas
export const config = {
  matcher: [
    "/login", "/register", "/forgot-password", "/reset-password",
    "/checkout/:path*", "/account/:path*", "/profile",
    "/orders/:path*", "/admin/:path*", "/dashboard",
  ],
};
```

### Dashboard de Administracion

Panel completo para gestionar el negocio con **21 Server Actions** protegidas por `requireAdmin()`.

| Seccion | Capacidades |
|---|---|
| **Dashboard** | 4 KPIs (revenue, ordenes, usuarios, stock bajo) con crecimiento intermensual. Grafico SVG de ventas 7 dias. Top 5 productos. Alertas de stock < 5. ISR 5 minutos con `unstable_cache`. Campanita de notificaciones en tiempo real. |
| **Productos** | CRUD completo. Toggle active/featured. Edicion inline de stock. Galeria de imagenes Cloudinary con drag-and-drop y reorden. SKU autogenerado (`COMP-CAT-BRAND-MODEL-SUF`). Preview en vivo del card de producto. |
| **Ordenes** | Listado con filtros por estado. Detalle con timeline, address de envio y snapshot de items. Cambio de estado con maquina de estados. Cancelacion con restauracion automatica de stock (`$transaction`). Impresion/PDF. |
| **Usuarios** | Listado con busqueda y filtros (rol, estado). LTV calculado. Cambio de rol y ban/desban. Soft-delete con anonimizacion. Historial de ordenes en drawer lateral. |
| **Settings** | Tasa de cambio USD → ARS (persistida en `SiteSettings`, default 1400). Cambio de contrasena con toggle de visibilidad. Confirmacion con keyword. |

---

## UX & Testing Features

### Magic Fill — Autocompletado de Checkout

Dos botones con icono ✨ que llenan instantaneamente los formularios de shipping y pago con datos demo para testing rapido:

```typescript
// src/mocks/checkoutDemoData.ts
export const SHIPPING_DEMO = {
  fullName: "Homero Simpson",        email: "hsimpson@mail.com",
  phone:    "+54 11 1111-1111",       address: "P. Sherman, Calle Wallaby 42",
  city:     "Sidney",                 department: "CABA",
  zip:      "1193",                   notes: "Denle un laburito al pibe que hizo el sitio...",
};

export const PAYMENT_DEMO = {
  method: "card",                     cardNumber: "4509 1234 5678 9012",
  cardExpiry: "12/28",                cardCvc: "321",
  cardHolder: "Homero Simpson",
};
```

- **Siempre visibles** en produccion para facilitar revision del flujo completo.
- Persistencia del estado del checkout en `localStorage` (sobrevive refrescos).
- Validacion cliente-side por campo con feedback visual inmediato.
- Validacion servidor con Zod antes de crear la orden.

### ViewSwitcher — Toggle de Vista

En paginas de categoria, toggle grid/list con persistencia en `localStorage` + cookie. Preferencia sincronizada via query param `?view=grid|list`.

---

## Estructura de Carpetas

```
src/
├── app/                          # Capa de framework (Next.js App Router)
│   ├── (auth)/                   #   Login, Register, Forgot/Reset password
│   ├── (storefront)/             #   Home, Producto, Categoria, Checkout, Profile, Orders
│   ├── admin/                    #   Dashboard, Products, Orders, Users, Settings
│   └── api/                      #   12 grupos de rutas REST (+ Server Actions en features/)
│
├── features/                     # Modulos de dominio con API publica
│   ├── admin/                    #   actions/ | components/ | services/
│   ├── auth/                     #   hooks/useAuth.ts (Zustand) | components/AuthProvider.tsx
│   ├── cart/                     #   context/CartContext.tsx + CartReducer.ts
│   │   │                         #   actions/ (syncCart, saveCart, fetchCart)
│   │   └── components/           #   CartDrawer.tsx
│   ├── category/                 #   components/ (ViewSwitcher, ProductGrid, etc.)
│   ├── checkout/                 #   context/ | components/ (Shipping, Payment, Review)
│   ├── orders/                   #   actions/ | services/ | lib/orderNumber.ts
│   ├── products/                 #   components/ (ProductCard, ProductPage, etc.)
│   ├── shop/                     #   Navbar, Footer, HeroSlider, Brands, PromoBanner
│   └── toast/                    #   Sistema de notificaciones toast
│
├── components/                   # Componentes globales compartidos
│   └── ui/                       #   Atomos agnosticos de dominio (Skeleton, etc.)
│
├── lib/                          # Utilidades transversales
│   ├── prisma.ts                 #   Cliente singleton + extension soft-delete
│   ├── session.ts                #   Configuracion iron-session
│   ├── auth-guards.ts            #   requireAuth() | requireAdmin()
│   ├── rate-limit.ts             #   Sliding window in-memory
│   ├── email.ts                  #   Nodemailer + sendResetEmail()
│   ├── errors.ts                 #   Errores tipados de dominio
│   ├── fetch.ts                  #   Wrapper tipado de fetch con manejo de errores
│   ├── validations/              #   Schemas Zod (auth, order)
│   └── utils/                    #   currency, input-formatters, etc.
│
├── types/                        # Tipos canonicos de dominio (Product, Order, Category, ApiResponse)
├── proxy.ts                      # Proteccion de rutas (iron-session + role check)
└── mocks/                        # Datos demo (checkoutDemoData.ts)
```

### Reglas de Arquitectura (ESLint)

```javascript
// eslint.config.mjs — Boundary enforcement con no-restricted-paths
{
  // Layer 1: app/ no importa de features/ directamente (solo barrel index.ts)
  target: "./src/app/**",
  from: "./src/features/**",
  except: ["./index.ts", "./index.js", "./index.jsx"],
},
{
  // Layer 2: components/ui/ es agnostico de dominio
  target: "./src/components/ui/**",
  from: "./src/features/**",
},
{
  // Layer 3: features/ no importa de app/ (solo layout.tsx y globals.css)
  target: "./src/features/**",
  from: "./src/app/**",
  except: ["./layout.tsx", "./layout.jsx", "./globals.css"],
}
```

Estas reglas garantizan que:
- El dominio no conoce los detalles del framework.
- La UI base es reutilizable en cualquier contexto.
- Los features exponen una API publica deliberada a traves de `index.ts`.

---

## Instalacion y Configuracion

### Prerrequisitos

- Node.js 20+
- PostgreSQL (local o [Neon](https://neon.tech) serverless)
- Cuenta en [Cloudinary](https://cloudinary.com) (gratuita)
- Cuenta Gmail con app password para envio de emails

### Setup

```bash
# 1. Clonar e instalar dependencias
git clone https://github.com/ariel-seijo/electroshop.git
cd electroshop
npm install

# 2. Variables de entorno — crear .env en la raiz
cp .env.example .env  # Si existe .env.example
```

### Variables de entorno requeridas

```env
# Base de datos (Neon PostgreSQL)
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"

# Sesiones (generar con: openssl rand -base64 32)
SESSION_SECRET="..."

# SMTP (Gmail con app password)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="[email creado para enviar los correos]"
SMTP_PASS="[contraseña de aplicacion de gmail]"
SMTP_FROM="[email creado para enviar los correos]"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Seed
SEED_ADMIN_PASSWORD="[clave para admin]"
```

### Base de datos y seed

```bash
# Sincronizar schema con la base de datos
npx prisma db push

# Poblar con datos demo (admin + 20 productos)
npm run prisma.seed
```

**Credenciales de seed:**
- Admin: `admin@electroshop.com` / `[clave para admin]`
- Cliente test: `user@test.com` / `[clave para user]`

### Desarrollo y build

```bash
npm run dev       # http://localhost:3000
npm run build     # npx prisma generate && next build
npm run typecheck # tsc --noEmit (TypeScript estricto, 0 errores)
npm run lint      # ESLint con boundary checks
```

---

## Esquema de Base de Datos

```
User --1:N--> CartItem <--N:1-- Product --N:1-- Category
 |                                    |
 +--1:N--> Order --1:N--> OrderItem --+
 |                                    |
 +------------------------------------+
                                    |
                            ProductImage (N:1 --> Product)

SiteSettings (singleton)
```

**8 modelos, 3 enums** — `Role` (CUSTOMER | ADMIN), `OrderStatus` (PENDING → PAID → SHIPPED → DELIVERED, cancelable), `AccountStatus` (ACTIVE | BANNED).

---

## Nota del Desarrollador

Este proyecto nacio como practica personal para dominar React y experimentar con IA como orquestador de desarrollo. La primera iteracion uso **JavaScript puro** y **CSS Modules** para iterar rapido sobre la logica de negocio (carrito, auth, checkout, dashboard) sin la friccion de tooling que aun no dominaba.

La segunda iteracion completo dos migraciones simultaneas:

- **TypeScript**: migracion bottom-up por capas de dependencia (0 dependencias → `lib/validations/` → `lib/utils/` → `lib/` → `features/` → `app/`). Resultado: 213 archivos `.ts`/`.tsx`, `strict: true`, 0 errores en `tsc --noEmit`, tipos canonicos de dominio en `src/types/`.
- **Tailwind CSS v4**: reemplazo completo de CSS Modules (~60 `.module.css` eliminados). Design tokens via `@theme` en `globals.css`. Iconos con Lucide React. Build pipeline via `@tailwindcss/postcss`.

Ambas migraciones se hicieron preservando runtime compatibility en cada commit — la app nunca dejo de funcionar.

---

**Desarrollado por Ariel Seijo** · [Linkedin](https://www.linkedin.com/in/arielseijo/)
