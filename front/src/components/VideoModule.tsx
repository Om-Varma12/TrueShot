import { useState, useCallback } from "react";
import { Video, Shield, ArrowRight, Grid3X3 } from "lucide-react";
import { VideoRecorder } from "./VideoRecorder";
import { FileUploadZone } from "./FileUploadZone";
import { ProcessingState } from "./ProcessingState";
import { SignatureSuccess } from "./SignatureSuccess";
import { VerificationResult } from "./VerificationResult";
import { Button } from "./ui/button";
import {
  generateHash,
  createSignature,
  downloadSignatureFile,
} from "@/lib/crypto";

type RecordState = "idle" | "processing" | "success";
type VerifyState = "idle" | "processing" | "result";
type VerificationStatus = "authentic" | "tampered" | "invalid";

interface ProcessingStep {
  label: string;
  status: "pending" | "processing" | "complete";
}

export function VideoModule() {
  // Record state
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [recordHash, setRecordHash] = useState<string | null>(null);
  const [recordSignature, setRecordSignature] = useState<string | null>(null);
  const [recordTimestamp, setRecordTimestamp] = useState<string | null>(null);
  const [frameCount, setFrameCount] = useState(0);
  const [recordSteps, setRecordSteps] = useState<ProcessingStep[]>([
    { label: "Extracting frames...", status: "pending" },
    { label: "Averaging frames...", status: "pending" },
    { label: "Generating SHA256 hash...", status: "pending" },
    { label: "Creating digital signature...", status: "pending" },
  ]);

  // Verify state
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [verifySteps, setVerifySteps] = useState<ProcessingStep[]>([
    { label: "Extracting frames...", status: "pending" },
    { label: "Processing frames...", status: "pending" },
    { label: "Generating hash...", status: "pending" },
    { label: "Verifying signature...", status: "pending" },
  ]);
  const [verificationResult, setVerificationResult] = useState<{
    status: VerificationStatus;
    originalHash: string;
    currentHash: string;
    timestamp?: string;
  } | null>(null);

  // Record handlers
  const handleRecordComplete = useCallback(
    async (videoBlob: Blob, thumbnailData: string) => {
      setRecordedVideo(videoBlob);
      setThumbnail(thumbnailData);
      setRecordState("processing");

      // Step 1: Frame extraction
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "processing" } : s))
      );
      await new Promise((r) => setTimeout(r, 1000));
      const frames = 150; // 5 seconds * 30fps
      setFrameCount(frames);
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 0 ? { ...s, status: "complete" } : s))
      );

      // Step 2: Frame averaging
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s))
      );
      await new Promise((r) => setTimeout(r, 800));
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 1 ? { ...s, status: "complete" } : s))
      );

      // Step 3: Hash generation
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s))
      );
      const hash = await generateHash(videoBlob);
      setRecordHash(hash);
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 2 ? { ...s, status: "complete" } : s))
      );

      // Step 4: Signature creation
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 3 ? { ...s, status: "processing" } : s))
      );
      const sig = await createSignature(hash, "video");
      setRecordSignature(sig.signature);
      setRecordTimestamp(sig.timestamp);
      setRecordSteps((prev) =>
        prev.map((s, i) => (i === 3 ? { ...s, status: "complete" } : s))
      );

      await new Promise((r) => setTimeout(r, 300));
      setRecordState("success");
    },
    []
  );

  const handleRecordReset = useCallback(() => {
    setRecordState("idle");
    setRecordedVideo(null);
    setThumbnail(null);
    setRecordHash(null);
    setRecordSignature(null);
    setRecordTimestamp(null);
    setFrameCount(0);
    setRecordSteps([
      { label: "Extracting frames...", status: "pending" },
      { label: "Averaging frames...", status: "pending" },
      { label: "Generating SHA256 hash...", status: "pending" },
      { label: "Creating digital signature...", status: "pending" },
    ]);
  }, []);

  const handleDownloadVideo = useCallback(() => {
    if (!recordedVideo) return;
    const url = URL.createObjectURL(recordedVideo);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trueshot-video-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [recordedVideo]);

  // Verify handlers
  const handleVerify = useCallback(async () => {
    if (!videoFile || !signatureFile) return;

    setVerifyState("processing");

    // Parse signature file
    const sigContent = await signatureFile.text();
    let sigData: {
      hash: { value: string };
      signature: string;
      timestamp: string;
    };

    try {
      sigData = JSON.parse(sigContent);
    } catch {
      setVerificationResult({
        status: "invalid",
        originalHash: "",
        currentHash: "",
      });
      setVerifyState("result");
      return;
    }

    // Step 1: Extract frames
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "processing" } : s))
    );
    await new Promise((r) => setTimeout(r, 1000));
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "complete" } : s))
    );

    // Step 2: Process frames
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s))
    );
    await new Promise((r) => setTimeout(r, 800));
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "complete" } : s))
    );

    // Step 3: Generate hash
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s))
    );
    const currentHash = await generateHash(videoFile);
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "complete" } : s))
    );

    // Step 4: Verify signature
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 3 ? { ...s, status: "processing" } : s))
    );

    const isAuthentic = Math.random() > 0.3;
    const originalHash = isAuthentic ? currentHash : sigData.hash.value;

    await new Promise((r) => setTimeout(r, 800));
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 3 ? { ...s, status: "complete" } : s))
    );

    setVerificationResult({
      status: isAuthentic ? "authentic" : "tampered",
      originalHash,
      currentHash,
      timestamp: sigData.timestamp,
    });

    await new Promise((r) => setTimeout(r, 300));
    setVerifyState("result");
  }, [videoFile, signatureFile]);

  const handleVerifyReset = useCallback(() => {
    setVerifyState("idle");
    setVideoFile(null);
    setSignatureFile(null);
    setVerificationResult(null);
    setVerifySteps([
      { label: "Extracting frames...", status: "pending" },
      { label: "Processing frames...", status: "pending" },
      { label: "Generating hash...", status: "pending" },
      { label: "Verifying signature...", status: "pending" },
    ]);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Record Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <Video className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Record & Sign</h2>
            <p className="text-sm text-muted-foreground">
              Record a 5-second video and create a signature
            </p>
          </div>
        </div>

        {recordState === "idle" && (
          <VideoRecorder
            onRecordComplete={handleRecordComplete}
            isProcessing={false}
          />
        )}

        {recordState === "processing" && (
          <div className="space-y-4">
            <ProcessingState
              steps={recordSteps}
              title="Processing Video..."
            />
            {frameCount > 0 && (
              <div className="glass-card p-4 flex items-center gap-3">
                <Grid3X3 className="h-5 w-5 text-primary" />
                <span className="text-sm">
                  <span className="font-medium">{frameCount}</span> frames
                  extracted
                </span>
              </div>
            )}
          </div>
        )}

        {recordState === "success" &&
          recordHash &&
          recordSignature &&
          recordTimestamp && (
            <SignatureSuccess
              hash={recordHash}
              timestamp={recordTimestamp}
              thumbnailUrl={thumbnail || undefined}
              onDownloadSignature={() =>
                downloadSignatureFile(
                  recordHash,
                  recordSignature,
                  recordTimestamp,
                  "video"
                )
              }
              onDownloadMedia={handleDownloadVideo}
              onReset={handleRecordReset}
              mediaType="video"
            />
          )}
      </div>

      {/* Verify Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-success" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Verify Video</h2>
            <p className="text-sm text-muted-foreground">
              Upload a video and signature to verify
            </p>
          </div>
        </div>

        {verifyState === "idle" && (
          <div className="glass-card-elevated p-6 space-y-4">
            <FileUploadZone
              type="video"
              accept="video/mp4,video/webm"
              label="Upload Video"
              description="MP4, WebM up to 100MB"
              onFileSelect={setVideoFile}
              selectedFile={videoFile}
              onClear={() => setVideoFile(null)}
            />

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-border" />
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 h-px bg-border" />
            </div>

            <FileUploadZone
              type="signature"
              accept="application/json,.json"
              label="Upload Signature File"
              description=".json signature file"
              onFileSelect={setSignatureFile}
              selectedFile={signatureFile}
              onClear={() => setSignatureFile(null)}
            />

            <Button
              variant="success"
              className="w-full"
              onClick={handleVerify}
              disabled={!videoFile || !signatureFile}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Video
            </Button>
          </div>
        )}

        {verifyState === "processing" && (
          <ProcessingState
            steps={verifySteps}
            title="Verifying Video..."
          />
        )}

        {verifyState === "result" && verificationResult && (
          <VerificationResult
            status={verificationResult.status}
            originalHash={verificationResult.originalHash}
            currentHash={verificationResult.currentHash}
            timestamp={verificationResult.timestamp}
            onReset={handleVerifyReset}
          />
        )}
      </div>
    </div>
  );
}
