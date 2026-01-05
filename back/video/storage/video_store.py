import cv2
import os

def save_video_file(frames, output_path, fps=30):
    """
    Save frames as a video file.
    Note: This is a helper function if needed, but capture_video handles saving directly.
    """
    if not frames:
        raise ValueError("No frames to save")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    height, width = frames[0].shape[:2]
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    for frame in frames:
        out.write(frame)
    
    out.release()

def video_file_exists(video_path):
    """Check if video file exists."""
    return os.path.exists(video_path)
