"use client";

import { Check } from "lucide-react";

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
    <div className="flex items-center justify-center gap-0 mb-10 px-8 py-6 bg-surface-22 border border-[#1f1f1f] max-6lg:px-4 max-6lg:py-4 max-6lg:flex-wrap max-6lg:justify-center max-3md:px-2 max-3md:py-[0.8rem] max-3md:gap-[0.3rem]">
      {STEPS.map((label, i) => {
        const state = getState(i);
        const isDone = state === "done";
        const canClick = isDone && onStepClick;

        return (
          <div
            key={label}
            data-state={state}
            className={`flex items-center gap-2 relative ${
              canClick ? "cursor-pointer group" : ""
            }`}
            onClick={canClick ? () => onStepClick(i) : undefined}
          >
            <div
              className={`size-9 rounded-full flex items-center justify-center text-[0.85rem] font-semibold bg-border-34 text-text-placeholder border-2 border-border-52 transition-all duration-300 shrink-0
                data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:border-accent data-[state=active]:animate-step-pulse
                data-[state=done]:bg-accent data-[state=done]:text-[#111] data-[state=done]:border-accent
                group-hover:shadow-[0_0_12px_rgba(36,171,243,0.25)]
                max-3md:size-[30px] max-3md:text-xs`}
            >
              {isDone ? <Check size={16} /> : <span>{i + 1}</span>}
            </div>
            <span
              className={`text-[0.8rem] font-semibold uppercase tracking-[1px] text-text-placeholder transition-colors duration-300
                data-[state=active]:text-accent
                data-[state=done]:text-text-tertiary
                group-hover:text-accent
                max-3md:text-[0.68rem] max-3md:tracking-normal`}
              data-state={state}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`w-20 h-0.5 bg-border-52 mx-4 transition-colors duration-400
                  data-[state=done]:bg-accent
                  max-6lg:w-10 max-6lg:mx-2
                  max-3md:w-6 max-3md:mx-[0.3rem]`}
                data-state={state}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
