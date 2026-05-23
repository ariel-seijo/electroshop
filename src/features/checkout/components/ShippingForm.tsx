"use client";

import { useMemo, useCallback } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { useCheckout } from "../context/CheckoutContext";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import { limitNotes } from "@/lib/utils/input-formatters";
import MagicFillButton from "./MagicFillButton";

const DEPARTMENTS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
  "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones",
  "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe",
  "Santiago del Estero", "Tierra del Fuego", "Tucumán",
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

const formBase = "bg-surface-22 border border-[#1f1f1f] p-8 max-3md:px-[1.2rem] max-3md:py-[1.2rem]";
const sectionHeader = "flex items-center justify-between mb-[1.8rem] pb-4 border-b border-[#1f1f1f] max-3md:flex-col max-3md:items-start max-3md:gap-3";
const sectionHeaderLeft = "flex items-center gap-[0.6rem] [&>svg]:text-accent [&>h3]:m-0 [&>h3]:text-[1.15rem] [&>h3]:font-semibold [&>h3]:uppercase [&>h3]:tracking-[1.5px] [&>h3]:text-text-body";
const row = "mb-[1.2rem]";
const row2 = "grid grid-cols-2 gap-4 max-3md:grid-cols-1";
const row3 = "grid grid-cols-3 gap-4 max-3md:grid-cols-1";
const groupBase = "flex flex-col gap-[0.35rem] [&>label]:text-xs [&>label]:font-semibold [&>label]:uppercase [&>label]:tracking-[0.5px] [&>label]:text-text-dim";
const inputField = "px-[0.85rem] py-3 bg-surface-18 border border-border-42 text-text-body text-[0.92rem] outline-none transition-[border-color,box-shadow] duration-[250ms] focus:border-accent focus:shadow-[0_0_0_3px_rgba(36,171,243,0.1)]";
const requiredStar = "text-danger ml-[0.15rem]";
const btnPrimary = "flex items-center gap-2 px-[1.8rem] py-[0.85rem] text-[0.92rem] font-semibold uppercase tracking-[1px] border-none cursor-pointer transition-all duration-[250ms] bg-accent text-[#111] hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(36,171,243,0.35)] hover:-translate-y-px max-3md:px-[1.2rem] max-3md:py-[0.7rem] max-3md:text-[0.82rem]";
const actions = "mt-6 flex justify-end";
const selectField = `${inputField} cursor-pointer [&>option]:bg-surface-18 [&>option]:text-text-body`;

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
    <div className={formBase}>
      <div className={sectionHeader}>
        <div className={sectionHeaderLeft}>
          <MapPin size={20} />
          <h3>Información de Envío</h3>
        </div>
        <MagicFillButton onFill={autoFillShipping} />
      </div>

      <div className={row}>
        <div className={`${groupBase} ${errors.fullName ? "[&>input]:border-danger" : ""}`}>
          <label>Nombre completo <span className={requiredStar}>*</span></label>
          <input name="fullName" value={shipping.fullName} onChange={handleChange} placeholder="Ej: Federico Giannoni" autoComplete="name" className={inputField} />
          {errors.fullName && <span className="text-[0.72rem] font-semibold text-danger">{errors.fullName}</span>}
        </div>
      </div>

      <div className={`${row} ${row2}`}>
        <div className={`${groupBase} ${errors.email ? "[&>input]:border-danger" : ""}`}>
          <label>Email <span className={requiredStar}>*</span></label>
          <input name="email" type="email" value={shipping.email} onChange={handleChange} placeholder="federico@mail.com" autoComplete="email" className={inputField} />
          {errors.email && <span className="text-[0.72rem] font-semibold text-danger">{errors.email}</span>}
        </div>
        <div className={groupBase}>
          <label>Teléfono</label>
          <input name="phone" value={shipping.phone} onChange={handleChange} placeholder="+54 11..." autoComplete="tel" className={inputField} />
        </div>
      </div>

      <div className={row}>
        <div className={`${groupBase} ${errors.address ? "[&>input]:border-danger" : ""}`}>
          <label>Dirección <span className={requiredStar}>*</span></label>
          <input name="address" value={shipping.address} onChange={handleChange} placeholder="Calle, número, piso, depto" autoComplete="street-address" className={inputField} />
          {errors.address && <span className="text-[0.72rem] font-semibold text-danger">{errors.address}</span>}
        </div>
      </div>

      <div className={`${row} ${row3}`}>
        <div className={`${groupBase} ${errors.city ? "[&>input]:border-danger" : ""}`}>
          <label>Ciudad <span className={requiredStar}>*</span></label>
          <input name="city" value={shipping.city} onChange={handleChange} placeholder="Ciudad" autoComplete="address-level2" className={inputField} />
          {errors.city && <span className="text-[0.72rem] font-semibold text-danger">{errors.city}</span>}
        </div>
        <div className={`${groupBase} ${errors.department ? "[&>select]:border-danger" : ""}`}>
          <label>Provincia <span className={requiredStar}>*</span></label>
          <select name="department" value={shipping.department} onChange={handleChange} autoComplete="address-level1" className={selectField}>
            <option value="">Seleccionar</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errors.department && <span className="text-[0.72rem] font-semibold text-danger">{errors.department}</span>}
        </div>
        <div className={`${groupBase} ${errors.zip ? "[&>input]:border-danger" : ""}`}>
          <label>Código Postal <span className={requiredStar}>*</span></label>
          <input name="zip" value={shipping.zip} onChange={handleChange} placeholder="CP" autoComplete="postal-code" className={inputField} />
          {errors.zip && <span className="text-[0.72rem] font-semibold text-danger">{errors.zip}</span>}
        </div>
      </div>

      <div className={row}>
        <div className={groupBase}>
          <label>Notas adicionales (opcional)</label>
          <textarea name="notes" value={shipping.notes} onChange={handleChange} placeholder="Indicaciones para la entrega..." rows={3} className={`${inputField} resize-y min-h-20`} />
          <span className={`text-[0.72rem] font-semibold text-[rgb(100,100,100)] text-right ${notesCount >= MAX_NOTES_LENGTH ? "text-danger" : ""}`}>
            {notesCount}/{MAX_NOTES_LENGTH}
          </span>
        </div>
      </div>

      <div className={actions}>
        <button className={btnPrimary} onClick={handleContinue}>
          Continuar al pago
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
