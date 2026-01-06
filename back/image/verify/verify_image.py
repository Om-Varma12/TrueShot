import cv2
import numpy as np

from canonicalization.pipeline import canonicalize
from canonicalization.resize import CANONICAL_SIZE
from hashing.crypto_hash import sha256_hash
from signing.verify import verify_signature
from storage.metadata_embed import extract_metadata

def verify_image(image_path, signature_path=None):
    """
    Verify image authenticity by extracting metadata from image itself.
    If signature_path is provided, it will be used as fallback.
    
    Args:
        image_path: Path to image file
        signature_path: Optional path to signature JSON file (for backward compatibility)
        
    Returns:
        Tuple of (is_valid: bool, reason: str)
    """
    # Load image for processing
    img = cv2.imread(image_path)
    if img is None:
        return False, "Failed to load image"
    
    # Check if image is already canonical (256x256)
    # If so, use it directly; otherwise canonicalize it
    if img.shape[:2] == CANONICAL_SIZE:
        # Image is already canonical, use it directly
        canon = img
    else:
        # Image needs to be canonicalized (e.g., raw image)
        canon = canonicalize(img)
    
    # Compute hash from pixel data
    recomputed_hash = sha256_hash(canon.tobytes())

    # Try to extract metadata from image
    metadata_result = extract_metadata(image_path)
    
    if metadata_result:
        # Metadata found in image
        stored_hash, signature, stored_message = metadata_result
    elif signature_path:
        # Fallback to separate signature file (backward compatibility)
        try:
            import json
            import base64
            import os
            if os.path.exists(signature_path):
                with open(signature_path) as f:
                    data = json.load(f)
                
                stored_message = base64.b64decode(data["message"])
                signature = base64.b64decode(data["signature"])
                
                # Extract hash from message
                signed_payload = json.loads(stored_message.decode())
                stored_hash = signed_payload["hash"]
            else:
                return False, f"No metadata found in image and signature file not found: {signature_path}"
        except Exception as e:
            return False, f"Error reading signature file: {e}"
    else:
        # Try to find signature.json in the same directory as the image
        import os
        image_dir = os.path.dirname(image_path) or '.'
        default_sig_path = os.path.join(image_dir, 'signature.json')
        if os.path.exists(default_sig_path):
            return verify_image(image_path, default_sig_path)
        return False, "No metadata found in image. Please re-capture the image with the new code, or provide a signature file."

    # 1️⃣ Verify signature on ORIGINAL message
    if not verify_signature(stored_message, signature):
        return False, "Invalid signature (forged or wrong key)"

    # 2️⃣ Compare hashes
    if stored_hash != recomputed_hash:
        return False, "Image content mismatch"

    return True, "Image is authentic"
