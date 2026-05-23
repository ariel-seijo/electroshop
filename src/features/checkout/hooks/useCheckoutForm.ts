import { useState, useCallback } from "react";

type RuleChecker = (v: string, param?: number) => boolean;

const RULES: Record<string, RuleChecker> = {
  required: (v) => (typeof v === "string" && v.trim().length > 0),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  minLength: (v, min = 0) => typeof v === "string" && v.trim().length >= min,
};

const MESSAGES: Record<string, string> = {
  required: "Requerido",
  email: "Email inválido",
  minLength: "Demasiado corto",
};

interface FieldRules {
  required?: boolean;
  email?: boolean;
  minLength?: number;
}

interface CheckoutFormResult {
  errors: Record<string, string>;
  validate: () => boolean;
  clearError: (name: string) => void;
  isValid: boolean;
}

export function useCheckoutForm(
  fields: Record<string, unknown>,
  ruleSet: Record<string, FieldRules>
): CheckoutFormResult {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    for (const [name, value] of Object.entries(fields)) {
      const rules = ruleSet[name];
      if (!rules) continue;
      for (const [rule, param] of Object.entries(rules)) {
        const checker = RULES[rule];
        if (!checker) continue;
        const passes = param === true ? checker(value as string) : checker(value as string, param as number);
        if (!passes) {
          errs[name] = MESSAGES[rule] || rule;
          break;
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [fields, ruleSet]);

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return { errors, validate, clearError, isValid };
}
