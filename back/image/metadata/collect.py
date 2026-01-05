import time
import platform

def collect_metadata():
    return {
        "timestamp": int(time.time()),
        "platform": platform.system(),
        "platform_version": platform.version()
    }
