"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, Store, User } from "lucide-react";
import { useAuthStore } from "@/features/auth";

export default function AdminProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => { setOpen(false); await logout(); router.push("/"); router.refresh(); };
  const displayName = user?.name || user?.email?.split("@")[0] || "Admin";

  const dropdownItem = "flex items-center gap-2.5 w-full px-[14px] py-2.5 bg-transparent border-none text-text-secondary font-semibold text-[0.8rem] cursor-pointer transition-colors duration-[100ms] no-underline hover:bg-white/5";

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 py-1 px-3 pl-3 h-9 bg-transparent border border-white/5 rounded-md text-text-muted cursor-pointer text-[0.78rem] font-semibold transition-all duration-[150ms] hover:text-text-0 hover:border-white/10 hover:bg-white/[0.03] max-md:py-1 max-md:px-2 max-md:min-w-11 max-md:min-h-11 max-md:justify-center"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Menú de perfil"
      >
        <User size={16} />
        <span className="max-w-[120px] truncate max-md:hidden">{displayName}</span>
        <ChevronDown size={14} className={`text-[rgb(100,100,100)] transition-transform duration-[150ms] ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 min-w-[200px] bg-surface-22 border border-white/10 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-drop-in" role="menu">
          <div className={dropdownItem} style={{ color: "rgb(130,130,130)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.5px", cursor: "default", pointerEvents: "none" }}>
            {user?.email}
          </div>
          <Link href="/" className={dropdownItem} role="menuitem" onClick={() => setOpen(false)}>
            <Store size={16} />Ver Tienda
          </Link>
          <button className={`${dropdownItem} text-danger border-t border-white/5 hover:bg-danger/10`} onClick={handleLogout} role="menuitem">
            <LogOut size={16} />Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
