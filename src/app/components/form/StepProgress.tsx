import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepProgress({ currentStep, totalSteps, labels }: StepProgressProps) {
  return (
    <div className="w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-on-surface-muted font-body">
          Step {currentStep} of {totalSteps}
        </span>
        {labels && labels[currentStep - 1] && (
          <span className="text-sm font-medium text-on-surface font-body">
            {labels[currentStep - 1]}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div key={stepNum} className="flex items-center flex-1 gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors motion-safe:transition-all motion-safe:duration-300 ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-primary-container text-white"
                      : "bg-surface-container-high text-on-surface-muted"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 rounded-full transition-colors motion-safe:transition-all motion-safe:duration-300 ${
                    isCompleted ? "bg-primary" : "bg-surface-container-high"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
