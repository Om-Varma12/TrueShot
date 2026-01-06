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
    temp_output = video_path + ".tmp"
    
    # Use ffmpeg to embed metadata
    # MP4 metadata is stored in the 'comment' field or custom metadata fields
    try:
        # Method 1: Use comment field (most compatible)
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-metadata', f'comment={metadata_json}',
            '-metadata', f'description=TrueShot verification data',
            '-codec', 'copy',  # Copy codec to avoid re-encoding
            '-y',  # Overwrite output file
            temp_output
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Replace original file with metadata-embedded version
        os.replace(temp_output, video_path)
        
        return video_path
        
    except subprocess.CalledProcessError as e:
        # If ffmpeg fails, try alternative method using custom metadata
        try:
            # Alternative: Use custom metadata fields
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-metadata', 'TrueShotHash=' + hash_value,
                '-metadata', 'TrueShotSignature=' + signature_b64,
                '-metadata', 'TrueShotMessage=' + message_b64,
                '-codec', 'copy',
                '-y',
                temp_output
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            
            os.replace(temp_output, video_path)
            return video_path
            
        except Exception as e2:
            # Clean up temp file if it exists
            if os.path.exists(temp_output):
                os.remove(temp_output)
            raise RuntimeError(f"Failed to embed metadata: {e2}")
    
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
        tags = format_info.get('tags', {})
        
        # Try to get metadata from comment field first
        comment = tags.get('comment') or tags.get('COMMENT')
        
        if comment:
            try:
                metadata_dict = json.loads(comment)
            except json.JSONDecodeError:
                # If comment is not JSON, try individual fields
                hash_value = tags.get('TrueShotHash') or tags.get('TRUESHOTHASH')
                signature_b64 = tags.get('TrueShotSignature') or tags.get('TRUESHOTSIGNATURE')
                message_b64 = tags.get('TrueShotMessage') or tags.get('TRUESHOTMESSAGE')
                
                if hash_value and signature_b64 and message_b64:
                    metadata_dict = {
                        "hash": hash_value,
                        "signature": signature_b64,
                        "message": message_b64
                    }
                else:
                    return None
        else:
            # Try individual metadata fields
            hash_value = tags.get('TrueShotHash') or tags.get('TRUESHOTHASH')
            signature_b64 = tags.get('TrueShotSignature') or tags.get('TRUESHOTSIGNATURE')
            message_b64 = tags.get('TrueShotMessage') or tags.get('TRUESHOTMESSAGE')
            
            if hash_value and signature_b64 and message_b64:
                metadata_dict = {
                    "hash": hash_value,
                    "signature": signature_b64,
                    "message": message_b64
                }
            else:
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

