"use client";

import { useEffect, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, type LucideIcon } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/settings", label: "Ajustes", icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useSidebar();

  useEffect(() => {
    function handleEscape(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") closeSidebar();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeSidebar]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        id="admin-sidebar"
        className={`${className || ""} admin-sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Navegación principal"
      >
        <div className="admin-sidebar-logo">
          <h1>ElectroShop</h1>
          <span>Panel de Administración</span>
        </div>

        <nav aria-label="Administración">
          <ul className="admin-nav" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/admin"
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`admin-nav-link ${isActive ? "active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeSidebar}
                    prefetch={false}
                  >
                    <Icon aria-hidden="true" size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ padding: "16px", borderTop: "1px solid var(--admin-border)", flexShrink: 0 }}>
          <span style={{ fontSize: "0.65rem", color: "var(--admin-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>
            v1.0.0
          </span>
        </div>
      </aside>
    </>
  );
}
