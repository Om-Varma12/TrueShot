import numpy as np

def combine_seconds(frames):
    """
    Combine frames from all seconds into a single matrix.
    Stacks frames vertically to create a combined representation.
    
    Args:
        frames: List of frames (one per second), each frame is (256, 256, 3)
        
    Returns:
        Combined matrix of shape (256 * num_seconds, 256, 3)
    """
    if not frames:
        raise ValueError("No frames to combine")
    
    # Stack frames vertically
    combined = np.vstack(frames)
    return combined

