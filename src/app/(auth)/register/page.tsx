"use client";

import "@/features/auth/styles/auth.css";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { useToastStore } from "@/features/toast";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { register, loading, error, clearError } = useAuthStore();
  const toast = useToastStore((s) => s.toast);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const passwordStrength = (() => {
    if (!password) return { level: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: 1, label: "Débil", color: "#ef4444" };
    if (score <= 3) return { level: 2, label: "Media", color: "#f59e0b" };
    return { level: 3, label: "Fuerte", color: "#22c55e" };
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    try {
      const user = await register(name, email, password, confirmPassword);
      toast(`¡Bienvenido, ${user.name || user.email}!`, "success");
      window.location.href = redirect || "/";
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span>ELECTROSHOP</span>
        </div>

        <h1 className="auth-title">CREAR CUENTA</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="name" className="auth-label">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="auth-input"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <div className="auth-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className="auth-input"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-reveal-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${(passwordStrength.level / 3) * 100}%`,
                      background: passwordStrength.color,
                    }}
                  />
                </div>
                <span style={{ color: passwordStrength.color, fontSize: "0.72rem", fontWeight: 800 }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword" className="auth-label">
              Confirmar Contraseña
            </label>
            <div className="auth-input-wrapper">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`auth-input ${passwordsMismatch ? "error" : ""}`}
                placeholder="Repetí tu contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-reveal-btn"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && (
              <span className="auth-input-error">
                Las contraseñas no coinciden
              </span>
            )}
            {!passwordsMismatch && confirmPassword && password === confirmPassword && (
              <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#22c55e", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <Check size={14} />
                Las contraseñas coinciden
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordsMismatch}
            className="auth-btn"
          >
            {loading ? (
              <span className="loading-text">
                <span className="spinner" />
                CREANDO CUENTA...
              </span>
            ) : (
              <>
                <UserPlus size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
                CREAR CUENTA
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta?{" "}
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="auth-link"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
