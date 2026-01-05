import { useRef, useEffect, useState, useCallback } from "react";
import { Video, RefreshCw, X, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface VideoRecorderProps {
  onRecordComplete: (videoBlob: Blob, thumbnailData: string) => void;
  isProcessing: boolean;
}

export function VideoRecorder({ onRecordComplete, isProcessing }: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: true,
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

  const captureThumbnail = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      return canvas.toDataURL("image/jpeg");
    }
    return null;
  }, []);

  const startRecording = useCallback(() => {
    if (!videoRef.current?.srcObject) return;

    const thumbData = captureThumbnail();
    if (thumbData) setThumbnail(thumbData);

    chunksRef.current = [];
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedVideo(blob);
      stopCamera();
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setCountdown(5);
  }, [captureThumbnail, stopCamera]);

  useEffect(() => {
    if (!isRecording) return;

    if (countdown === 0) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [isRecording, countdown]);

  const handleRetake = useCallback(() => {
    setRecordedVideo(null);
    setThumbnail(null);
    setCountdown(5);
    startCamera();
  }, [startCamera]);

  const handleConfirm = useCallback(() => {
    if (recordedVideo && thumbnail) {
      onRecordComplete(recordedVideo, thumbnail);
    }
  }, [recordedVideo, thumbnail, onRecordComplete]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (recordedVideo && previewRef.current) {
      previewRef.current.src = URL.createObjectURL(recordedVideo);
    }
  }, [recordedVideo]);

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <div className="glass-card-elevated p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Record Video
          <span className="text-xs text-muted-foreground font-normal ml-2">
            5-second recording
          </span>
        </h3>
        {isRecording && (
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
            </span>
            <span className="text-sm text-destructive font-medium">REC</span>
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
        ) : recordedVideo ? (
          <video
            ref={previewRef}
            controls
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

        {isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 right-4">
              <div className="h-1 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="relative h-20 w-20">
                <svg className="h-20 w-20 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="6"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progress) / 100}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {countdown}
                </span>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3">
        {recordedVideo ? (
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
              variant="record"
              className="flex-1"
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-destructive-foreground border-t-transparent rounded-full" />
                  Processing...
                </>
              ) : (
                <>Process & Sign</>
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="record"
            className="w-full"
            onClick={startRecording}
            disabled={!isStreaming || isRecording}
          >
            <Circle className={cn("h-5 w-5 mr-2", isRecording && "fill-current")} />
            {isRecording ? `Recording... ${countdown}s` : "Record Video (5s)"}
          </Button>
        )}
      </div>
    </div>
  );
}
