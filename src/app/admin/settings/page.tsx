"use client";

import { useState, useEffect } from "react";
import { Settings, Lock, Eye, EyeOff, DollarSign, Loader2, AlertTriangle } from "lucide-react";
import { useToastStore } from "@/features/toast";
import { getErrorMessage } from "@/lib/errors";
import { invalidateExchangeRate } from "@/lib/utils/currency";

export default function SettingsPage() {
  const toast = useToastStore((s) => s.toast);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [usdToArs, setUsdToArs] = useState("");
  const [loadingRate, setLoadingRate] = useState(true);
  const [savingRate, setSavingRate] = useState(false);
  const [rateError, setRateError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    async function fetchRate() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data: { usdToArs?: number } = await res.json();
          setUsdToArs(data.usdToArs?.toString() || "1400");
        }
      } catch {
        setUsdToArs("1400");
      } finally {
        setLoadingRate(false);
      }
    }
    fetchRate();
  }, []);

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Todos los campos son obligatorios");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cambiar contraseña");
      toast("Contraseña actualizada exitosamente", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleOpenConfirm = () => {
    const numValue = Number(usdToArs);
    if (!usdToArs || isNaN(numValue) || numValue <= 0) {
      setRateError("Ingresá un valor de dólar válido");
      return;
    }
    setRateError("");
    setConfirmInput("");
    setShowConfirmModal(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmInput("");
  };

  const handleConfirmSave = async () => {
    if (confirmInput !== "CONFIRMAR") return;
    setSavingRate(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usdToArs: Number(usdToArs) }),
      });
      const data: { usdToArs: number; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      invalidateExchangeRate(data.usdToArs);
      setUsdToArs(data.usdToArs.toString());
      toast("Tipo de cambio actualizado exitosamente", "success");
      setShowConfirmModal(false);
      setConfirmInput("");
    } catch (err) {
      toast(getErrorMessage(err), "error");
    } finally {
      setSavingRate(false);
    }
  };

  const newRateNumeric = Number(usdToArs);

  return (
    <div>
      <h2 className="admin-card-title admin-card-title-with-icon page-title-spacing">
        <Settings size={20} color="var(--admin-primary-glow)" aria-hidden="true" />
        Ajustes
      </h2>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title-with-icon">
            <Lock size={16} color="var(--admin-primary-glow)" aria-hidden="true" />
            <h3 className="admin-card-title">Cambiar Contraseña</h3>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
          <div style={{ position: "relative" }}>
            <input type={showCurrentPassword ? "text" : "password"} id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-input" placeholder="••••••••" style={{ paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--admin-muted)", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" }} aria-label={showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
          <div style={{ position: "relative" }}>
            <input type={showNewPassword ? "text" : "password"} id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-input" placeholder="Mínimo 6 caracteres" style={{ paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--admin-muted)", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" }} aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
          <div style={{ position: "relative" }}>
            <input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-input" placeholder="Repetí la nueva contraseña" style={{ paddingRight: "44px" }} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "4px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--admin-muted)", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center" }} aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {passwordError && <div className="form-error" role="alert">{passwordError}</div>}

        <div style={{ paddingTop: "8px" }}>
          <button onClick={handleChangePassword} className="btn btn-primary" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
            {changingPassword ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" /> : <Lock size={16} />}
            Cambiar Contraseña
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ marginTop: "24px" }}>
        <div className="admin-card-header">
          <div className="admin-card-title-with-icon">
            <DollarSign size={16} color="var(--admin-primary-glow)" aria-hidden="true" />
            <h3 className="admin-card-title">Tipo de Cambio USD → ARS</h3>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="usdToArs">Precio del Dólar (ARS)</label>
          {loadingRate ? <div className="loading-spinner" /> : (
            <input type="number" id="usdToArs" value={usdToArs} onChange={(e) => { setUsdToArs(e.target.value); setRateError(""); }} className={`form-input${rateError ? " form-input-error" : ""}`} placeholder="1400" step="0.01" min="0.01" aria-invalid={!!rateError} aria-describedby={rateError ? "rate-error" : undefined} />
          )}
          {rateError && <div className="form-error" id="rate-error" role="alert">{rateError}</div>}
          <span className="form-hint">Este valor se usa en toda la tienda para convertir precios de USD a ARS.</span>
        </div>

        <div style={{ paddingTop: "8px" }}>
          <button onClick={handleOpenConfirm} className="btn btn-primary" disabled={loadingRate || savingRate || !usdToArs || isNaN(newRateNumeric) || newRateNumeric <= 0}>
            <DollarSign size={16} />
            Guardar
          </button>
        </div>
      </div>

      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }} onClick={savingRate ? undefined : handleCancelConfirm}>
          <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)", borderRadius: "var(--admin-radius)", padding: "32px", maxWidth: "420px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <AlertTriangle size={36} style={{ color: "var(--admin-primary-glow)", marginBottom: "12px" }} />
              <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "var(--admin-text)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>Confirmar Cambio</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--admin-muted)", lineHeight: 1.5, margin: 0 }}>
                Estás por modificar el tipo de cambio de{" "}
                <strong style={{ color: "var(--admin-text)" }}>$1 USD = ${Number(usdToArs).toLocaleString("es-AR", { minimumFractionDigits: 2 })} ARS</strong>
                . Este valor se aplicará a todos los precios de la tienda.
                Para confirmar, escribí <strong style={{ color: "var(--admin-primary-glow)" }}>CONFIRMAR</strong>.
              </p>
            </div>
            <input type="text" value={confirmInput} onChange={(e) => setConfirmInput(e.target.value)} className="form-input" placeholder="CONFIRMAR" autoFocus onKeyDown={(e) => { if (e.key === "Enter" && confirmInput === "CONFIRMAR") { handleConfirmSave(); } }} style={{ textAlign: "center", letterSpacing: "2px", fontWeight: 800 }} />
            <div style={{ display: "flex", gap: "10px", marginTop: "16px", justifyContent: "flex-end" }}>
              <button onClick={handleCancelConfirm} className="btn btn-secondary" disabled={savingRate}>Cancelar</button>
              <button onClick={handleConfirmSave} className="btn btn-primary" disabled={confirmInput !== "CONFIRMAR" || savingRate}>
                {savingRate ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} aria-hidden="true" /> : <AlertTriangle size={16} />}
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
