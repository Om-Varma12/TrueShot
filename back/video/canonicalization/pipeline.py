import numpy as np
from .normalize import normalize_brightness
from .resize import resize_image
from .combine import combine_seconds

def canonicalize(frames_per_second):
    """
    Canonicalize video by:
    1. Normalizing brightness for each second's frame
    2. Resizing each frame
    3. Combining all seconds into a single matrix
    
    Args:
        frames_per_second: List of frames, one per second
        
    Returns:
        Combined canonicalized video matrix
    """
    normalized_frames = []
    
    for frame in frames_per_second:
        # Normalize brightness for each second's representative frame
        normalized = normalize_brightness(frame)
        # Resize each frame
        resized = resize_image(normalized)
        normalized_frames.append(resized)
    
    # Combine all seconds into a single matrix
    combined_matrix = combine_seconds(normalized_frames)
    
    return combined_matrix
