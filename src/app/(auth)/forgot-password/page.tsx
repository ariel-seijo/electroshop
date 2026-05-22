"use client";

import styles from "./ForgotPassword.module.css";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useToastStore } from "@/features/toast";

export default function ForgotPasswordPage() {
  const toast = useToastStore((s) => s.toast);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Ingresá tu email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Formato de email inválido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      setSent(true);
      toast(data.message || "Revisá tu email para continuar", "success");
    } catch {
      setError("Error de conexión. Intentá de nuevo");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span>ELECTROSHOP</span>
          </div>

          <h1 className={styles.title}>REVISÁ TU EMAIL</h1>

          <div className={styles.success}>
            Te enviamos un enlace de restablecimiento a <strong>{email.trim().toLowerCase()}</strong>.
            Revisá tu bandeja de entrada (y la carpeta de spam) y seguí las instrucciones.
            El enlace expira en 1 hora.
          </div>

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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span>ELECTROSHOP</span>
        </div>

        <h1 className={styles.title}>RECUPERAR CONTRASEÑA</h1>

        <p className={styles.description}>
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className={styles.input}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                ENVIANDO...
              </>
            ) : (
              <>
                <Mail size={18} />
                ENVIAR ENLACE
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
