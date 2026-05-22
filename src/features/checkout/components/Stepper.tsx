"use client";

import { Check } from "lucide-react";
import styles from "../styles/Stepper.module.css";

const STEPS = ["Envío", "Pago", "Revisión"];

interface StepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function Stepper({ currentStep, onStepClick }: StepperProps) {
  const getState = (i: number) => {
    if (i < currentStep) return "done";
    if (i === currentStep) return "active";
    return "pending";
  };

  return (
    <div className={styles.stepper}>
      {STEPS.map((label, i) => {
        const state = getState(i);
        const isDone = state === "done";
        const canClick = isDone && onStepClick;

        return (
          <div
            key={label}
            className={`${styles.step} ${canClick ? styles.clickable : ""}`}
            data-state={state}
            onClick={canClick ? () => onStepClick(i) : undefined}
          >
            <div className={styles.indicator}>
              {isDone ? <Check size={16} /> : <span>{i + 1}</span>}
            </div>
            <span className={styles.label}>{label}</span>
            {i < STEPS.length - 1 && <div className={styles.line} />}
          </div>
        );
      })}
    </div>
  );
}
