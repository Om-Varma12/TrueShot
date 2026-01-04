import json

def create_message(hash_value, metadata):
    message = {
        "hash": hash_value,
        "metadata": metadata
    }
    return json.dumps(message, sort_keys=True).encode()
