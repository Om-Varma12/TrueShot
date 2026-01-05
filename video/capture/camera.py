import cv2
import time
import os

def capture_video(camera_id=0, duration_seconds=5, output_path=None):
    """
    Capture video for specified duration and save as video file.
    
    Args:
        camera_id: Camera device ID
        duration_seconds: Duration to record
        output_path: Path to save the video file (e.g., "storage/video.mp4")
    
    Returns:
        Path to the saved video file
    """
    cap = cv2.VideoCapture(camera_id)
    if not cap.isOpened():
        raise RuntimeError("Camera not accessible")
    
    # Get camera properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30  # Default fallback
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    if output_path is None:
        output_path = "storage/video.mp4"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Define codec and create VideoWriter
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    print(f"Recording {duration_seconds} seconds of video...")
    start_time = time.time()
    
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        elapsed = time.time() - start_time
        if elapsed >= duration_seconds:
            break
        
        out.write(frame)
        frame_count += 1
        
        # Show progress
        if frame_count % int(fps) == 0:
            print(f"Recorded {int(elapsed) + 1}/{duration_seconds} seconds")
    
    cap.release()
    out.release()
    
    print(f"✅ Video saved to {output_path}")
    return output_path
