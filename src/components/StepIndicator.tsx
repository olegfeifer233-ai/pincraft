"use client";

import { Search, BarChart3, FileText, Check } from "lucide-react";

type Step = "idle" | "analyzing" | "analyzed" | "generating" | "done";

interface StepIndicatorProps {
  currentStep: Step;
}

const steps = [
  { id: "analyzing", label: "SEO Анализ", icon: Search },
  { id: "analyzed", label: "Отчёт", icon: BarChart3 },
  { id: "generating", label: "Контент пина", icon: FileText },
  { id: "done", label: "Готово", icon: Check },
];

function getStepStatus(
  stepId: string,
  currentStep: Step
): "done" | "active" | "pending" {
  const order = ["analyzing", "analyzed", "generating", "done"];
  const currentIdx = order.indexOf(currentStep);
  const stepIdx = order.indexOf(stepId);

  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  if (currentStep === "idle") return null;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-4 animate-fade-in">
      {steps.map((step, i) => {
        const status = getStepStatus(step.id, currentStep);
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  status === "done"
                    ? "bg-green-100 text-green-600"
                    : status === "active"
                      ? "bg-primary text-white"
                      : "bg-accent text-muted"
                }`}
              >
                {status === "done" ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  status === "active"
                    ? "font-medium text-foreground"
                    : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px ${
                  status === "done" ? "bg-green-300" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
