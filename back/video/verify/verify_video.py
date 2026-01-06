import base64
import json

from canonicalization.process_video import process_video_file
from hashing.crypto_hash import sha256_hash
from signing.verify import verify_signature
from storage.metadata_embed import extract_metadata

def verify_video(video_path, signature_path=None):
    """
    Verify video authenticity by extracting metadata from video itself.
    If signature_path is provided, it will be used as fallback.
    
    Args:
        video_path: Path to video file to verify
        signature_path: Optional path to signature JSON file (for backward compatibility)
        
    Returns:
        Tuple of (is_valid: bool, reason: str)
    """
    # Process video: extract frames per second, canonicalize, combine
    combined_matrix = process_video_file(video_path)
    
    # Compute hash from combined matrix
    recomputed_hash = sha256_hash(combined_matrix.tobytes())

    # Try to extract metadata from video
    metadata_result = extract_metadata(video_path)
    
    if metadata_result:
        # Metadata found in video
        stored_hash, signature, stored_message = metadata_result
    elif signature_path:
        # Fallback to separate signature file (backward compatibility)
        with open(signature_path) as f:
            data = json.load(f)
        
        stored_message = base64.b64decode(data["message"])
        signature = base64.b64decode(data["signature"])
        
        # Extract hash from message
        signed_payload = json.loads(stored_message.decode())
        stored_hash = signed_payload["hash"]
    else:
        return False, "No metadata found in video and no signature file provided"

    # 1️⃣ Verify signature on ORIGINAL message
    if not verify_signature(stored_message, signature):
        return False, "Invalid signature (forged or wrong key)"

    # 2️⃣ Compare hashes
    if stored_hash != recomputed_hash:
        return False, "Video content mismatch"

    return True, "Video is authentic"
