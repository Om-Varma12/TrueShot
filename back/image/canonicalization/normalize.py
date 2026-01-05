import cv2
import numpy as np

def normalize_brightness(img):
    """
    Global brightness + contrast normalization on luminance
    """
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)

    y = cv2.normalize(y, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

    ycrcb_norm = cv2.merge([y, cr, cb])
    return cv2.cvtColor(ycrcb_norm, cv2.COLOR_YCrCb2BGR)
