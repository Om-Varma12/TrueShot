TrueShot
========

TrueShot is a computer-vision proof-of-authenticity toolkit. It captures photos or videos, canonicalizes the pixels, hashes the result, signs the hash with Ed25519 keys, and embeds the signed payload back into the media as metadata. A React front end wraps the flows, while Python scripts power the capture, signing, and verification.

Highlights
- Image and video capture with repeatable canonicalization to avoid tampering through simple resizes/brightness tweaks.
- Hashing + Ed25519 signing with metadata embedded directly in PNG/JPEG/MP4 files.
- One-step verification that re-canonicalizes media and checks the embedded payload.
- Front end built with Vite + React + Tailwind + shadcn-ui for a guided UX.
- Backend scripts kept minimal and runnable from the command line.

Repository Layout
- `front/` — React app (Vite, TypeScript, Tailwind/shadcn) for UI.
- `back/` — Python reference backend for capture, signing, and verification.
  - `image/` and `video/` submodules implement parallel pipelines.
- `back/storage/` — sample captured assets.

Prerequisites
- Node.js 18+ and npm (or bun/pnpm) for the front end.
- Python 3.10+.
- ffmpeg/ffprobe on your PATH (required for video metadata embedding).
- A webcam if you want to run live capture scripts.

First-Time Crypto Setup (Required)
- Before running either the backend scripts or the React app, you **must generate your own Ed25519 keypair**.
- Keys are per-pipeline, stored in the filesystem (never checked into git):
  - Image pipeline keys: `back/image/private_key.pem` and `back/image/public_key.pem`
  - Video pipeline keys: `back/video/private_key.pem` and `back/video/public_key.pem`
- To generate them, run once per pipeline:
  - `cd back/image && python signing/keygen.py`
  - `cd back/video && python signing/keygen.py`


Quick Start (Front End)
1) `cd front`
2) `npm install` (or `bun install`)
3) `npm run dev` and open the printed localhost URL.

Quick Start (Backend)
- Image pipeline:
  1) `cd back/image`
  2) `python -m venv .venv && .venv\Scripts\activate` (PowerShell)  
     `pip install opencv-python pillow piexif numpy cryptography`
  3) `python signing/keygen.py` to create **your own** `private_key.pem` / `public_key.pem` (required once before using this pipeline).
  4) `python main_capture.py` to capture, canonicalize, hash, sign, and embed.
  5) `python main_verify.py` to re-canonicalize and verify authenticity.
- Video pipeline (requires ffmpeg):
  1) `cd back/video`
  2) Create/activate the venv as above and `pip install opencv-python pillow numpy cryptography`
  3) `python signing/keygen.py` to create **your own** `private_key.pem` / `public_key.pem` for videos.
  4) `python main_capture.py` to record ~5s, process frames, sign, and embed.
  5) `python main_verify.py` to reprocess and verify the video.

What Gets Stored
- Images: raw capture (`storage/raw.jpg`), canonical frame (`storage/canonical.png`), metadata embedded in the canonical image.
- Videos: captured clip (`storage/video.mp4`) with embedded metadata.

Tips
- Re-run `signing/keygen.py` if you need fresh keys; both capture and verify read from the generated PEM files.
- If verification fails, ensure ffmpeg/ffprobe is installed (video) and that you are verifying the canonicalized asset (`storage/canonical.png` or `storage/video.mp4`).
