import { CheckCircle2, Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { HashDisplay } from "./HashDisplay";

interface SignatureSuccessProps {
  hash: string;
  timestamp: string;
  thumbnailUrl?: string;
  onDownloadSignature: () => void;
  onDownloadMedia: () => void;
  onReset: () => void;
  mediaType: "image" | "video";
}

export function SignatureSuccess({
  hash,
  timestamp,
  thumbnailUrl,
  onDownloadSignature,
  onDownloadMedia,
  onReset,
  mediaType,
}: SignatureSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card-elevated p-6 space-y-6 animate-scale-in shadow-glow-success">
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="h-20 w-20 rounded-full bg-success/10 border-2 border-success/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <div className="absolute -inset-2 rounded-full bg-success/20 animate-pulse-ring" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-success">Signature Created</h3>
          <p className="text-sm text-muted-foreground">
            Your {mediaType} has been cryptographically signed
          </p>
        </div>
      </div>

      {thumbnailUrl && (
        <div className="aspect-video rounded-lg overflow-hidden bg-secondary/50">
          <img
            src={thumbnailUrl}
            alt="Captured media thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <HashDisplay hash={hash} label="SHA256 Hash" />

      <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-secondary/50 text-sm">
        <span className="text-muted-foreground">Created:</span>
        <span className="font-medium">{new Date(timestamp).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="default" onClick={onDownloadSignature} className="gap-2">
          <Download className="h-4 w-4" />
          Signature File
        </Button>
        <Button variant="outline" onClick={onDownloadMedia} className="gap-2">
          <Download className="h-4 w-4" />
          {mediaType === "image" ? "Canonical Image" : "Video"}
        </Button>
      </div>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={onReset}
      >
        Capture Another
      </Button>
    </div>
  );
}
