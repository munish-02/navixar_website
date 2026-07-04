from PIL import Image
import sys

def verify(path):
    try:
        with Image.open(path) as img:
            img.verify()
            print(f"{path}: OK, format={img.format}, size={img.size}, mode={img.mode}")
    except Exception as e:
        print(f"{path}: ERROR {e}")

verify('images/navixar_gameplay.jpg')
verify('images/navixar_hero.jpg')
