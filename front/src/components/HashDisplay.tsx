import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface HashDisplayProps {
  hash: string;
  label?: string;
  comparison?: string;
  className?: string;
}

export function HashDisplay({ hash, label, comparison, className }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatch = comparison ? hash === comparison : null;

  const formatHash = (h: string) => {
    return h.match(/.{1,8}/g)?.join(" ") || h;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          {isMatch !== null && (
            <span
              className={cn(
                "text-xs font-medium",
                isMatch ? "text-success" : "text-destructive"
              )}
            >
              {isMatch ? "Match" : "Mismatch"}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "relative p-4 rounded-lg font-mono text-xs tracking-wider break-all transition-all duration-300",
          isMatch === true && "bg-success/10 border border-success/20",
          isMatch === false && "bg-destructive/10 border border-destructive/20",
          isMatch === null && "bg-secondary/50 border border-border/50"
        )}
      >
        <code
          className={cn(
            "block pr-10",
            isMatch === true && "text-success",
            isMatch === false && "text-destructive",
            isMatch === null && "text-foreground/80"
          )}
        >
          {formatHash(hash)}
        </code>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
