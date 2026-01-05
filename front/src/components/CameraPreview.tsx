import { useRef, useEffect, useState, useCallback } from "react";
import { Camera, RefreshCw, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface CameraPreviewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

export function CameraPreview({ onCapture, isProcessing }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
      stopCamera();
    }
  }, [stopCamera]);

  const handleCapture = useCallback(() => {
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      captureImage();
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, captureImage]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="glass-card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Capture Image
        </h3>
        {isStreaming && !capturedImage && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            <span className="text-xs text-success font-medium">Camera Active</span>
          </div>
        )}
      </div>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary/50">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button variant="outline" onClick={startCamera}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover transition-opacity duration-300",
                isStreaming ? "opacity-100" : "opacity-0"
              )}
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin-slow h-12 w-12 rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </>
        )}

        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <span className="text-7xl font-bold text-foreground animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3">
        {capturedImage ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleRetake}
              disabled={isProcessing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button
              variant="capture"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>Confirm & Sign</>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="capture"
            className="w-full"
            onClick={handleCapture}
            disabled={!isStreaming || countdown !== null}
          >
            <Camera className="h-5 w-5 mr-2" />
            Capture Image
          </Button>
        )}
      </div>
    </div>
  );
}
