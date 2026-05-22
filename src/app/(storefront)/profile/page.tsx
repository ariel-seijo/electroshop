"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { useToastStore } from "@/features/toast";
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
import styles from "./Profile.module.css";

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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      updateUser({ name: data.user.name });
      toast("Nombre actualizado exitosamente", "success");
      setIsEditing(false);
    } catch (err) {
      toast((err as Error).message, "error");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setUser(null);
      toast("Cuenta eliminada exitosamente", "success");
      router.push("/");
    } catch (err) {
      toast((err as Error).message, "error");
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
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");
      toast("Contraseña actualizada exitosamente", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError((err as Error).message);
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
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          <div className={styles.sidebarAvatar}>
            {user?.role === "ADMIN" ? (
              <Shield size={36} />
            ) : (
              <User size={36} />
            )}
          </div>
          <span className={styles.sidebarName}>{displayName}</span>
          <span className={styles.sidebarEmail}>{user?.email}</span>
        </div>

        <nav className={styles.sidebarNav}>
          <span className={`${styles.sidebarLink} ${styles.sidebarLinkActive}`}>
            <User size={18} />
            Mi Información
          </span>
          <Link href="/orders" className={styles.sidebarLink}>
            <Package size={18} />
            Mis Pedidos
          </Link>
        </nav>

        <button onClick={handleLogout} className={styles.sidebarLogout}>
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </aside>

      <main className={styles.content}>
        <div className={styles.section}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Información de la Cuenta</h2>
              {!isEditing && (
                <button onClick={handleEditClick} className={styles.editBtn}>
                  <Pencil size={16} />
                  Editar
                </button>
              )}
            </div>

            <div className={styles.fields}>
              <div className={styles.field}>
                <span className={styles.label}>Nombre</span>
                {isEditing ? (
                  <div className={styles.editRow}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className={styles.input}
                      placeholder="Tu nombre"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                    />
                    <button onClick={handleSaveName} className={styles.saveBtn} disabled={saving || !nameInput.trim()}>
                      {saving ? <div className={styles.spinnerSmall} /> : <Check size={16} />}
                      Guardar
                    </button>
                    <button onClick={handleCancelEdit} className={styles.cancelBtn} disabled={saving}>
                      <X size={16} />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <span className={styles.value}>{displayName}</span>
                )}
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Correo Electrónico</span>
                <span className={styles.value}>{user?.email || "—"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Rol</span>
                <span className={styles.value}>{roleLabel}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Miembro desde</span>
                <span className={styles.value}>{memberSince}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.passwordTitleRow}>
                <Lock size={18} />
                <h2 className={styles.cardTitle}>Cambiar Contraseña</h2>
              </div>
            </div>

            <div className={styles.passwordFields}>
              {[{ label: "Contraseña Actual", value: currentPassword, setter: setCurrentPassword, show: showCurrentPassword, setShow: setShowCurrentPassword },
                { label: "Nueva Contraseña", value: newPassword, setter: setNewPassword, show: showNewPassword, setShow: setShowNewPassword, placeholder: "Mínimo 6 caracteres" },
                { label: "Confirmar Nueva Contraseña", value: confirmPassword, setter: setConfirmPassword, show: showConfirmPassword, setShow: setShowConfirmPassword, placeholder: "Repetí la nueva contraseña" }]
                .map((f, i) => (
                <div key={i} className={styles.passwordField}>
                  <span className={styles.label}>{f.label}</span>
                  <div className={styles.passwordInputWrap}>
                    <input
                      type={f.show ? "text" : "password"}
                      value={f.value}
                      onChange={(e) => f.setter(e.target.value)}
                      className={styles.passwordInput}
                      placeholder={f.placeholder || "••••••••"}
                    />
                    <button type="button" className={styles.revealBtn} onClick={() => f.setShow(!f.show)} tabIndex={-1} aria-label={f.show ? "Ocultar contraseña" : "Mostrar contraseña"}>
                      {f.show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {passwordError && <div className={styles.passwordError}>{passwordError}</div>}

            <button onClick={handleChangePassword} className={styles.passwordSaveBtn} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {changingPassword ? <div className={styles.spinnerSmall} /> : <Lock size={16} />}
              Cambiar Contraseña
            </button>
          </div>

          <div className={styles.divider} />

          <button onClick={handleDeleteClick} className={styles.deleteBtn}>
            <AlertTriangle size={16} />
            Eliminar Cuenta
          </button>

          {showDeleteConfirm && (
            <div className={styles.overlay} onClick={deleting ? undefined : handleCancelDelete}>
              <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmIconWrap}>
                  <AlertTriangle size={32} className={styles.confirmIcon} />
                </div>
                <h3 className={styles.confirmTitle}>¿Estás seguro?</h3>
                <p className={styles.confirmText}>
                  Esta acción es permanente y todos tus datos serán perdidos.
                  Para confirmar, escribí <strong>ELIMINAR</strong>.
                </p>
                <input
                  type="text"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value.toUpperCase())}
                  className={styles.confirmInput}
                  placeholder="ELIMINAR"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && deleteInput.toUpperCase() === "ELIMINAR") {
                      handleConfirmDelete();
                    }
                  }}
                />
                <div className={styles.confirmActions}>
                  <button onClick={handleCancelDelete} className={styles.confirmCancel} disabled={deleting}>Cancelar</button>
                  <button onClick={handleConfirmDelete} className={styles.confirmDelete} disabled={deleteInput !== "ELIMINAR" || deleting}>
                    {deleting ? <div className={styles.spinnerSmall} /> : <AlertTriangle size={16} />}
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
