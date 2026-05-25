"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Check,
  X as XIcon,
} from "lucide-react";
import { formatArs } from "@/lib/utils/currency";
import { updateUserRoleAction } from "@/features/admin/actions/userActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import UserActions from "./UserActions";

export interface TableUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string | Date;
  deletedAt: string | Date | null;
  _count?: { orders?: number };
  lifetimeValue?: number;
}

const SORTABLE_COLUMNS = [
  { key: "createdAt", label: "Fecha" },
  { key: "email", label: "Email" },
  { key: "role", label: "Rol" },
];

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  BANNED: "Baneado",
};

function getStatusClass(status: string): string {
  if (status === "ACTIVE") return "bg-[rgba(34,197,94,0.08)] border-[1.5px] border-[rgba(34,197,94,0.3)] text-[#4ade80]";
  if (status === "BANNED") return "bg-[rgba(239,68,68,0.08)] border-[1.5px] border-[rgba(239,68,68,0.3)] text-[#f87171]";
  return "";
}

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Admin",
};

interface UserTableProps {
  users: TableUser[];
  total: number;
  page: number;
  totalPages: number;
  sort?: string;
  order?: "asc" | "desc";
  exchangeRate: number;
  onSort?: (field: string) => void;
  onPage?: (page: number) => void;
  onViewOrders?: (user: { id: string; email: string; name?: string | null; createdAt?: string }) => void;
}

const TABLE = "w-full border-collapse text-[0.82rem] [&_caption]:text-[0.85rem] [&_caption]:font-semibold [&_caption]:text-[rgb(180,180,180)] [&_caption]:text-left [&_caption]:px-4 [&_caption]:py-3 [&_caption]:caption-top [&_tbody_tr]:transition-[background,box-shadow] [&_tbody_tr]:duration-[0.15s] [&_tbody_tr]:relative [&_tbody_tr:nth-child(even)]:bg-[rgba(255,255,255,0.01)] [&_tbody_tr:hover]:bg-[rgba(36,171,243,0.03)] [&_tbody_tr:hover]:shadow-[inset_3px_0_0_rgba(36,171,243,0.5)] [&_tbody_tr:focus-within]:bg-[rgba(36,171,243,0.04)] [&_tbody_tr:focus-within]:outline [&_tbody_tr:focus-within]:outline-1 [&_tbody_tr:focus-within]:outline-[rgba(36,171,243,0.2)] [&_tbody_tr:focus-within]:outline-offset-[-1px] [&_td]:px-3.5 [&_td]:py-3 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.04)] [&_td]:align-middle [&_td]:text-[rgb(200,200,200)]";

const ROLE_SELECT = "py-1 pl-2.5 pr-6 border border-[rgb(42,42,42)] rounded-md bg-[rgb(16,16,16)] text-[#e4e4e4] text-[0.78rem] font-semibold font-[inherit] cursor-pointer transition-colors duration-[0.12s] appearance-none bg-no-repeat [background-position:right_6px_center] min-w-[90px] hover:border-[rgba(36,171,243,0.25)] focus:border-[#24abf3] focus:outline-none focus:shadow-[0_0_10px_rgba(36,171,243,0.08)] disabled:opacity-40 disabled:cursor-not-allowed bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%239a9a9a' d='M5 7L1 3h8z'/%3E%3C/svg%3E\")]";

const STATUS_BADGE = "inline-flex items-center gap-1.5 py-1 px-2.5 rounded-[5px] text-[0.72rem] font-semibold";

const PAGE_BTN = "inline-flex items-center justify-center min-w-9 h-9 px-2 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[rgb(180,180,180)] rounded-md text-[0.78rem] font-semibold cursor-pointer transition-all duration-[0.15s] font-[inherit] shrink-0 hover:bg-[rgba(36,171,243,0.06)] hover:border-[rgba(36,171,243,0.2)] hover:text-[rgb(220,220,220)] disabled:opacity-30 disabled:cursor-not-allowed max-[640px]:min-w-11 max-[640px]:h-11";
const PAGE_BTN_ACTIVE = "bg-[rgba(36,171,243,0.1)] border-[rgba(36,171,243,0.3)] text-[#24abf3]";

const USER_AVATAR = "w-8 h-8 rounded-md bg-[rgba(36,171,243,0.1)] border border-[rgba(36,171,243,0.2)] flex items-center justify-center text-[0.78rem] font-bold text-[#24abf3] shrink-0";

export default function UserTable({
  users,
  total,
  page,
  totalPages,
  sort = "createdAt",
  order = "desc",
  exchangeRate,
  onSort,
  onPage,
  onViewOrders,
}: UserTableProps) {
  const toast = useToastStore((s) => s.toast);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [roleConfirm, setRoleConfirm] = useState<{
    isOpen: boolean;
    userId: string | null;
    newRole: string | null;
    userName: string | null;
    currentRole: string | null;
  }>({ isOpen: false, userId: null, newRole: null, userName: null, currentRole: null });

  function handleRoleChange(userId: string, newRole: string, userName: string | null, currentRole: string) {
    setRoleConfirm({ isOpen: true, userId, newRole, userName, currentRole });
  }

  async function handleRoleConfirm() {
    if (!roleConfirm.userId || !roleConfirm.newRole) return;
    setRoleConfirm((prev) => ({ ...prev, isOpen: false }));
    setRoleLoading(roleConfirm.userId);

    const result = await updateUserRoleAction(roleConfirm.userId, roleConfirm.newRole);
    setRoleLoading(null);

    const roleErrorMsg = "error" in result ? result.error : undefined;
    if (roleErrorMsg) {
      toast(roleErrorMsg, "error");
    } else {
      toast("Rol actualizado", "success");
    }
  }

  function handleRoleCancel() {
    setRoleConfirm({ isOpen: false, userId: null, newRole: null, userName: null, currentRole: null });
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center px-6 py-14 text-[rgb(130,130,130)]" role="status">
        <Users size={48} className="mb-3.5 opacity-30" aria-hidden="true" />
        <p className="text-[0.88rem] font-semibold m-0">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className="border border-[rgba(255,255,255,0.05)] rounded-[10px] overflow-x-auto bg-[rgba(12,12,12,0.95)] shadow-[0_0_20px_rgba(36,171,243,0.03),0_4px_24px_rgba(0,0,0,0.5)] max-[640px]:hidden">
        <table className={TABLE} aria-label="Lista de usuarios" role="grid">
          <caption className="visually-hidden">
            Usuarios — {total} registros, página {page} de {totalPages}
          </caption>
          <thead className="sticky top-0 z-10 [&_th]:px-3.5 [&_th]:py-3 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[0.68rem] [&_th]:text-[rgb(160,160,160)] [&_th]:uppercase [&_th]:tracking-[0.8px] [&_th]:bg-[rgba(16,16,16,0.98)] [&_th]:backdrop-blur-md [&_th]:border-b [&_th]:border-[rgba(36,171,243,0.12)] [&_th]:whitespace-nowrap">
            <tr>
              <th scope="col" className="min-w-[200px]">Usuario</th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className="min-w-[100px]"
                  aria-sort={
                    sort === col.key
                      ? order === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 bg-transparent border-0 text-inherit font-[inherit] text-[0.68rem] font-semibold uppercase tracking-[0.8px] cursor-pointer py-1 px-1.5 rounded transition-colors duration-[0.15s] hover:text-[#24abf3] focus-visible:outline-2 focus-visible:outline-[#24abf3] focus-visible:outline-offset-2 group"
                    onClick={() => onSort?.(col.key)}
                    aria-label={`Ordenar por ${col.label}`}
                  >
                    {col.label}
                    <span className={sort === col.key ? "opacity-100 text-[#24abf3]" : "opacity-0 transition-opacity duration-[0.15s] group-hover:opacity-40"}>
                      {sort === col.key ? (order === "asc" ? " ↑" : " ↓") : " ↑"}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col" className="min-w-[80px]">Órdenes</th>
              <th scope="col" className="min-w-[80px]">LTV</th>
              <th scope="col" className="w-20 shrink-0 text-center">Estado</th>
              <th scope="col" className="w-[60px] shrink-0 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <div className={USER_AVATAR}>
                      {user.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-[rgb(220,220,220)] text-[0.84rem]">{user.name}</span>
                      <span className="text-[0.72rem] text-[rgb(130,130,130)]">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className="text-[0.78rem] text-[rgb(140,140,140)] whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className="text-[0.78rem] text-[rgb(140,140,140)] whitespace-nowrap">{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value, user.name, user.role)}
                    className={ROLE_SELECT}
                    disabled={roleLoading === user.id || user.deletedAt !== null}
                    aria-label={`Rol de ${user.name}`}
                  >
                    <option value="CUSTOMER">{ROLE_LABELS.CUSTOMER}</option>
                    <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                  </select>
                </td>
                <td className="font-mono font-semibold text-[0.84rem] text-[rgb(200,200,200)]">{user._count?.orders ?? 0}</td>
                <td className="font-mono font-semibold text-[0.84rem] text-[rgb(200,200,200)]">
                  {user.lifetimeValue !== undefined && user.lifetimeValue !== null
                    ? formatArs(user.lifetimeValue * exchangeRate)
                    : "—"}
                </td>
                <td>
                  <span className={`${STATUS_BADGE} ${getStatusClass(user.status)}`}>
                    {user.status === "ACTIVE" ? <Check size={12} /> : <XIcon size={12} />}
                    {STATUS_LABELS[user.status] || user.status}
                  </span>
                </td>
                <td>
                  <UserActions user={user} onViewOrders={onViewOrders} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="hidden max-[640px]:flex max-[640px]:flex-col max-[640px]:gap-3">
        {users.map((user) => (
          <article key={user.id} className="bg-[rgb(14,14,14)] border border-[rgba(255,255,255,0.05)] rounded-[10px] p-3.5 transition-colors duration-200 transition-shadow duration-200 hover:border-[rgba(36,171,243,0.15)] hover:shadow-[0_0_12px_rgba(36,171,243,0.05)]">
            <div className="flex items-center justify-between mb-2.5">
              <div className={USER_AVATAR}>
                {user.name?.charAt(0) || "?"}
              </div>
              <div className="flex flex-col gap-[3px] min-w-0">
                <h4 className="text-[0.9rem] font-semibold text-[#e4e4e4] m-0">{user.name}</h4>
                <span className="text-[0.72rem] text-[rgb(145,145,145)]">{user.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 py-2.5 border-t border-b border-[rgba(255,255,255,0.05)] mb-2.5">
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Estado</span>
                <span className={`${STATUS_BADGE} ${getStatusClass(user.status)}`}>
                  {STATUS_LABELS[user.status] || user.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Rol</span>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value, user.name, user.role)}
                  className={ROLE_SELECT}
                  disabled={roleLoading === user.id || user.deletedAt !== null}
                >
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">Órdenes</span>
                <span className="text-[0.82rem] font-semibold text-[#e4e4e4] max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right">{user._count?.orders ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.7rem] font-semibold text-[rgb(145,145,145)] uppercase tracking-[0.5px]">LTV</span>
                <span className="text-[0.82rem] font-semibold text-[#e4e4e4] max-w-[60%] overflow-hidden text-ellipsis whitespace-nowrap text-right">
                  {user.lifetimeValue !== undefined && user.lifetimeValue !== null
                    ? formatArs(user.lifetimeValue * exchangeRate)
                    : "—"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <UserActions user={user} onViewOrders={onViewOrders} />
            </div>
          </article>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 px-4 py-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(16,16,16,0.98)] max-[640px]:flex-wrap max-[640px]:gap-1" aria-label="Paginación de usuarios">
          <button
            type="button"
            className={PAGE_BTN}
            onClick={() => onPage?.(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-1 max-[640px]:flex-wrap max-[640px]:justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => {
                if (totalPages <= 7) return true;
                if (n === 1 || n === totalPages) return true;
                if (Math.abs(n - page) <= 1) return true;
                return false;
              })
              .map((n, idx, arr) => {
                const showEllipsis = idx > 0 && n - arr[idx - 1] > 1;
                return (
                  <span key={n} className="flex items-center">
                    {showEllipsis && (
                      <span className="inline-flex items-center justify-center min-w-9 h-9 text-[rgb(100,100,100)] text-[0.85rem] select-none" aria-hidden="true">…</span>
                    )}
                    <button
                      type="button"
                      className={`${PAGE_BTN} ${n === page ? PAGE_BTN_ACTIVE : ""}`}
                      onClick={() => onPage?.(n)}
                      aria-current={n === page ? "page" : undefined}
                      aria-label={`Página ${n}`}
                    >
                      {n}
                    </button>
                  </span>
                );
              })}
          </div>

          <button
            type="button"
            className={PAGE_BTN}
            onClick={() => onPage?.(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      <ConfirmModal
        isOpen={roleConfirm.isOpen}
        title="Cambiar rol"
        message={`¿Cambiar el rol de "${roleConfirm.userName}" de ${roleConfirm.currentRole ? ROLE_LABELS[roleConfirm.currentRole] : ""} a ${roleConfirm.newRole ? ROLE_LABELS[roleConfirm.newRole] : ""}?`}
        confirmLabel="Cambiar rol"
        variant="primary"
        onConfirm={handleRoleConfirm}
        onCancel={handleRoleCancel}
        isConfirming={false}
      />
    </>
  );
}
