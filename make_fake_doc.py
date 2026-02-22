from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import os

def create_spoofed_document():
    # 1. Generate 800x400 white image
    width, height = 800, 400
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # Add a border
    draw.rectangle([10, 10, width - 10, height - 10], outline="black", width=3)

    # 2. Try to load a font, otherwise fallback to default
    try:
        font_large = ImageFont.truetype("arial.ttf", 40)
        font_medium = ImageFont.truetype("arial.ttf", 28)
    except IOError:
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()

    # Add Text
    # "GOVERNMENT OF INDIA", "Name: Himanshu Patil", and "Aadhaar: 999988887777".
    draw.text((200, 40), "GOVERNMENT OF INDIA", fill="black", font=font_large)
    draw.text((50, 120), "Income Certificate", fill="black", font=font_medium)
    draw.text((50, 180), "Name: Himanshu Patil", fill="black", font=font_medium)
    draw.text((50, 230), "Aadhaar: 999988887777", fill="black", font=font_medium)

    # 3. The Spoof Trigger: print 450000 (Mismatch against 45000 payload)
    draw.text((50, 300), "TOTAL INCOME: 450000", fill="red", font=font_large)

    # 4. Add randomized pixel noise for scanner simulation
    pixels = img.load()
    for x in range(width):
        for y in range(height):
            if random.random() < 0.05:  # 5% noise density
                val = random.randint(0, 150)
                pixels[x, y] = (val, val, val)

    # Apply a slight blur to make noise look like scan artifacts
    img = img.filter(ImageFilter.BoxBlur(1))

    # 5. Save output
    output_path = "spoofed_income_cert.png"
    img.save(output_path)
    print(f"Generated test artifact: {output_path}")

if __name__ == "__main__":
    create_spoofed_document()
