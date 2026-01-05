import { useCallback, useState } from "react";
import { Upload, FileImage, FileVideo, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface FileUploadZoneProps {
  type: "image" | "video" | "signature";
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
  description: string;
  selectedFile?: File | null;
  onClear?: () => void;
}

export function FileUploadZone({
  type,
  onFileSelect,
  accept,
  label,
  description,
  selectedFile,
  onClear,
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const Icon = type === "video" ? FileVideo : type === "image" ? FileImage : Upload;

  if (selectedFile) {
    return (
      <div className="upload-zone p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {onClear && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("upload-zone p-8 text-center", isDragging && "dragging")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            "h-14 w-14 rounded-xl flex items-center justify-center transition-colors duration-200",
            isDragging ? "bg-primary/20" : "bg-secondary"
          )}
        >
          <Icon
            className={cn(
              "h-7 w-7 transition-colors duration-200",
              isDragging ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button variant="outline" size="sm" className="pointer-events-none">
          Browse Files
        </Button>
      </div>
    </div>
  );
}
