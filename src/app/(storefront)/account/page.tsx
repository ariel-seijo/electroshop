"use client";

import { useAuthStore } from "@/features/auth";

export default function AccountPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-130px)] px-4 py-8">
      <div className="w-full max-w-[440px] bg-surface-22 border border-border-38 px-[2.2rem] py-10 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[linear-gradient(90deg,transparent,#24abf3,#00cfff,#24abf3,transparent)] before:bg-[length:200%_100%] before:animate-auth-glow">
        <h1 className="font-cosmic text-[1.8rem] font-thin tracking-[4px] text-text-secondary text-center m-0 mb-[1.8rem] [text-shadow:0_0_30px_rgba(36,171,243,0.15)]">
          ACCOUNT
        </h1>
        <div className="text-center mb-6">
          <p className="text-text-dim text-sm">
            Signed in as
          </p>
          <p className="text-[#e6e6e6] font-bold text-base mt-1">
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="w-full h-[52px] mt-2 border-none bg-[rgb(220,38,38)] text-white text-[0.92rem] font-semibold uppercase tracking-[1.5px] cursor-pointer transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2"
          style={{ background: "rgb(220, 38, 38)" }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
