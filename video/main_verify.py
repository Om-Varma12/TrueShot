from verify.verify_video import verify_video

valid, reason = verify_video("storage/video.mp4", "storage/video_signature.json")

if valid:
    print("✅", reason)
else:
    print("❌", reason)
