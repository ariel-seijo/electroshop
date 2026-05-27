"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";
import { useToastStore } from "@/features/toast";

const inputBase =
  "w-full h-[50px] px-4 bg-surface-18 border border-border-44 text-text-body text-[0.95rem] outline-none transition-[border-color,box-shadow] duration-[250ms] placeholder:text-text-placeholder-dark placeholder:font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(36,171,243,0.08)] max-ms:h-[46px] max-ms:text-[0.9rem]";

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
    } catch (error) {
      console.error("[REGISTER ERROR]", error);
      // Error handled in store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8 max-ms:px-3 max-ms:py-4">
      <div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#24abf3,#00cfff,#24abf3,transparent)] before:bg-[length:200%_100%] before:animate-auth-glow max-ms:px-[1.2rem] max-ms:py-8">
        <div className="text-center mb-8">
          <span className="font-cosmic text-[1.4rem] tracking-[4px] text-accent">
            ELECTROSHOP
          </span>
        </div>

        <h1 className="font-cosmic text-[1.8rem] font-thin tracking-[4px] text-text-secondary text-center m-0 mb-[1.8rem] [text-shadow:0_0_30px_rgba(36,171,243,0.15)] max-ms:text-[1.5rem]">
          CREAR CUENTA
        </h1>

        {error && (
          <div className="mb-5 py-3 px-4 bg-danger/10 border border-danger/25 text-danger-light text-[0.82rem] font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-text-dim uppercase tracking-[1px]">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBase}
              placeholder="Tu nombre"
              autoComplete="name"
            />
          </div>

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
                clearError();
              }}
              className={inputBase}
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-text-dim uppercase tracking-[1px]">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError();
                }}
                className={inputBase}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none text-text-placeholder cursor-pointer p-1 flex items-center justify-center transition-colors duration-200 hover:text-accent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-[3px] bg-border-44 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width,background] duration-300"
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-dim uppercase tracking-[1px]">
              Confirmar Contraseña
            </label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`${inputBase} ${passwordsMismatch ? "border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]" : ""}`}
                placeholder="Repetí tu contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 bg-transparent border-none text-text-placeholder cursor-pointer p-1 flex items-center justify-center transition-colors duration-200 hover:text-accent"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordsMismatch && (
              <span className="text-[0.74rem] font-semibold text-danger-light">
                Las contraseñas no coinciden
              </span>
            )}
            {!passwordsMismatch && confirmPassword && password === confirmPassword && (
              <span className="text-[0.74rem] font-bold text-success flex items-center gap-1">
                <Check size={14} />
                Las contraseñas coinciden
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordsMismatch}
            className="w-full h-[52px] mt-2 border-none bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] text-[0.92rem] font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-center hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_10px_30px_rgba(0,127,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none max-ms:h-[48px]"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="inline-block size-[18px] border-2 border-[rgba(17,17,17,0.3)] border-t-[#111] rounded-full animate-[spin_0.6s_linear_infinite]" />
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

        <p className="mt-6 text-center text-sm text-text-dim">
          ¿Ya tenés cuenta?{" "}
          <Link
            href={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent no-underline font-semibold transition-all duration-200 hover:text-accent-hover hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
