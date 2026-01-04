from cryptography.hazmat.primitives import serialization
from utils.constants import PUBLIC_KEY_PATH

def verify_signature(message: bytes, signature: bytes) -> bool:
    with open(PUBLIC_KEY_PATH, "rb") as f:
        public_key = serialization.load_pem_public_key(f.read())

    try:
        public_key.verify(signature, message)
        return True
    except Exception:
        return False
