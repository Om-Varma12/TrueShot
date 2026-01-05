import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStep {
  label: string;
  status: "pending" | "processing" | "complete";
}

interface ProcessingStateProps {
  steps: ProcessingStep[];
  title: string;
}

export function ProcessingState({ steps, title }: ProcessingStateProps) {
  const currentStep = steps.findIndex((s) => s.status === "processing");
  const progress =
    currentStep === -1
      ? 100
      : ((steps.filter((s) => s.status === "complete").length / steps.length) * 100);

  return (
    <div className="glass-card-elevated p-6 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we process your media...
        </p>
      </div>

      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute inset-y-0 left-0 bg-primary/50 rounded-full animate-pulse"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
              step.status === "complete" && "bg-success/5",
              step.status === "processing" && "bg-primary/5"
            )}
          >
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300",
                step.status === "pending" && "bg-secondary text-muted-foreground",
                step.status === "processing" && "bg-primary/20 text-primary",
                step.status === "complete" && "bg-success/20 text-success"
              )}
            >
              {step.status === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : step.status === "processing" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                step.status === "pending" && "text-muted-foreground",
                step.status === "processing" && "text-foreground",
                step.status === "complete" && "text-success"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
