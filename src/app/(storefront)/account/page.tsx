"use client";

import { useAuthStore } from "@/features/auth";

export default function AccountPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">ACCOUNT</h1>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ color: "rgb(140, 140, 140)", fontSize: "0.88rem" }}>
            Signed in as
          </p>
          <p
            style={{
              color: "#e6e6e6",
              fontWeight: 700,
              fontSize: "1rem",
              marginTop: "0.3rem",
            }}
          >
            {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="auth-btn"
          style={{ background: "rgb(220, 38, 38)" }}
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
