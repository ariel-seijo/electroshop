"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X, Loader2 } from "lucide-react";

type UserRole = "CUSTOMER" | "ADMIN";
type UserStatus = "ACTIVE" | "BANNED";

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password: string;
}

interface UserRecord {
  name: string;
  email: string;
  role: string;
  status: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  user?: UserRecord | null;
  onClose: () => void;
  onSubmit: (formData: UserFormData) => Promise<void>;
}

type FormErrors = Partial<Record<keyof UserFormData, string>>;

const initialFormState: UserFormData = {
  name: "",
  email: "",
  role: "CUSTOMER",
  status: "ACTIVE",
  password: "",
};

export default function UserFormModal({
  isOpen,
  user,
  onClose,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = !!user;

  const [formData, setFormData] = useState<UserFormData>(() => {
    if (user) {
      return {
        name: user.name || "",
        email: user.email || "",
        role: (user.role as UserRole) || "CUSTOMER",
        status: (user.status as UserStatus) || "ACTIVE",
        password: "",
      };
    }
    return initialFormState;
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email || "",
          role: (user.role as UserRole) || "CUSTOMER",
          status: (user.status as UserStatus) || "ACTIVE",
          password: "",
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (!isEdit && formData.password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    if (!isSubmitting) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose} role="presentation">
      <div
        className="modal-content modal-content-confirm"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
      >
        <div className="modal-header modal-header-confirm">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <h3 className="modal-title" id="user-form-title">
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </h3>
          </div>
          <button
            className="modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form" noValidate>
          <div className="form-group">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? "input-error" : ""}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Nombre del usuario"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <span className="form-error" id="name-error" role="alert">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? "input-error" : ""}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <span className="form-error" id="email-error" role="alert">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">Rol</label>
            <select
              id="role"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">Estado</label>
            <select
              id="status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Activo</option>
              <option value="BANNED">Baneado</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              {isEdit ? "Nueva contraseña (dejar vacío para mantener)" : "Contraseña"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? "input-error" : ""}`}
              value={formData.password}
              onChange={handleChange}
              placeholder={isEdit ? "••••••••" : "Contraseña"}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            {errors.password && (
              <span className="form-error" id="password-error" role="alert">{errors.password}</span>
            )}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} style={{ marginRight: 6, animation: "spin 0.6s linear infinite" }} />
                  {isEdit ? "Actualizando..." : "Creando..."}
                </>
              ) : isEdit ? (
                "Actualizar"
              ) : (
                "Crear usuario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
