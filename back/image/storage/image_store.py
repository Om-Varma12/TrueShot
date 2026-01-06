import cv2
import os
import numpy as np
from PIL import Image

def save_image(img, path):
    """
    Save image and return path for metadata embedding.
    Note: For PNG files, we'll use PIL to save so we can embed metadata.
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    # Convert BGR to RGB if needed (OpenCV uses BGR, PIL uses RGB)
    if len(img.shape) == 3 and img.shape[2] == 3:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    else:
        img_rgb = img
    
    # Convert numpy array to PIL Image
    pil_img = Image.fromarray(img_rgb)
    
    # Save with PIL (supports metadata embedding)
    pil_img.save(path)
    
    return path
