"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { useToastStore } from "@/features/toast";

const inputBase =
  "w-full h-[50px] px-4 bg-surface-18 border border-border-44 text-text-body text-[0.95rem] outline-none transition-[border-color,box-shadow] duration-[250ms] placeholder:text-text-placeholder-dark placeholder:font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(36,171,243,0.08)] max-ms:h-[46px] max-ms:text-[0.9rem]";

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
      <div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8 max-ms:px-3 max-ms:py-4">
        <div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#24abf3,#00cfff,#24abf3,transparent)] before:bg-[length:200%_100%] before:animate-auth-glow max-ms:px-[1.2rem] max-ms:py-8">
          <div className="text-center mb-8">
            <span className="font-cosmic text-[1.4rem] tracking-[4px] text-accent">
              ELECTROSHOP
            </span>
          </div>

          <h1 className="font-cosmic text-[1.8rem] font-thin tracking-[4px] text-text-secondary text-center m-0 mb-3 [text-shadow:0_0_30px_rgba(36,171,243,0.15)] max-ms:text-[1.5rem]">
            REVISÁ TU EMAIL
          </h1>

          <div className="mb-5 py-3.5 px-4 bg-success/10 border border-success/25 text-green-300 text-[0.82rem] font-semibold text-center">
            Te enviamos un enlace de restablecimiento a <strong>{email.trim().toLowerCase()}</strong>.
            Revisá tu bandeja de entrada (y la carpeta de spam) y seguí las instrucciones.
            El enlace expira en 1 hora.
          </div>

          <p className="mt-6 text-center text-[0.88rem] text-text-dim">
            <Link href="/login" className="text-accent no-underline font-semibold transition-all duration-200 hover:text-accent-hover hover:underline">
              <ArrowLeft size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8 max-ms:px-3 max-ms:py-4">
      <div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#24abf3,#00cfff,#24abf3,transparent)] before:bg-[length:200%_100%] before:animate-auth-glow max-ms:px-[1.2rem] max-ms:py-8">
        <div className="text-center mb-8">
          <span className="font-cosmic text-[1.4rem] tracking-[4px] text-accent">
            ELECTROSHOP
          </span>
        </div>

        <h1 className="font-cosmic text-[1.8rem] font-thin tracking-[4px] text-text-secondary text-center m-0 mb-[0.8rem] [text-shadow:0_0_30px_rgba(36,171,243,0.15)] max-ms:text-[1.5rem]">
          RECUPERAR CONTRASEÑA
        </h1>

        <p className="text-center text-[0.85rem] text-text-dim m-0 mb-[1.8rem]">
          Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && (
          <div className="mb-5 py-3 px-4 bg-danger/10 border border-danger/25 text-danger-light text-[0.82rem] font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-text-dim uppercase tracking-[1px]">
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
              className={inputBase}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] mt-2 border-none bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] text-[0.92rem] font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_10px_30px_rgba(0,127,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none max-ms:h-[48px]"
          >
            {loading ? (
              <>
                <span className="inline-block size-[18px] border-2 border-[rgba(17,17,17,0.3)] border-t-[#111] rounded-full animate-[spin_0.6s_linear_infinite]" />
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

        <p className="mt-6 text-center text-[0.88rem] text-text-dim">
          <Link href="/login" className="text-accent no-underline font-semibold transition-all duration-200 hover:text-accent-hover hover:underline">
            <ArrowLeft size={14} style={{ marginRight: "0.25rem", verticalAlign: "middle" }} />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
