"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToastStore } from "@/features/toast";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { login, loading, error, clearError } = useAuthStore();
  const toast = useToastStore((s) => s.toast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast(`¡Bienvenido de nuevo, ${user.name || user.email}!`, "success");
      window.location.href =
        redirect || (user.role === "ADMIN" ? "/admin" : "/");
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

        <h1 className="auth-title">INICIAR SESIÓN</h1>

        {error && (
          <div className="auth-error">
            {error.includes("incorrectos") ? (
              <>
                <strong>Email o contraseña incorrectos.</strong> Verificá tus
                datos e intentá de nuevo.
              </>
            ) : (
              error
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? (
              <span className="loading-text">
                <span className="spinner" />
                INGRESANDO...
              </span>
            ) : (
              <>
                <LogIn size={18} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
                INGRESAR
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/forgot-password" className="auth-link">
            Recuperala
          </Link>
        </p>

        <p className="auth-footer" style={{ marginTop: "0.5rem" }}>
          ¿No tenés cuenta?{" "}
          <Link
            href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="auth-link"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
