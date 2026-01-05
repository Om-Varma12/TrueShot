from pathlib import Path

# Always resolves to: TrueShot/video
VIDEO_ROOT = Path(__file__).resolve().parents[1]

PRIVATE_KEY_PATH = VIDEO_ROOT / "private_key.pem"
PUBLIC_KEY_PATH = VIDEO_ROOT / "public_key.pem"

# Video capture settings
VIDEO_DURATION_SECONDS = 5
CANONICAL_FRAME_SIZE = (256, 256)
