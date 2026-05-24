"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useToastStore } from "@/features/toast";

const inputBase =
  "w-full h-[50px] px-4 bg-surface-18 border border-border-44 text-text-body text-[0.95rem] outline-none transition-[border-color,box-shadow] duration-[250ms] placeholder:text-text-placeholder-dark placeholder:font-semibold focus:border-accent focus:shadow-[0_0_0_3px_rgba(36,171,243,0.08)] max-ms:h-[46px] max-ms:text-[0.9rem]";

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
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8 max-ms:px-3 max-ms:py-4">
      <div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#24abf3,#00cfff,#24abf3,transparent)] before:bg-[length:200%_100%] before:animate-auth-glow max-ms:px-[1.2rem] max-ms:py-8">
        <div className="text-center mb-8">
          <span className="font-cosmic text-[1.4rem] tracking-[4px] text-accent">
            ELECTROSHOP
          </span>
        </div>

        <h1 className="font-cosmic text-[1.8rem] font-thin tracking-[4px] text-text-secondary text-center m-0 mb-[1.8rem] [text-shadow:0_0_30px_rgba(36,171,243,0.15)] max-ms:text-[1.5rem]">
          INICIAR SESIÓN
        </h1>

        {error && (
          <div className="mb-5 py-3 px-4 bg-danger/10 border border-danger/25 text-danger-light text-[0.82rem] font-semibold leading-relaxed">
            {error.includes("incorrectos") ? (
              <>
                <strong className="text-red-300">Email o contraseña incorrectos.</strong> Verificá tus
                datos e intentá de nuevo.
              </>
            ) : (
              error
            )}
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
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] mt-2 border-none bg-[linear-gradient(135deg,#007fff,#00cfff)] text-[#111] text-[0.92rem] font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-center hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_10px_30px_rgba(0,127,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none max-ms:h-[48px]"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="inline-block size-[18px] border-2 border-[rgba(17,17,17,0.3)] border-t-[#111] rounded-full animate-[spin_0.6s_linear_infinite] mr-2 align-middle" />
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

        <p className="mt-6 text-center text-sm text-text-dim">
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/forgot-password" className="text-accent no-underline font-semibold transition-all duration-200 hover:text-accent-hover hover:underline">
            Recuperala
          </Link>
        </p>

        <p className="mt-2 text-center text-sm text-text-dim">
          ¿No tenés cuenta?{" "}
          <Link
            href={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="text-accent no-underline font-semibold transition-all duration-200 hover:text-accent-hover hover:underline"
          >
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
