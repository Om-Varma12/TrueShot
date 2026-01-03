import cv2
import base64
import json

from canonicalization.pipeline import canonicalize
from hashing.crypto_hash import sha256_hash
from signing.verify import verify_signature

def verify_image(image_path, signature_path):
    # Load image
    img = cv2.imread(image_path)
    canon = canonicalize(img)
    recomputed_hash = sha256_hash(canon.tobytes())

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
        return False, "Image content mismatch"

    return True, "Image is authentic"
