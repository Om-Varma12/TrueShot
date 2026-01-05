import { CheckCircle2, AlertTriangle, XCircle, Download, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { HashDisplay } from "./HashDisplay";
import { cn } from "@/lib/utils";

type VerificationStatus = "authentic" | "tampered" | "invalid";

interface VerificationResultProps {
  status: VerificationStatus;
  originalHash: string;
  currentHash: string;
  timestamp?: string;
  metadata?: Record<string, string>;
  onReset: () => void;
}

const statusConfig = {
  authentic: {
    icon: CheckCircle2,
    title: "Image is Authentic",
    description: "No alterations detected. Signature valid.",
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success/20",
    glowClass: "shadow-glow-success",
  },
  tampered: {
    icon: AlertTriangle,
    title: "Content Mismatch Detected",
    description: "The image has been altered since signing.",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive/20",
    glowClass: "shadow-glow-destructive",
  },
  invalid: {
    icon: XCircle,
    title: "Invalid Signature",
    description: "Signature verification failed. File may be corrupted.",
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning/20",
    glowClass: "",
  },
};

export function VerificationResult({
  status,
  originalHash,
  currentHash,
  timestamp,
  onReset,
}: VerificationResultProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "glass-card-elevated p-6 space-y-6 animate-scale-in",
        config.glowClass
      )}
    >
      <div className="text-center space-y-4">
        <div
          className={cn(
            "inline-flex h-20 w-20 items-center justify-center rounded-full mx-auto",
            config.bgColor,
            config.borderColor,
            "border-2"
          )}
        >
          <Icon className={cn("h-10 w-10", config.color)} />
        </div>
        <div className="space-y-1">
          <h3 className={cn("text-xl font-bold", config.color)}>
            {status === "authentic" && "✓ "}
            {status === "tampered" && "⚠ "}
            {status === "invalid" && "✗ "}
            {config.title}
          </h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {status !== "invalid" && (
        <div className="space-y-4">
          <HashDisplay
            hash={originalHash}
            label="Original Hash"
            comparison={status === "authentic" ? currentHash : undefined}
          />
          <HashDisplay
            hash={currentHash}
            label="Current Hash"
            comparison={status === "authentic" ? originalHash : undefined}
          />
        </div>
      )}

      {timestamp && (
        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-secondary/50 text-sm">
          <span className="text-muted-foreground">Signed on:</span>
          <span className="font-medium">{new Date(timestamp).toLocaleString()}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Verify Another
        </Button>
        {status === "authentic" && (
          <>
            <Button variant="glass" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="glass" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
