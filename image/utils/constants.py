from pathlib import Path

# Always resolves to: TrueShot/image
IMAGE_ROOT = Path(__file__).resolve().parents[1]

PRIVATE_KEY_PATH = IMAGE_ROOT / "private_key.pem"
PUBLIC_KEY_PATH = IMAGE_ROOT / "public_key.pem"
