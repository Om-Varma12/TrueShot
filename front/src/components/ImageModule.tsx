import { useState, useCallback } from "react";
import { Camera, Shield, ArrowRight } from "lucide-react";
import { CameraPreview } from "./CameraPreview";
import { FileUploadZone } from "./FileUploadZone";
import { ProcessingState } from "./ProcessingState";
import { SignatureSuccess } from "./SignatureSuccess";
import { VerificationResult } from "./VerificationResult";
import { HashDisplay } from "./HashDisplay";
import { Button } from "./ui/button";
import {
  generateHash,
  createSignature,
  verifySignature,
  downloadSignatureFile,
  downloadMedia,
} from "@/lib/crypto";

type CaptureState = "idle" | "processing" | "success";
type VerifyState = "idle" | "uploading" | "processing" | "result";
type VerificationStatus = "authentic" | "tampered" | "invalid";

interface ProcessingStep {
  label: string;
  status: "pending" | "processing" | "complete";
}

export function ImageModule() {
  // Capture state
  const [captureState, setCaptureState] = useState<CaptureState>("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureHash, setCaptureHash] = useState<string | null>(null);
  const [captureSignature, setCaptureSignature] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [captureSteps, setCaptureSteps] = useState<ProcessingStep[]>([
    { label: "Canonicalizing image...", status: "pending" },
    { label: "Generating SHA256 hash...", status: "pending" },
    { label: "Creating digital signature...", status: "pending" },
  ]);

  // Verify state
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [verifySteps, setVerifySteps] = useState<ProcessingStep[]>([
    { label: "Processing image...", status: "pending" },
    { label: "Generating hash...", status: "pending" },
    { label: "Verifying signature...", status: "pending" },
  ]);
  const [verificationResult, setVerificationResult] = useState<{
    status: VerificationStatus;
    originalHash: string;
    currentHash: string;
    timestamp?: string;
  } | null>(null);

  // Capture handlers
  const handleCapture = useCallback(async (imageData: string) => {
    setCapturedImage(imageData);
    setCaptureState("processing");

    // Step 1: Canonicalization
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "processing" } : s))
    );
    await new Promise((r) => setTimeout(r, 800));
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "complete" } : s))
    );

    // Step 2: Hash generation
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s))
    );
    const hash = await generateHash(imageData);
    setCaptureHash(hash);
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "complete" } : s))
    );

    // Step 3: Signature creation
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s))
    );
    const sig = await createSignature(hash, "image");
    setCaptureSignature(sig.signature);
    setCaptureTimestamp(sig.timestamp);
    setCaptureSteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "complete" } : s))
    );

    await new Promise((r) => setTimeout(r, 300));
    setCaptureState("success");
  }, []);

  const handleCaptureReset = useCallback(() => {
    setCaptureState("idle");
    setCapturedImage(null);
    setCaptureHash(null);
    setCaptureSignature(null);
    setCaptureTimestamp(null);
    setCaptureSteps([
      { label: "Canonicalizing image...", status: "pending" },
      { label: "Generating SHA256 hash...", status: "pending" },
      { label: "Creating digital signature...", status: "pending" },
    ]);
  }, []);

  // Verify handlers
  const handleVerify = useCallback(async () => {
    if (!imageFile || !signatureFile) return;

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

    // Step 1: Process image
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "processing" } : s))
    );
    await new Promise((r) => setTimeout(r, 600));
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: "complete" } : s))
    );

    // Step 2: Generate hash
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "processing" } : s))
    );
    const currentHash = await generateHash(imageFile);
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 1 ? { ...s, status: "complete" } : s))
    );

    // Step 3: Verify signature
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "processing" } : s))
    );

    // Simulate verification - in real app, would verify cryptographically
    const isAuthentic = Math.random() > 0.3; // 70% chance of authentic for demo
    const originalHash = isAuthentic ? currentHash : sigData.hash.value;

    await new Promise((r) => setTimeout(r, 800));
    setVerifySteps((prev) =>
      prev.map((s, i) => (i === 2 ? { ...s, status: "complete" } : s))
    );

    setVerificationResult({
      status: isAuthentic ? "authentic" : "tampered",
      originalHash,
      currentHash,
      timestamp: sigData.timestamp,
    });

    await new Promise((r) => setTimeout(r, 300));
    setVerifyState("result");
  }, [imageFile, signatureFile]);

  const handleVerifyReset = useCallback(() => {
    setVerifyState("idle");
    setImageFile(null);
    setSignatureFile(null);
    setVerificationResult(null);
    setVerifySteps([
      { label: "Processing image...", status: "pending" },
      { label: "Generating hash...", status: "pending" },
      { label: "Verifying signature...", status: "pending" },
    ]);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Capture Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Capture & Sign</h2>
            <p className="text-sm text-muted-foreground">
              Take a photo and create a cryptographic signature
            </p>
          </div>
        </div>

        {captureState === "idle" && (
          <CameraPreview
            onCapture={handleCapture}
            isProcessing={false}
          />
        )}

        {captureState === "processing" && (
          <ProcessingState
            steps={captureSteps}
            title="Creating Signature..."
          />
        )}

        {captureState === "success" && captureHash && captureSignature && captureTimestamp && (
          <SignatureSuccess
            hash={captureHash}
            timestamp={captureTimestamp}
            thumbnailUrl={capturedImage || undefined}
            onDownloadSignature={() =>
              downloadSignatureFile(
                captureHash,
                captureSignature,
                captureTimestamp,
                "image"
              )
            }
            onDownloadMedia={() =>
              capturedImage &&
              downloadMedia(capturedImage, `trueshot-image-${Date.now()}.png`)
            }
            onReset={handleCaptureReset}
            mediaType="image"
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
            <h2 className="text-lg font-semibold">Verify Authenticity</h2>
            <p className="text-sm text-muted-foreground">
              Upload an image and signature to verify
            </p>
          </div>
        </div>

        {verifyState === "idle" && (
          <div className="glass-card-elevated p-6 space-y-4">
            <FileUploadZone
              type="image"
              accept="image/png,image/jpeg,image/jpg"
              label="Upload Image"
              description="PNG, JPG, JPEG up to 50MB"
              onFileSelect={setImageFile}
              selectedFile={imageFile}
              onClear={() => setImageFile(null)}
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
              disabled={!imageFile || !signatureFile}
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Authenticity
            </Button>
          </div>
        )}

        {verifyState === "processing" && (
          <ProcessingState
            steps={verifySteps}
            title="Verifying Signature..."
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
