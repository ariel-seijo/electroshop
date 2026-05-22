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
import { formatPrice } from "@/lib/utils/currency";
import { updateUserRoleAction } from "@/features/admin/actions/userActions";
import { useToastStore } from "@/features/toast";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import UserActions from "./UserActions";
import styles from "./UserTable.module.css";

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
  if (status === "ACTIVE") return styles.statusActive;
  if (status === "BANNED") return styles.statusBanned;
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
  onSort?: (field: string) => void;
  onPage?: (page: number) => void;
  onViewOrders?: (user: { id: string; email: string; name?: string | null; createdAt?: string }) => void;
}

export default function UserTable({
  users,
  total,
  page,
  totalPages,
  sort = "createdAt",
  order = "desc",
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

    if ("error" in result) {
      toast(result.error, "error");
    } else {
      toast("Rol actualizado", "success");
    }
  }

  function handleRoleCancel() {
    setRoleConfirm({ isOpen: false, userId: null, newRole: null, userName: null, currentRole: null });
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <Users size={48} className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP TABLE */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-label="Lista de usuarios" role="grid">
          <caption className="visually-hidden">
            Usuarios — {total} registros, página {page} de {totalPages}
          </caption>
          <thead className={styles.thead}>
            <tr>
              <th scope="col" className={styles.thUser}>Usuario</th>
              {SORTABLE_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={styles.thSortable}
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
                    className={styles.sortBtn}
                    onClick={() => onSort?.(col.key)}
                    aria-label={`Ordenar por ${col.label}`}
                  >
                    {col.label}
                    <span className={sort === col.key ? styles.sortIconActive : styles.sortIconInactive}>
                      {sort === col.key ? (order === "asc" ? " ↑" : " ↓") : " ↑"}
                    </span>
                  </button>
                </th>
              ))}
              <th scope="col" className={styles.thMetric}>Órdenes</th>
              <th scope="col" className={styles.thMetric}>LTV</th>
              <th scope="col" className={styles.thToggle}>Estado</th>
              <th scope="col" className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.row}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.userAvatar}>
                      {user.name?.charAt(0) || "?"}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{user.name}</span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className={styles.dateCell}>
                  {new Date(user.createdAt).toLocaleDateString("es-AR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </td>
                <td className={styles.emailCell}>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value, user.name, user.role)}
                    className={styles.roleSelect}
                    disabled={roleLoading === user.id || user.deletedAt !== null}
                    aria-label={`Rol de ${user.name}`}
                  >
                    <option value="CUSTOMER">{ROLE_LABELS.CUSTOMER}</option>
                    <option value="ADMIN">{ROLE_LABELS.ADMIN}</option>
                  </select>
                </td>
                <td className={styles.metricCell}>{user._count?.orders ?? 0}</td>
                <td className={styles.metricCell}>
                  {user.lifetimeValue !== undefined && user.lifetimeValue !== null
                    ? formatPrice(user.lifetimeValue)
                    : "—"}
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
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
      <div className={styles.mobileCards}>
        {users.map((user) => (
          <article key={user.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.userAvatar}>
                {user.name?.charAt(0) || "?"}
              </div>
              <div className={styles.cardInfo}>
                <h4 className={styles.cardTitle}>{user.name}</h4>
                <span className={styles.cardEmail}>{user.email}</span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Estado</span>
                <span className={`${styles.statusBadge} ${getStatusClass(user.status)}`}>
                  {STATUS_LABELS[user.status] || user.status}
                </span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Rol</span>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value, user.name, user.role)}
                  className={styles.roleSelect}
                  disabled={roleLoading === user.id || user.deletedAt !== null}
                >
                  <option value="CUSTOMER">Cliente</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>Órdenes</span>
                <span className={styles.cardValue}>{user._count?.orders ?? 0}</span>
              </div>
              <div className={styles.cardRow}>
                <span className={styles.cardLabel}>LTV</span>
                <span className={styles.cardValue}>
                  {user.lifetimeValue !== undefined && user.lifetimeValue !== null
                    ? formatPrice(user.lifetimeValue)
                    : "—"}
                </span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <UserActions user={user} onViewOrders={onViewOrders} />
            </div>
          </article>
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Paginación de usuarios">
          <button
            type="button"
            className={styles.pageBtn}
            onClick={() => onPage?.(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.pageNumbers}>
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
                  <span key={n} className={styles.pageGroup}>
                    {showEllipsis && (
                      <span className={styles.ellipsis} aria-hidden="true">…</span>
                    )}
                    <button
                      type="button"
                      className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ""}`}
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
            className={styles.pageBtn}
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
