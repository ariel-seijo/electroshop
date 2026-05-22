"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Store, User } from "lucide-react";
import { useAuthStore } from "@/features/auth";
import styles from "./AdminProfileMenu.module.css";

export default function AdminProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  return (
    <div className={styles.menu} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menú de perfil"
      >
        <User size={16} />
        <span className={styles.name}>{displayName}</span>
        <ChevronDown size={14} className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>

      {open && (
        <div className={styles.dropdown} role="menu">
          <div className={styles.dropdownItem} style={{ color: "rgb(130,130,130)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.5px", cursor: "default", pointerEvents: "none" }}>
            {user?.email}
          </div>

          <Link href="/" className={styles.dropdownItem} role="menuitem" onClick={() => setOpen(false)}>
            <Store size={16} />
            Ver Tienda
          </Link>

          <button
            className={`${styles.dropdownItem} ${styles.logoutItem}`}
            onClick={handleLogout}
            role="menuitem"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
