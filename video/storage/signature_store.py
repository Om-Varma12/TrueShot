import json
import base64
import os

def save_signature(path, message, signature):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    data = {
        "message": base64.b64encode(message).decode(),
        "signature": base64.b64encode(signature).decode()
    }

    with open(path, "w") as f:
        json.dump(data, f, indent=2)
