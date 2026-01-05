import { Shield, Lock, Fingerprint } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative text-center space-y-6 py-8">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Powered by SHA256 & Digital Signatures
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          Verify Media{" "}
          <span className="text-gradient">Authenticity</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Capture, sign, and verify images and videos with cryptographic precision.
          Ensure your media hasn't been tampered with.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4 text-success" />
          <span>Tamper-proof verification</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Fingerprint className="h-4 w-4 text-primary" />
          <span>Unique hash signatures</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-accent" />
          <span>End-to-end security</span>
        </div>
      </div>
    </div>
  );
}
