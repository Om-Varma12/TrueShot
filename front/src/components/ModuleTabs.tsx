import { Camera, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModuleTabsProps {
  activeModule: "image" | "video";
  onModuleChange: (module: "image" | "video") => void;
}

export function ModuleTabs({ activeModule, onModuleChange }: ModuleTabsProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-secondary/50 backdrop-blur-sm border border-border/50 w-fit mx-auto">
      <button
        onClick={() => onModuleChange("image")}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
          activeModule === "image"
            ? "bg-primary text-primary-foreground shadow-glow"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <Camera className="h-4 w-4" />
        <span>Image Verification</span>
      </button>
      <button
        onClick={() => onModuleChange("video")}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200",
          activeModule === "video"
            ? "bg-primary text-primary-foreground shadow-glow"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <Video className="h-4 w-4" />
        <span>Video Verification</span>
      </button>
    </div>
  );
}
