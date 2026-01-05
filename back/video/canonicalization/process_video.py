import cv2
import numpy as np
from .pipeline import canonicalize

def process_video_file(video_path):
    """
    Process video file to extract frames per second, canonicalize, and combine.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Combined canonicalized matrix representing all seconds
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Failed to open video file: {video_path}")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30  # Default fallback
    
    frames_per_second = []
    current_second = -1
    frames_in_current_second = []
    
    frame_number = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Calculate which second this frame belongs to
        frame_second = int(frame_number / fps)
        
        if frame_second != current_second:
            # We've moved to a new second
            if frames_in_current_second:
                # Average frames in the previous second to get representative frame
                second_matrix = np.mean(frames_in_current_second, axis=0).astype(np.uint8)
                frames_per_second.append(second_matrix)
            
            current_second = frame_second
            frames_in_current_second = [frame]
        else:
            frames_in_current_second.append(frame)
        
        frame_number += 1
    
    cap.release()
    
    # Handle the last second if we have frames
    if frames_in_current_second:
        second_matrix = np.mean(frames_in_current_second, axis=0).astype(np.uint8)
        frames_per_second.append(second_matrix)
    
    if not frames_per_second:
        raise ValueError("No frames extracted from video")
    
    # Canonicalize: normalize, resize, and combine all seconds
    combined_matrix = canonicalize(frames_per_second)
    
    return combined_matrix

