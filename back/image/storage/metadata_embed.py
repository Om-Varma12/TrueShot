import base64
import json
from PIL import Image
from PIL.ExifTags import TAGS
import io

try:
    import piexif
    HAS_PIEXIF = True
except ImportError:
    HAS_PIEXIF = False

def embed_metadata(image_path, hash_value, signature, message_bytes):
    """
    Embed hash and signature into image metadata.
    Uses PNG text chunks for PNG files, EXIF for JPEG files.
    
    Args:
        image_path: Path to image file
        hash_value: SHA256 hash string
        signature: Signature bytes
        message_bytes: Original message bytes that was signed
        
    Returns:
        Path to image with embedded metadata
    """
    # Load image
    img = Image.open(image_path)
    
    # Convert signature and message to base64 strings for storage
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
    
    # Determine file format
    file_format = img.format.lower() if img.format else image_path.split('.')[-1].lower()
    
    if file_format == 'png':
        # PNG: Use text chunks (tEXt chunks)
        # PIL automatically saves items in img.info as PNG text chunks when saving PNG format
        # We'll use a custom key "TrueShot" to store JSON data
        # Update the info dict
        if img.info:
            img.info['TrueShot'] = metadata_json
            img.info['TrueShotHash'] = hash_value
            img.info['TrueShotSignature'] = signature_b64
            img.info['TrueShotMessage'] = message_b64
        else:
            img.info = {
                'TrueShot': metadata_json,
                'TrueShotHash': hash_value,
                'TrueShotSignature': signature_b64,
                'TrueShotMessage': message_b64
            }
        
        # Save PNG with text chunks (PIL automatically saves img.info as PNG text chunks)
        img.save(image_path, format='PNG')
        return image_path
        
    elif file_format in ['jpeg', 'jpg']:
        # JPEG: Use EXIF data
        if HAS_PIEXIF:
            # Use piexif for better EXIF handling
            try:
                exif_dict = piexif.load(img.info.get('exif', b''))
            except:
                exif_dict = {"0th": {}, "Exif": {}, "GPS": {}, "1st": {}}
            
            # Store in EXIF UserComment (tag 0x9286 in Exif IFD)
            exif_dict["Exif"][piexif.ExifIFD.UserComment] = metadata_json.encode('utf-8')
            
            # Convert back to bytes
            exif_bytes = piexif.dump(exif_dict)
            img.save(image_path, format='JPEG', exif=exif_bytes)
        else:
            # Fallback: Use PIL's info dict (limited persistence)
            # Note: This may not persist in all JPEG readers
            img.info['TrueShot'] = metadata_json
            img.info['TrueShotHash'] = hash_value
            img.info['TrueShotSignature'] = signature_b64
            img.info['TrueShotMessage'] = message_b64
            
            # Try to preserve existing EXIF
            existing_exif = img.info.get('exif')
            if existing_exif:
                img.save(image_path, format='JPEG', exif=existing_exif)
            else:
                img.save(image_path, format='JPEG')
        return image_path
    
    # Default: Save image (shouldn't reach here for PNG/JPEG)
    img.save(image_path, format=file_format.upper())
    
    return image_path


def extract_metadata(image_path):
    """
    Extract hash and signature from image metadata.
    
    Args:
        image_path: Path to image file
        
    Returns:
        Tuple of (hash_value, signature_bytes, message_bytes) or None if not found
    """
    try:
        img = Image.open(image_path)
        file_format = img.format.lower() if img.format else image_path.split('.')[-1].lower()
        
        if file_format == 'png':
            # Extract from PNG text chunks
            # PIL loads PNG text chunks into img.info dict
            if not img.info:
                return None
                
            metadata_json = img.info.get('TrueShot')
            if metadata_json:
                try:
                    metadata_dict = json.loads(metadata_json)
                except json.JSONDecodeError:
                    # Try individual fields if JSON parsing fails
                    hash_value = img.info.get('TrueShotHash')
                    signature_b64 = img.info.get('TrueShotSignature')
                    message_b64 = img.info.get('TrueShotMessage')
                    
                    if hash_value and signature_b64 and message_b64:
                        metadata_dict = {
                            "hash": hash_value,
                            "signature": signature_b64,
                            "message": message_b64
                        }
                    else:
                        return None
            else:
                # Try individual fields
                hash_value = img.info.get('TrueShotHash')
                signature_b64 = img.info.get('TrueShotSignature')
                message_b64 = img.info.get('TrueShotMessage')
                
                if hash_value and signature_b64 and message_b64:
                    metadata_dict = {
                        "hash": hash_value,
                        "signature": signature_b64,
                        "message": message_b64
                    }
                else:
                    return None
            
        elif file_format in ['jpeg', 'jpg']:
            # Try to extract from EXIF first
            if HAS_PIEXIF:
                try:
                    exif_dict = piexif.load(img.info.get('exif', b''))
                    user_comment = exif_dict.get("Exif", {}).get(piexif.ExifIFD.UserComment)
                    if user_comment:
                        if isinstance(user_comment, bytes):
                            metadata_json = user_comment.decode('utf-8')
                        else:
                            metadata_json = str(user_comment)
                        metadata_dict = json.loads(metadata_json)
                    else:
                        return None
                except:
                    # Fallback to info dict
                    metadata_json = img.info.get('TrueShot')
                    if not metadata_json:
                        return None
                    metadata_dict = json.loads(metadata_json)
            else:
                # Try to extract from info dict (PIL fallback)
                metadata_json = img.info.get('TrueShot')
                if metadata_json:
                    metadata_dict = json.loads(metadata_json)
                else:
                    # Try individual fields from info
                    hash_value = img.info.get('TrueShotHash')
                    signature_b64 = img.info.get('TrueShotSignature')
                    message_b64 = img.info.get('TrueShotMessage')
                    
                    if hash_value and signature_b64 and message_b64:
                        metadata_dict = {
                            "hash": hash_value,
                            "signature": signature_b64,
                            "message": message_b64
                        }
                    else:
                        return None
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
        
    except Exception as e:
        print(f"Error extracting metadata: {e}")
        return None

