from .normalize import normalize_brightness
from .resize import resize_image

def canonicalize(img):
    img = normalize_brightness(img)
    img = resize_image(img)
    return img
