"use client";

import { useMemo, useCallback } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { limitNotes } from "@/lib/utils/input-formatters";
import MagicFillButton from "./MagicFillButton";
import styles from "../styles/ShippingForm.module.css";

const DEPARTMENTS = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
];

const SHIPPING_RULES = {
  fullName: { required: true },
  email: { required: true, email: true },
  address: { required: true },
  city: { required: true },
  department: { required: true },
  zip: { required: true },
} as const;

const MAX_NOTES_LENGTH = 500;

export default function ShippingForm() {
  const { shipping, setShippingField, autoFillShipping, goNext } =
    useCheckout();
  const { errors, validate, clearError } = useCheckoutForm(
    shipping as unknown as Record<string, unknown>,
    SHIPPING_RULES as unknown as Record<string, { [key: string]: boolean }>,
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let formatted = value;
      if (name === "notes") formatted = limitNotes(value);
      setShippingField(name, formatted);
      clearError(name);
    },
    [setShippingField, clearError]
  );

  const handleContinue = useCallback(() => {
    if (validate()) goNext();
  }, [validate, goNext]);

  const notesCount = (shipping.notes || "").length || 0;

  return (
    <div className={styles.form}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionHeaderLeft}>
          <MapPin size={20} />
          <h3>Información de Envío</h3>
        </div>
        <MagicFillButton onFill={autoFillShipping} />
      </div>

      <div className={styles.row}>
        <div
          className={`${styles.group} ${errors.fullName ? styles.groupError : ""}`}
        >
          <label>
            Nombre completo <span className={styles.required}>*</span>
          </label>
          <input
            name="fullName"
            value={shipping.fullName}
            onChange={handleChange}
            placeholder="Ej: Federico Giannoni"
            autoComplete="name"
          />
          {errors.fullName && (
            <span className={styles.error}>{errors.fullName}</span>
          )}
        </div>
      </div>

      <div className={`${styles.row} ${styles.row2}`}>
        <div
          className={`${styles.group} ${errors.email ? styles.groupError : ""}`}
        >
          <label>
            Email <span className={styles.required}>*</span>
          </label>
          <input
            name="email"
            type="email"
            value={shipping.email}
            onChange={handleChange}
            placeholder="federico@mail.com"
            autoComplete="email"
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        <div className={styles.group}>
          <label>Teléfono</label>
          <input
            name="phone"
            value={shipping.phone}
            onChange={handleChange}
            placeholder="+54 11..."
            autoComplete="tel"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div
          className={`${styles.group} ${errors.address ? styles.groupError : ""}`}
        >
          <label>
            Dirección <span className={styles.required}>*</span>
          </label>
          <input
            name="address"
            value={shipping.address}
            onChange={handleChange}
            placeholder="Calle, número, piso, depto"
            autoComplete="street-address"
          />
          {errors.address && (
            <span className={styles.error}>{errors.address}</span>
          )}
        </div>
      </div>

      <div className={`${styles.row} ${styles.row3}`}>
        <div
          className={`${styles.group} ${errors.city ? styles.groupError : ""}`}
        >
          <label>
            Ciudad <span className={styles.required}>*</span>
          </label>
          <input
            name="city"
            value={shipping.city}
            onChange={handleChange}
            placeholder="Ciudad"
            autoComplete="address-level2"
          />
          {errors.city && <span className={styles.error}>{errors.city}</span>}
        </div>
        <div
          className={`${styles.group} ${errors.department ? styles.groupError : ""}`}
        >
          <label>
            Provincia <span className={styles.required}>*</span>
          </label>
          <select
            name="department"
            value={shipping.department}
            onChange={handleChange}
            autoComplete="address-level1"
          >
            <option value="">Seleccionar</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className={styles.error}>{errors.department}</span>
          )}
        </div>
        <div
          className={`${styles.group} ${errors.zip ? styles.groupError : ""}`}
        >
          <label>
            Código Postal <span className={styles.required}>*</span>
          </label>
          <input
            name="zip"
            value={shipping.zip}
            onChange={handleChange}
            placeholder="CP"
            autoComplete="postal-code"
          />
          {errors.zip && <span className={styles.error}>{errors.zip}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.group}>
          <label>Notas adicionales (opcional)</label>
          <textarea
            name="notes"
            value={shipping.notes}
            onChange={handleChange}
            placeholder="Indicaciones para la entrega..."
            rows={3}
          />
          <span className={`${styles.charCount} ${notesCount >= MAX_NOTES_LENGTH ? styles.charCountLimit : ""}`}>
            {notesCount}/{MAX_NOTES_LENGTH}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleContinue}>
          Continuar al pago
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
