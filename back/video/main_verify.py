from verify.verify_video import verify_video

# Verify video using embedded metadata (no signature file needed)
valid, reason = verify_video("storage/video.mp4")

if valid:
    print("✅", reason)
else:
    print("❌", reason)
