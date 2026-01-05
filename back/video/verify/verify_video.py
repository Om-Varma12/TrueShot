import base64
import json

from canonicalization.process_video import process_video_file
from hashing.crypto_hash import sha256_hash
from signing.verify import verify_signature

def verify_video(video_path, signature_path):
    """
    Verify video authenticity by:
    1. Processing video file to extract frames per second
    2. Canonicalizing and combining frames
    3. Computing hash
    4. Comparing with stored hash
    5. Verifying signature
    
    Args:
        video_path: Path to video file to verify
        signature_path: Path to signature JSON file
        
    Returns:
        Tuple of (is_valid: bool, reason: str)
    """
    # Process video: extract frames per second, canonicalize, combine
    combined_matrix = process_video_file(video_path)
    
    # Compute hash from combined matrix
    recomputed_hash = sha256_hash(combined_matrix.tobytes())

    # Load stored signature bundle
    with open(signature_path) as f:
        data = json.load(f)

    stored_message = base64.b64decode(data["message"])
    signature = base64.b64decode(data["signature"])

    # 1️⃣ Verify signature on ORIGINAL message
    if not verify_signature(stored_message, signature):
        return False, "Invalid signature (forged or wrong key)"

    # 2️⃣ Extract stored hash from signed message
    signed_payload = json.loads(stored_message.decode())
    stored_hash = signed_payload["hash"]

    # 3️⃣ Compare hashes
    if stored_hash != recomputed_hash:
        return False, "Video content mismatch"

    return True, "Video is authentic"
