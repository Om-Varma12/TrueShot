import base64
import json
import subprocess
import os
import tempfile

def embed_metadata(video_path, hash_value, signature, message_bytes):
    """
    Embed hash and signature into video metadata using ffmpeg.
    
    Args:
        video_path: Path to video file
        hash_value: SHA256 hash string
        signature: Signature bytes
        message_bytes: Original message bytes that was signed
        
    Returns:
        Path to video with embedded metadata
    """
    # Convert signature and message to base64 strings
    signature_b64 = base64.b64encode(signature).decode()
    message_b64 = base64.b64encode(message_bytes).decode()
    
    # Create metadata dictionary
    metadata_dict = {
        "hash": hash_value,
        "signature": signature_b64,
        "message": message_b64
    }
    
    # Convert to JSON string
    metadata_json = json.dumps(metadata_dict, sort_keys=True)
    
    # Create temporary output file
    # Ensure temp file keeps an mp4 extension so ffmpeg picks correct muxer
    temp_output = video_path + ".tmp.mp4"
    
    # Use ffmpeg to embed metadata
    # MP4 metadata is stored in format tags; we write both a JSON comment and individual fields
    try:
        cmd = [
            'ffmpeg',
            '-i', video_path,
            # Primary JSON blob (most robust)
            '-metadata', f'comment={metadata_json}',
            '-metadata', f'TrueShot={metadata_json}',
            # Redundant individual fields (for readers that drop comment)
            '-metadata', 'TrueShotHash=' + hash_value,
            '-metadata', 'TrueShotSignature=' + signature_b64,
            '-metadata', 'TrueShotMessage=' + message_b64,
            '-metadata', 'description=TrueShot verification data',
            '-codec', 'copy',          # Avoid re-encoding
            '-movflags', 'use_metadata_tags',  # Persist tags in MP4 udta
            '-y',
            temp_output
        ]
        
        subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Replace original file with metadata-embedded version
        os.replace(temp_output, video_path)
        
        return video_path
        
    except subprocess.CalledProcessError as e:
        # Clean up temp file if it exists
        if os.path.exists(temp_output):
            os.remove(temp_output)
        raise RuntimeError(f"Failed to embed metadata: {e.stderr or e}")
    except FileNotFoundError:
        raise RuntimeError("ffmpeg not found. Please install ffmpeg to embed video metadata.")


def extract_metadata(video_path):
    """
    Extract hash and signature from video metadata using ffprobe.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Tuple of (hash_value, signature_bytes, message_bytes) or None if not found
    """
    try:
        # Use ffprobe to extract metadata
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            video_path
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Parse JSON output
        probe_data = json.loads(result.stdout)
        format_info = probe_data.get('format', {})
        tags = format_info.get('tags', {}) or {}

        # Helper to read both lowercase/uppercase keys
        def _get_tag(tag_dict, key):
            return tag_dict.get(key) or tag_dict.get(key.upper())
        
        metadata_dict = None
        
        # Try format-level JSON comment first
        comment = _get_tag(tags, 'comment') or _get_tag(tags, 'TrueShot')
        if comment:
            try:
                metadata_dict = json.loads(comment)
            except json.JSONDecodeError:
                metadata_dict = None
        
        # If not found, try individual fields at format level
        if metadata_dict is None:
            hash_value = _get_tag(tags, 'TrueShotHash')
            signature_b64 = _get_tag(tags, 'TrueShotSignature')
            message_b64 = _get_tag(tags, 'TrueShotMessage')
            if hash_value and signature_b64 and message_b64:
                metadata_dict = {
                    "hash": hash_value,
                    "signature": signature_b64,
                    "message": message_b64
                }
        
        # If still not found, inspect stream tags (some muxers store tags per stream)
        if metadata_dict is None:
            streams = probe_data.get('streams', []) or []
            for stream in streams:
                stream_tags = stream.get('tags', {}) or {}
                comment = _get_tag(stream_tags, 'comment') or _get_tag(stream_tags, 'TrueShot')
                if comment:
                    try:
                        metadata_dict = json.loads(comment)
                        break
                    except json.JSONDecodeError:
                        metadata_dict = None
                if metadata_dict is None:
                    hash_value = _get_tag(stream_tags, 'TrueShotHash')
                    signature_b64 = _get_tag(stream_tags, 'TrueShotSignature')
                    message_b64 = _get_tag(stream_tags, 'TrueShotMessage')
                    if hash_value and signature_b64 and message_b64:
                        metadata_dict = {
                            "hash": hash_value,
                            "signature": signature_b64,
                            "message": message_b64
                        }
                        break
        
        if metadata_dict is None:
            return None
        
        # Extract values
        hash_value = metadata_dict.get("hash")
        signature_b64 = metadata_dict.get("signature")
        message_b64 = metadata_dict.get("message")
        
        if not all([hash_value, signature_b64, message_b64]):
            return None
        
        # Decode base64
        signature_bytes = base64.b64decode(signature_b64)
        message_bytes = base64.b64decode(message_b64)
        
        return hash_value, signature_bytes, message_bytes
        
    except subprocess.CalledProcessError as e:
        print(f"Error extracting metadata: {e}")
        return None
    except FileNotFoundError:
        raise RuntimeError("ffprobe not found. Please install ffmpeg to extract video metadata.")
    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return None

