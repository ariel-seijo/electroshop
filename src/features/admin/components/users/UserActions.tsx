"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Ban, Shield, UserCog, Trash2 } from "lucide-react";
import { toggleUserStatusAction, updateUserRoleAction, deleteUserAction } from "@/features/admin/actions/userActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";

interface UserActionsUser {
  id: string;
  email: string;
  status: string;
  role: string;
  name?: string | null;
  deletedAt?: string | Date | null;
}

interface UserActionsProps {
  user: UserActionsUser;
  onViewOrders?: (user: { id: string; email: string; name?: string | null; createdAt?: string }) => void;
}

type ActionType = "viewOrders" | "ban" | "unban" | "changeRole" | "delete";

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: "danger" | "primary";
  action: (() => Promise<void>) | null;
}

export default function UserActions({ user, onViewOrders }: UserActionsProps) {
  const toast = useToastStore((s) => s.toast);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flipUp, setFlipUp] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    variant: "danger",
    action: null,
  });

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setFlipUp(spaceBelow < 200);
    }
  }, [isOpen]);

  function toggleMenu() {
    setIsOpen((prev) => !prev);
  }

  function handleActionClick(actionType: ActionType) {
    setIsOpen(false);

    switch (actionType) {
      case "viewOrders":
        onViewOrders?.(user);
        return;
      case "ban":
        setConfirm({
          isOpen: true,
          title: "Banear usuario",
          message: `¿Estás seguro de que deseas banear a "${user.email}"? El usuario no podrá iniciar sesión.`,
          confirmLabel: "Banear",
          variant: "danger",
          action: handleToggleStatus,
        });
        return;
      case "unban":
        setConfirm({
          isOpen: true,
          title: "Desbanear usuario",
          message: `¿Estás seguro de que deseas desbanear a "${user.email}"?`,
          confirmLabel: "Desbanear",
          variant: "primary",
          action: handleToggleStatus,
        });
        return;
      case "delete":
        setConfirm({
          isOpen: true,
          title: "Eliminar usuario",
          message: `¿Estás seguro de que deseas eliminar a "${user.email}"? Esta acción es irreversible y anonimizará sus datos personales.`,
          confirmLabel: "Eliminar",
          variant: "danger",
          action: handleDelete,
        });
        return;
    }
  }

  async function handleToggleStatus() {
    setLoading(true);
    const result = await toggleUserStatusAction(user.id);
    setLoading(false);
    setConfirm((prev) => ({ ...prev, isOpen: false }));

    const statusErrorMsg = "error" in result ? result.error : undefined;
    if (statusErrorMsg) {
      toast(statusErrorMsg, "error");
    } else {
      const user = result.user as { status?: string };
      toast(
        user.status === "BANNED" ? "Usuario baneado" : "Usuario desbaneado",
        "success"
      );
    }
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteUserAction(user.id);
    setLoading(false);
    setConfirm((prev) => ({ ...prev, isOpen: false }));

    const deleteUserErrorMsg = "error" in result ? result.error : undefined;
    if (deleteUserErrorMsg) {
      toast(deleteUserErrorMsg, "error");
    } else {
      toast("Usuario eliminado", "success");
    }
  }

  function handleConfirmExecute() {
    confirm.action?.();
  }

  function handleConfirmCancel() {
    setConfirm((prev) => ({ ...prev, isOpen: false }));
  }

  const isDeleted = user.deletedAt !== null;
  const actions: { type: ActionType; label: string; icon: typeof Eye; show: boolean }[] = [
    { type: "viewOrders", label: "Ver pedidos", icon: Eye, show: true },
    { type: user.status === "BANNED" ? "unban" : "ban", label: user.status === "BANNED" ? "Desbanear" : "Banear", icon: Ban, show: !isDeleted },
    { type: "delete", label: "Eliminar", icon: Trash2, show: !isDeleted },
  ];

  return (
    <>
      <div className="relative inline-block" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          className="inline-flex items-center justify-center w-9 h-9 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(160,160,160)] rounded-md cursor-pointer transition-all duration-[0.15s] font-[inherit] hover:bg-[rgba(36,171,243,0.08)] hover:border-[rgba(36,171,243,0.25)] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 max-[640px]:min-w-11 max-[640px]:min-h-11"
          onClick={toggleMenu}
          aria-label="Acciones"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <MoreHorizontal size={16} />
        </button>

        {isOpen && (
          <div
            className={`absolute top-[calc(100%+4px)] right-0 min-w-[200px] bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)] p-1 z-[100] origin-top-right max-[640px]:min-w-[160px] max-[640px]:max-w-[calc(100vw-24px)] ${flipUp ? "top-auto bottom-[calc(100%+4px)] origin-bottom-right" : ""}`}
            style={{ animation: "slideDown 0.12s ease-out" }}
            role="menu"
          >
            {actions
              .filter((a) => a.show)
              .map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.type}
                    type="button"
                    className={`flex items-center gap-2.5 w-full px-3 py-2 border-0 bg-transparent text-[rgb(200,200,200)] text-[0.8rem] font-semibold font-[inherit] cursor-pointer rounded-md transition-all duration-[0.12s] text-left leading-none min-h-11 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:shrink-0 hover:bg-[rgba(255,255,255,0.04)] hover:text-[rgb(220,220,220)] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-[-2px] disabled:opacity-40 disabled:cursor-not-allowed ${action.type === "delete" ? "text-[rgb(252,165,165)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[rgb(248,113,113)]" : ""}`}
                    onClick={() => handleActionClick(action.type)}
                    role="menuitem"
                    disabled={loading}
                  >
                    <Icon size={14} />
                    {action.label}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirm.isOpen}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        variant={confirm.variant}
        onConfirm={handleConfirmExecute}
        onCancel={handleConfirmCancel}
        isConfirming={loading}
      />
    </>
  );
}
