"use client";

import styles from "../styles/Navbar.module.css";
import Container from "@/components/Container";
import Skeleton from "@/components/ui/Skeleton";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/features/cart";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/features/toast";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatPrice } from "@/lib/utils/currency";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCartIcon,
  UserRound,
  LogOut,
  Shield,
  LayoutDashboard,
  User,
  Package,
  Users,
  ClipboardList,
  Settings,
  Search,
  Menu,
  X,
} from "lucide-react";
import { Cart } from "@/features/cart";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Array<{ id: number; slug: string; title: string; thumbnail: string; price: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { cart, toggleCart } = useCart();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initialized = useAuthStore((s) => s.initialized);
  const toast = useToastStore((s) => s.toast);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const isAdmin = user?.role === "ADMIN";
  const displayName = user?.name || user?.email?.split("@")[0];

  const isActive = (href: string) => pathname === href;

  const debouncedSearch = useDebounce(search, 300);

  const fetchResults = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedSearch);
  }, [debouncedSearch, fetchResults]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setShowUserMenu(false);
        setShowDropdown(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setMobileMenuOpen(false);
    toast("Sesión cerrada exitosamente", "success");
    router.push("/");
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleResultClick = () => {
    setSearch("");
    setResults([]);
    setShowDropdown(false);
  };

  const categories = [
    { href: "/", label: "INICIO" },
    { href: "/category/gpu", label: "GPU" },
    { href: "/category/cpu", label: "CPU" },
    { href: "/category/ram", label: "RAM" },
    { href: "/category/storage", label: "ALMACENAMIENTO" },
  ];

  return (
    <>
      <div className={styles.navbarSticky}>
        <nav className={styles.navbarPrimario} role="navigation" aria-label="Navegación principal">
          <Container>
            <div className={styles.navLeft}>
              <button
                className={styles.hamburgerBtn}
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menú"
                aria-expanded={mobileMenuOpen}
              >
                <Menu size={28} />
              </button>

              <h1 className={styles.logo}>
                <Link className={styles.logoLink} href="/" onClick={closeMobileMenu}>
                  ELECTROSHOP
                </Link>
              </h1>
            </div>

            <div className={styles.searchWrapper} ref={searchRef}>
              <div className={styles.searchInputWrapper}>
                <Search className={styles.searchIcon} size={18} />
                <input
                  type="text"
                  placeholder="BUSCAR PRODUCTOS..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowDropdown(true)}
                  className={styles.search}
                  aria-label="Buscar productos"
                  autoComplete="off"
                />
              </div>

              {search.trim() && showDropdown && (
                <div className={styles.searchDropdown} role="listbox" aria-label="Resultados de búsqueda">
                  {loading && (
                    <div className={styles.searchLoading}>Buscando...</div>
                  )}
                  {!loading && results.length > 0 &&
                    results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className={styles.searchItem}
                        onClick={handleResultClick}
                        role="option"
                      >
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={48}
                          height={48}
                          className={styles.searchThumb}
                        />
                        <div className={styles.searchInfo}>
                          <span className={styles.searchTitle}>{product.title}</span>
                          <span className={styles.searchPrice}>
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  {!loading && hasSearched && results.length === 0 && (
                    <div className={styles.searchEmpty}>Sin resultados</div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles["icon-btn"]} ${styles.mobileSearchBtn}`}
                onClick={() => {
                  setMobileSearchOpen(!mobileSearchOpen);
                  setMobileMenuOpen(false);
                }}
                aria-label="Buscar"
                aria-expanded={mobileSearchOpen}
              >
                <Search size={28} />
              </button>

              <div className={styles.userWrapper} ref={menuRef}>
                {!mounted || !initialized ? (
                  <Skeleton variant="circle" width={30} height={30} role="status" aria-label="Cargando sesión" />
                ) : (
                  <>
                    <button
                      className={styles["icon-btn"]}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      aria-label="Menú de usuario"
                      aria-expanded={showUserMenu}
                    >
                      <UserRound size={30} />
                      {isAdmin && <span className={styles.adminBadge}>ADMIN</span>}
                    </button>

                    {showUserMenu && (
                      <div className={`${styles.userDropdown} ${showUserMenu ? styles.open : ""}`}>
                        {user ? (
                      <>
                        <div className={styles.userDropdownHeader}>
                          <div className={styles.avatarCircle}>
                            {isAdmin ? <Shield size={18} /> : <User size={18} />}
                          </div>
                          <div className={styles.headerInfo}>
                            {isAdmin ? (
                              <span className={styles.adminLabel}>ADMIN</span>
                            ) : (
                              <span className={styles.customerLabel}>
                                cliente <span className={styles.customerName}>{displayName}</span>
                              </span>
                            )}
                            <span className={styles.userDropdownEmail}>{user.email}</span>
                          </div>
                        </div>
                        {isAdmin ? (
                          <>
                            <Link
                              href="/admin"
                              className={`${styles.userDropdownLink} ${styles.userDropdownAccent}`}
                              onClick={() => setShowUserMenu(false)}
                              prefetch={false}
                            >
                              <LayoutDashboard size={15} />
                              Dashboard
                            </Link>
                            <Link
                              href="/admin/products"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                              prefetch={false}
                            >
                              <Package size={15} />
                              Productos
                            </Link>
                            <Link
                              href="/admin/users"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                              prefetch={false}
                            >
                              <Users size={15} />
                              Usuarios
                            </Link>
                            <Link
                              href="/admin/orders"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                              prefetch={false}
                            >
                              <ClipboardList size={15} />
                              Pedidos
                            </Link>
                            <Link
                              href="/admin/settings"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                              prefetch={false}
                            >
                              <Settings size={15} />
                              Ajustes
                            </Link>
                          </>
                        ) : (
                          <>
                            <Link
                              href="/profile"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User size={15} />
                              Mi perfil
                            </Link>
                            <Link
                              href="/orders"
                              className={styles.userDropdownLink}
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Package size={15} />
                              Mis pedidos
                            </Link>
                          </>
                        )}
                        <div className={styles.userDropdownDivider} />
                        <button onClick={handleLogout} className={styles.userDropdownBtn}>
                          <LogOut size={15} />
                          Salir
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className={styles.userDropdownLink}
                          onClick={() => setShowUserMenu(false)}
                        >
                          Iniciar Sesión
                        </Link>
                        <div className={styles.userDropdownDivider} />
                        <Link
                          href="/register"
                          className={styles.userDropdownLink}
                          onClick={() => setShowUserMenu(false)}
                        >
                          Registrarse
                        </Link>
                      </>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>

              <div className={styles.cartWrapper}>
                <button
                  className={`${styles["icon-btn"]} ${styles["cart-btn"]}`}
                  onClick={toggleCart}
                  aria-label={`Carrito, ${totalItems} items`}
                >
                  <ShoppingCartIcon size={30} />
                  {totalItems > 0 && (
                    <span className={styles.badge}>{totalItems}</span>
                  )}
                </button>
                <Cart />
              </div>
            </div>
          </Container>
        </nav>

        <div className={styles.rgbbar}></div>
      </div>

      <nav className={styles.navbarSecundario} role="navigation" aria-label="Categorías">
        <Container>
          <ul className={styles.navbarLinks}>
            {categories.map((cat) => (
              <li key={cat.href}>
                <Link
                  href={cat.href}
                  className={`${styles.navbarLinkText} ${isActive(cat.href) ? styles.active : ""}`}
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      <div
        className={`${styles.drawerBackdrop} ${mobileMenuOpen ? styles.backdropOpen : ""}`}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      <aside
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className={styles.drawerHeader}>
          <Link className={styles.drawerLogo} href="/" onClick={closeMobileMenu}>
            ELECTROSHOP
          </Link>
          <button
            className={styles.drawerCloseBtn}
            onClick={closeMobileMenu}
            aria-label="Cerrar menú"
          >
            <X size={24} />
          </button>
        </div>

        <ul className={styles.drawerLinks}>
          {categories.map((cat) => (
            <li key={cat.href}>
              <Link
                href={cat.href}
                className={`${styles.drawerLink} ${isActive(cat.href) ? styles.drawerLinkActive : ""}`}
                onClick={closeMobileMenu}
              >
                {cat.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.drawerDivider} />

        <div className={styles.drawerUserSection}>
          {!mounted || !initialized ? (
            <div className={styles.drawerUserSkeleton} aria-label="Cargando sesión">
              <Skeleton variant="circle" width={34} height={34} />
              <Skeleton width={120} height={14} />
            </div>
          ) : user ? (
            <>
              <div className={styles.drawerUserInfo}>
                <div className={styles.avatarCircle}>
                  {isAdmin ? <Shield size={18} /> : <User size={18} />}
                </div>
                <div>
                  <span className={styles.drawerUserName}>
                    {displayName}
                    {isAdmin && <span className={styles.drawerAdminTag}>ADMIN</span>}
                  </span>
                  <span className={styles.drawerUserEmail}>{user.email}</span>
                </div>
              </div>
              <ul className={styles.drawerLinks}>
                {isAdmin ? (
                  <>
                    <li>
                      <Link href="/admin" className={styles.drawerLink} onClick={closeMobileMenu} prefetch={false}>
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/products" className={styles.drawerLink} onClick={closeMobileMenu} prefetch={false}>
                        <Package size={15} />
                        Productos
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/users" className={styles.drawerLink} onClick={closeMobileMenu} prefetch={false}>
                        <Users size={15} />
                        Usuarios
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/orders" className={styles.drawerLink} onClick={closeMobileMenu} prefetch={false}>
                        <ClipboardList size={15} />
                        Pedidos
                      </Link>
                    </li>
                    <li>
                      <Link href="/admin/settings" className={styles.drawerLink} onClick={closeMobileMenu} prefetch={false}>
                        <Settings size={15} />
                        Ajustes
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/profile" className={styles.drawerLink} onClick={closeMobileMenu}>
                        <User size={15} />
                        Mi perfil
                      </Link>
                    </li>
                    <li>
                      <Link href="/orders" className={styles.drawerLink} onClick={closeMobileMenu}>
                        <Package size={15} />
                        Mis pedidos
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <button onClick={handleLogout} className={styles.drawerLogoutBtn}>
                <LogOut size={15} />
                Salir
              </button>
            </>
          ) : (
            <div className={styles.drawerAuthLinks}>
              <Link href="/login" className={styles.drawerAuthBtn} onClick={closeMobileMenu}>
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className={`${styles.drawerAuthBtn} ${styles.drawerAuthBtnOutline}`}
                onClick={closeMobileMenu}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>

      {mobileSearchOpen && (
        <div className={styles.mobileSearchOverlay}>
          <div className={styles.mobileSearchBar}>
            <button
              className={styles.mobileSearchBackBtn}
              onClick={() => {
                setMobileSearchOpen(false);
                setSearch("");
                setResults([]);
              }}
              aria-label="Cerrar búsqueda"
            >
              <X size={22} />
            </button>
            <div className={styles.mobileSearchInputWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder="BUSCAR PRODUCTOS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className={styles.mobileSearchInput}
                aria-label="Buscar productos"
                autoComplete="off"
              />
            </div>
          </div>

          {search.trim() && (
            <div className={styles.mobileSearchResults}>
              {loading && (
                <div className={styles.searchLoading}>Buscando...</div>
              )}
              {!loading && results.length > 0 &&
                results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className={styles.searchItem}
                    onClick={() => {
                      handleResultClick();
                      setMobileSearchOpen(false);
                    }}
                  >
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      width={48}
                      height={48}
                      className={styles.searchThumb}
                    />
                    <div className={styles.searchInfo}>
                      <span className={styles.searchTitle}>{product.title}</span>
                      <span className={styles.searchPrice}>
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  </Link>
                ))}
              {!loading && hasSearched && results.length === 0 && (
                <div className={styles.searchEmpty}>Sin resultados</div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
