from capture.camera import capture_video
from canonicalization.process_video import process_video_file
from hashing.crypto_hash import sha256_hash
from hashing.combine import create_message
from signing.sign import sign_message
from metadata.collect import collect_metadata
from storage.signature_store import save_signature
from utils.constants import VIDEO_DURATION_SECONDS

# 1️⃣ Capture video (5 seconds) and save as video file
video_path = capture_video(duration_seconds=VIDEO_DURATION_SECONDS, output_path="storage/video.mp4")

# 2️⃣ Process video: extract frames per second, canonicalize, combine
combined_matrix = process_video_file(video_path)

# 3️⃣ Hash combined matrix
hash_val = sha256_hash(combined_matrix.tobytes())

# 4️⃣ Collect metadata
metadata = collect_metadata()

# 5️⃣ Create signed message
message = create_message(hash_val, metadata)
signature = sign_message(message)

# 6️⃣ Save signature bundle
save_signature("storage/video_signature.json", message, signature)

print("✅ Video captured, processed, and signed")
