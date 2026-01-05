// Simulated cryptographic functions for demo purposes
// In production, these would use actual cryptographic libraries

export async function generateHash(data: string | Blob): Promise<string> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate a mock SHA256 hash
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export async function createSignature(
  hash: string,
  mediaType: "image" | "video"
): Promise<{
  signature: string;
  timestamp: string;
  algorithm: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  return {
    signature: `sig_${hash.slice(0, 16)}_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    algorithm: "SHA256",
  };
}

export async function verifySignature(
  originalHash: string,
  currentHash: string,
  signature: string
): Promise<{
  isValid: boolean;
  isAuthentic: boolean;
  details: string;
}> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Check if signature format is valid
  const isValidFormat = signature.startsWith("sig_");
  
  if (!isValidFormat) {
    return {
      isValid: false,
      isAuthentic: false,
      details: "Invalid signature format",
    };
  }
  
  // Check if hashes match
  const isAuthentic = originalHash === currentHash;
  
  return {
    isValid: true,
    isAuthentic,
    details: isAuthentic
      ? "Content matches original signature"
      : "Content has been modified since signing",
  };
}

export function downloadSignatureFile(
  hash: string,
  signature: string,
  timestamp: string,
  mediaType: "image" | "video"
) {
  const signatureData = {
    version: "1.0",
    mediaType,
    hash: {
      algorithm: "SHA256",
      value: hash,
    },
    signature,
    timestamp,
    metadata: {
      tool: "TrueShot",
      format: mediaType === "image" ? "PNG" : "WebM",
    },
  };

  const blob = new Blob([JSON.stringify(signatureData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trueshot-signature-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMedia(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
