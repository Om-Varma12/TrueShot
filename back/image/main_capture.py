import cv2

from capture.camera import capture_image
from canonicalization.pipeline import canonicalize
from hashing.crypto_hash import sha256_hash
from hashing.combine import create_message
from signing.sign import sign_message
from metadata.collect import collect_metadata
from storage.image_store import save_image
from storage.metadata_embed import embed_metadata

# 1️⃣ Capture image
img = capture_image()

# 2️⃣ Canonicalize
canon = canonicalize(img)

# 3️⃣ Save canonical image (THIS is what you verify later)
canonical_path = save_image(canon, "storage/canonical.png")

# (Optional) Save raw image for viewing
save_image(img, "storage/raw.jpg")

# 4️⃣ Hash canonical image
hash_val = sha256_hash(canon.tobytes())

# 5️⃣ Collect metadata
metadata = collect_metadata()

# 6️⃣ Create signed message
message = create_message(hash_val, metadata)
signature = sign_message(message)

# 7️⃣ Embed metadata (hash and signature) into image
embed_metadata(canonical_path, hash_val, signature, message)

print("✅ Image captured, canonicalized, and signed (metadata embedded)")
