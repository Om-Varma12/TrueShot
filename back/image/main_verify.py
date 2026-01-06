from verify.verify_image import verify_image
import os

# Verify image using embedded metadata (no signature file needed)
# Falls back to signature.json if metadata not found in image
image_path = "storage/canonical.png"
signature_path = "storage/signature.json" if os.path.exists("storage/signature.json") else None

valid, reason = verify_image(image_path, signature_path)

if valid:
    print("✅", reason)
else:
    print("❌", reason)
    if "No metadata found" in reason and signature_path:
        print(f"   Tip: Re-capture the image using main_capture.py to embed metadata, or ensure {signature_path} exists")
