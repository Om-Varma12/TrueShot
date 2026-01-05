from cryptography.hazmat.primitives import serialization
from utils.constants import PRIVATE_KEY_PATH

def sign_message(message: bytes) -> bytes:
    with open(PRIVATE_KEY_PATH, "rb") as f:
        private_key = serialization.load_pem_private_key(f.read(), password=None)
    return private_key.sign(message)
