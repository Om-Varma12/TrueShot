import cv2

CANONICAL_SIZE = (256, 256)

def resize_image(img):
    return cv2.resize(img, CANONICAL_SIZE, interpolation=cv2.INTER_AREA)
