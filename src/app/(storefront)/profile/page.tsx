"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/features/toast";
import { getErrorMessage } from "@/lib/errors";
import {
  User,
  Package,
  LogOut,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";

export default function ProfilePage() {
  const { user, setUser, updateUser, logout } = useAuthStore();
  const toast = useToastStore((s) => s.toast);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const displayName = user?.name || user?.email?.split("@")[0] || "Usuario";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const roleLabel = user?.role === "ADMIN" ? "Administrador" : "Cliente";

  const handleEditClick = () => {
    setNameInput(user?.name || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNameInput("");
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim() }),
      });
      const data: { user: { name: string }; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      updateUser({ name: data.user.name });
      toast("Nombre actualizado exitosamente", "success");
      setIsEditing(false);
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setDeleteInput("");
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteInput("");
  };

  const handleConfirmDelete = async () => {
    if (deleteInput !== "ELIMINAR") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user", { method: "DELETE" });
      const data: { message?: string; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setUser(null);
      toast("Cuenta eliminada exitosamente", "success");
      router.push("/");
    } catch (err) {
      toast(getErrorMessage(err), "error");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");
      toast("Contraseña actualizada exitosamente", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast("Sesión cerrada exitosamente", "success");
    router.push("/");
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn { from { transform: scale(0.95) translateY(10px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .pf-anim-overlay, .pf-anim-modal { animation: none !important; } }
      `}</style>
      <div className="min-h-[calc(100vh-130px)] flex relative max-md:flex-col">
        <aside className="w-[260px] min-w-[260px] bg-[rgb(22,22,22)] border-r border-[rgb(38,38,38)] flex flex-col py-8 max-md:hidden">
          <div className="flex flex-col items-center px-6 pb-8 border-b border-[rgb(38,38,38)] mb-6">
            <div className="w-20 h-20 rounded-full bg-[rgb(30,30,30)] border-2 border-[rgb(44,44,44)] flex items-center justify-center text-[rgb(140,140,140)] mb-4">
              {user?.role === "ADMIN" ? (
                <Shield size={36} />
              ) : (
                <User size={36} />
              )}
            </div>
            <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)] text-center break-words max-w-full">{displayName}</span>
            <span className="text-[0.78rem] text-[rgb(120,120,120)] text-center mt-1 break-words max-w-full">{user?.email}</span>
          </div>

          <nav className="flex flex-col gap-1 px-3 flex-1">
            <span className="w-full h-12 flex items-center gap-3 px-4 bg-[rgba(36,171,243,0.08)] border-l-[3px] border-l-[#24abf3] text-[#24abf3] text-[0.88rem] font-semibold cursor-default no-underline text-left font-[inherit]">
              <User size={18} />
              Mi Información
            </span>
            <Link href="/orders" className="w-full h-12 flex items-center gap-3 px-4 bg-transparent border-0 border-l-[3px] border-l-transparent text-[rgb(160,160,160)] text-[0.88rem] font-semibold cursor-pointer no-underline transition-all duration-200 text-left font-[inherit] hover:bg-[rgb(28,28,28)] hover:text-[rgb(210,210,210)]">
              <Package size={18} />
              Mis Pedidos
            </Link>
          </nav>

          <button onClick={handleLogout} className="mt-6 mx-3 h-12 flex items-center justify-center gap-2 border border-[rgba(239,68,68,0.3)] bg-transparent text-[#ef4444] text-[0.85rem] font-semibold uppercase tracking-[1px] cursor-pointer transition-all duration-[0.25s] font-[inherit] hover:bg-[rgba(239,68,68,0.08)] hover:border-[#ef4444]">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 bg-[rgb(18,18,18)] max-md:p-5 max-[480px]:p-2">
          <div className="max-w-[780px] mx-auto">
            <div className="bg-[rgb(22,22,22)] border border-[rgb(38,38,38)] p-7 mb-6 max-[480px]:p-5">
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-[rgb(38,38,38)]">
                <h2 className="m-0 text-[1.1rem] font-semibold uppercase tracking-[1px] text-[rgb(214,214,214)]">Información de la Cuenta</h2>
                {!isEditing && (
                  <button onClick={handleEditClick} className="inline-flex items-center gap-1.5 h-9 px-4 bg-transparent border border-[rgb(60,60,60)] text-[rgb(160,160,160)] text-[0.82rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit] hover:border-[#24abf3] hover:text-[#24abf3]">
                    <Pencil size={16} />
                    Editar
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-[1.1rem]">
                <div className="flex flex-col gap-[0.35rem]">
                  <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)] uppercase tracking-[1px]">Nombre</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2.5 flex-wrap max-md:flex-col max-md:items-stretch">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="flex-1 min-w-[200px] h-[46px] px-4 bg-[rgb(26,26,26)] border border-[rgb(50,50,50)] text-[rgb(214,214,214)] text-[0.95rem] font-semibold outline-none transition-colors duration-200 font-[inherit] max-md:min-w-0 max-md:w-full placeholder:text-[rgb(72,72,72)] focus:border-[#24abf3] focus:shadow-[0_0_0_3px_rgba(36,171,243,0.08)]"
                        placeholder="Tu nombre"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                      />
                      <button onClick={handleSaveName} className="inline-flex items-center gap-1.5 h-[46px] px-5 border-0 bg-gradient-to-br from-[#007fff] to-[#00cfff] text-[#111] text-[0.85rem] font-semibold uppercase tracking-[0.8px] cursor-pointer transition-all duration-[0.25s] font-[inherit] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,127,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none" disabled={saving || !nameInput.trim()}>
                        {saving ? <div className="w-4 h-4 border-2 border-[rgba(17,17,17,0.3)] border-t-[#111] rounded-full animate-spin motion-reduce:animate-none" /> : <Check size={16} />}
                        Guardar
                      </button>
                      <button onClick={handleCancelEdit} className="inline-flex items-center gap-1.5 h-[46px] px-5 bg-transparent border border-[rgb(60,60,60)] text-[rgb(160,160,160)] text-[0.85rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit] hover:border-[rgb(100,100,100)] hover:text-[rgb(210,210,210)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={saving}>
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)]">{displayName}</span>
                  )}
                </div>

                <div className="flex flex-col gap-[0.35rem]">
                  <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)] uppercase tracking-[1px]">Correo Electrónico</span>
                  <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)]">{user?.email || "—"}</span>
                </div>
                <div className="flex flex-col gap-[0.35rem]">
                  <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)] uppercase tracking-[1px]">Rol</span>
                  <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)]">{roleLabel}</span>
                </div>
                <div className="flex flex-col gap-[0.35rem]">
                  <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)] uppercase tracking-[1px]">Miembro desde</span>
                  <span className="text-[0.95rem] font-semibold text-[rgb(214,214,214)]">{memberSince}</span>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(22,22,22)] border border-[rgb(38,38,38)] p-7 mb-6 max-[480px]:p-5">
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-[rgb(38,38,38)]">
                <div className="flex items-center gap-2.5 text-[rgb(160,160,160)]">
                  <Lock size={18} />
                  <h2 className="m-0 text-[1.1rem] font-semibold uppercase tracking-[1px] text-[rgb(214,214,214)]">Cambiar Contraseña</h2>
                </div>
              </div>

              <div className="flex flex-col gap-[1.1rem] mb-5">
                {[{ label: "Contraseña Actual", value: currentPassword, setter: setCurrentPassword, show: showCurrentPassword, setShow: setShowCurrentPassword },
                  { label: "Nueva Contraseña", value: newPassword, setter: setNewPassword, show: showNewPassword, setShow: setShowNewPassword, placeholder: "Mínimo 6 caracteres" },
                  { label: "Confirmar Nueva Contraseña", value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: "Repetí la nueva contraseña" }]
                  .map((f, i) => (
                  <div key={i} className="flex flex-col gap-[0.35rem]">
                    <span className="text-[0.7rem] font-semibold text-[rgb(140,140,140)] uppercase tracking-[1px]">{f.label}</span>
                    <div className="relative flex items-center">
                      <input
                        type={f.show ? "text" : "password"}
                        value={f.value}
                        onChange={(e) => f.setter(e.target.value)}
                        className="w-full h-[46px] px-4 pr-11 bg-[rgb(26,26,26)] border border-[rgb(50,50,50)] text-[rgb(214,214,214)] text-[0.95rem] font-semibold outline-none transition-colors duration-200 font-[inherit] placeholder:text-[rgb(72,72,72)] focus:border-[#24abf3] focus:shadow-[0_0_0_3px_rgba(36,171,243,0.08)]"
                        placeholder={f.placeholder || "••••••••"}
                      />
                      <button type="button" className="absolute right-2 bg-transparent border-0 text-[rgb(100,100,100)] cursor-pointer p-1.5 flex items-center justify-center transition-colors duration-200 hover:text-[#24abf3]" onClick={() => f.setShow(!f.show)} tabIndex={-1} aria-label={f.show ? "Ocultar contraseña" : "Mostrar contraseña"}>
                        {f.show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {passwordError && <div className="mb-4 px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] text-[rgb(248,113,113)] text-[0.82rem] font-semibold">{passwordError}</div>}

              <button onClick={handleChangePassword} className="w-full h-12 flex items-center justify-center gap-2 border-0 bg-gradient-to-br from-[#007fff] to-[#00cfff] text-[#111] text-[0.85rem] font-semibold uppercase tracking-[1px] cursor-pointer transition-all duration-[0.25s] font-[inherit] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(0,127,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
                {changingPassword ? <div className="w-4 h-4 border-2 border-[rgba(17,17,17,0.3)] border-t-[#111] rounded-full animate-spin motion-reduce:animate-none" /> : <Lock size={16} />}
                Cambiar Contraseña
              </button>
            </div>

            <div className="h-px bg-[rgb(38,38,38)] my-6" />

            <button onClick={handleDeleteClick} className="w-full h-12 flex items-center justify-center gap-2 border border-[rgba(239,68,68,0.35)] bg-transparent text-[#ef4444] text-[0.85rem] font-semibold uppercase tracking-[1px] cursor-pointer transition-all duration-[0.25s] font-[inherit] hover:bg-[rgba(239,68,68,0.08)] hover:border-[#ef4444] hover:shadow-[0_4px_16px_rgba(239,68,68,0.12)]">
              <AlertTriangle size={16} />
              Eliminar Cuenta
            </button>

            {showDeleteConfirm && (
              <div className="pf-anim-overlay fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000] p-4" style={{ animation: "fadeIn 0.15s ease-out" }} onClick={deleting ? undefined : handleCancelDelete}>
                <div className="pf-anim-modal w-full max-w-[440px] bg-[rgb(22,22,22)] border border-[rgb(44,44,44)] p-8 pb-7 text-center max-[480px]:p-6" style={{ animation: "modalIn 0.2s ease-out" }} onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] mx-auto mb-5">
                    <AlertTriangle size={32} className="text-[#ef4444]" />
                  </div>
                  <h3 className="m-0 mb-3 text-[1.2rem] font-semibold text-[rgb(214,214,214)]">¿Estás seguro?</h3>
                  <p className="m-0 mb-6 text-[0.85rem] text-[rgb(140,140,140)] leading-relaxed [&_strong]:text-[#ef4444] [&_strong]:font-semibold">
                    Esta acción es permanente y todos tus datos serán perdidos.
                    Para confirmar, escribí <strong>ELIMINAR</strong>.
                  </p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value.toUpperCase())}
                    className="w-full h-12 px-4 bg-[rgb(18,18,18)] border border-[rgb(44,44,44)] text-[rgb(214,214,214)] text-[0.95rem] font-semibold text-center uppercase tracking-[4px] outline-none transition-colors duration-200 mb-6 font-[inherit] placeholder:text-[rgb(60,60,60)] placeholder:tracking-[4px] focus:border-[#ef4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                    placeholder="ELIMINAR"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && deleteInput.toUpperCase() === "ELIMINAR") {
                        handleConfirmDelete();
                      }
                    }}
                  />
                  <div className="flex gap-3 max-[480px]:flex-col">
                    <button onClick={handleCancelDelete} className="flex-1 h-[46px] flex items-center justify-center border border-[rgb(50,50,50)] bg-transparent text-[rgb(180,180,180)] text-[0.88rem] font-semibold cursor-pointer transition-all duration-200 font-[inherit] hover:border-[rgb(90,90,90)] hover:text-[rgb(214,214,214)] disabled:opacity-50 disabled:cursor-not-allowed" disabled={deleting}>Cancelar</button>
                    <button onClick={handleConfirmDelete} className="flex-1 h-[46px] flex items-center justify-center gap-1.5 border-0 bg-[#dc2626] text-white text-[0.85rem] font-semibold uppercase tracking-[0.5px] cursor-pointer transition-all duration-[0.25s] font-[inherit] hover:bg-[#ef4444] hover:shadow-[0_6px_20px_rgba(239,68,68,0.3)] disabled:opacity-40 disabled:cursor-not-allowed" disabled={deleteInput !== "ELIMINAR" || deleting}>
                      {deleting ? <div className="w-4 h-4 border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin motion-reduce:animate-none" /> : <AlertTriangle size={16} />}
                      Eliminar Cuenta
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
