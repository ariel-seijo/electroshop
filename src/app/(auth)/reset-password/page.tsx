"use client";

import styles from "./ResetPassword.module.css";
import { useState, Suspense, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Eye, EyeOff, Check, ArrowLeft } from "lucide-react";
import { useToastStore } from "@/features/toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const toast = useToastStore((s) => s.toast);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (score <= 2) return { level: 1, label: "Debil", color: "#ef4444" };
    if (score <= 3) return { level: 2, label: "Media", color: "#f59e0b" };
    return { level: 3, label: "Fuerte", color: "#22c55e" };
  })();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (passwordsMismatch) return;

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      toast(data.message, "success");
      router.push("/login");
    } catch {
      setError("Error de conexión. Intentá de nuevo");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span>ELECTROSHOP</span>
          </div>

          <div className={styles.invalidToken}>
            <p>Enlace de restablecimiento inválido o faltante.</p>
            <Link href="/forgot-password" className={styles.link}>
              Solicitar un nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>ELECTROSHOP</span>
        </div>

        <h1 className={styles.title}>NUEVA CONTRASEÑA</h1>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Nueva Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className={styles.input}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.revealBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className={styles.strength}>
                <div className={styles.strengthBarContainer}>
                  <div
                    className={styles.strengthBar}
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

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirmar Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                className={`${styles.input} ${passwordsMismatch ? styles.inputError : ""}`}
                placeholder="Repetí tu contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.revealBtn}
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && (
              <span className={styles.fieldError}>
                Las contraseñas no coinciden
              </span>
            )}
            {!passwordsMismatch && confirmPassword && password === confirmPassword && (
              <span className={styles.fieldSuccess}>
                <Check size={14} />
                Las contraseñas coinciden
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordsMismatch}
            className={styles.btn}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                GUARDANDO...
              </>
            ) : (
              <>
                <KeyRound size={18} />
                GUARDAR CONTRASEÑA
              </>
            )}
          </button>
        </form>

        <p className={styles.footer}>
          <Link href="/login" className={styles.link}>
            <ArrowLeft size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card} />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
