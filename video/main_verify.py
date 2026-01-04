from verify.verify_image import verify_image

valid, reason = verify_image("storage/canonical.png", "storage/signature.json")

if valid:
    print("✅", reason)
else:
    print("❌", reason)
