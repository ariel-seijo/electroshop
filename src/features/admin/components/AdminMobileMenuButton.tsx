"use client";

import { useSidebar } from "./SidebarContext";
import { Menu, X } from "lucide-react";

export default function AdminMobileMenuButton() {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <button
      className="admin-hamburger-btn"
      onClick={toggleSidebar}
      aria-expanded={sidebarOpen}
      aria-controls="admin-sidebar"
      aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
    >
      {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
    </button>
  );
}
