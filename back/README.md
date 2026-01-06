TrueShot Backend
================

This backend is a reference implementation for capturing media, canonicalizing it for consistent hashing, signing the canonical bytes with Ed25519 keys, and embedding the signed payload into the media itself. There are two parallel pipelines:
- `image/` — still-image capture and verification.
- `video/` — short-clip capture and verification (ffmpeg required).

Directory Map (per pipeline)
- `capture/` — webcam capture helpers.
- `canonicalization/` — brightness normalization and resizing; the video path also averages frames per second and combines them.
- `hashing/` — SHA-256 hashing and message construction.
- `signing/` — key generation, signing, and verification (Ed25519).
- `metadata/` — contextual metadata collection (e.g., timestamps, device info).
- `storage/` — saving media, embedding/extracting metadata, optional signature persistence.
- `verify/` — end-to-end authenticity checks that re-canonicalize, recompute hashes, and validate signatures.
- `main_capture.py` / `main_verify.py` — runnable scripts tying each pipeline together.

Prerequisites
- Python 3.10+
- Dependencies (install inside a venv):
  - `pip install -r requirements.txt`
- ffmpeg/ffprobe in PATH (video metadata embedding/extraction).
- A webcam for live capture.

Setup
1) Choose a pipeline and enter its folder, e.g. `cd back/image` or `cd back/video`.
2) Create/activate a virtual environment:
   - Windows PowerShell: `python -m venv .venv; .\.venv\Scripts\activate`
3) Install dependencies: `pip install -r requirements.txt`
4) Generate signing keys (writes `private_key.pem` and `public_key.pem` into the pipeline root):
   - `python signing/keygen.py`

Image Workflow
1) Capture + sign: `python main_capture.py`
   - Steps: webcam capture → brightness normalize + resize (`canonicalization`) → SHA-256 hash → collect metadata → build signed message → Ed25519 sign → embed hash/signature/message into the PNG (and save a raw JPG for reference).
   - Outputs: `storage/canonical.png` (with embedded metadata), `storage/raw.jpg`.
2) Verify: `python main_verify.py`
   - Re-canonicalizes the image if needed, recomputes the hash, extracts embedded metadata (or optional `signature.json` fallback), verifies the signature, and compares hashes.

Video Workflow
1) Capture + sign: `python main_capture.py`
   - Steps: record ~`VIDEO_DURATION_SECONDS` seconds (`capture`) → extract frames per second and average them → brightness normalize + resize each representative frame → combine all seconds into a single matrix → SHA-256 hash → collect metadata → sign → embed into MP4 via ffmpeg.
   - Output: `storage/video.mp4` (with embedded metadata).
2) Verify: `python main_verify.py`
   - Reprocesses the video the same way, extracts embedded metadata (or optional signature file), checks the Ed25519 signature, and compares hashes.

Operational Notes
- Both capture and verify read keys from the pipeline root (`utils/constants.py` points to the PEM files). Regenerate with `signing/keygen.py` when needed.
- Keep ffmpeg/ffprobe installed and on PATH for the video path; without them metadata embedding/extraction will fail.
- The canonical assets are the ones to distribute/verify: `storage/canonical.png` for images and `storage/video.mp4` for videos.
- If verification reports “No metadata found,” re-run the capture script to embed metadata or supply the fallback `signature.json` if you saved one.

