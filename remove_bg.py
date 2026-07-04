from PIL import Image
import os

def remove_white_bg(img_path):
    if not os.path.exists(img_path): return
    img = Image.open(img_path)
    img = img.convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # If the pixel is close to white, make it transparent
        if item[0] > 220 and item[1] > 220 and item[2] > 220:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(img_path, "PNG")

remove_white_bg("images/cow.png")
remove_white_bg("images/chai_walla.png")
print("Backgrounds removed.")
