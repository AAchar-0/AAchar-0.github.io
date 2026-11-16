"""Builds the 1200x630 image that LinkedIn shows when the site link is shared."""
from PIL import Image  # Pillow: Python's image library

WIDTH, HEIGHT = 1200, 630        # LinkedIn's preferred size (about 1.91 : 1)
BACKGROUND = (16, 26, 36)        # same dark navy as the site (#101a24)

# Open the photo and convert to plain RGB colour (drops any transparency).
photo = Image.open("assets/photo.jpeg").convert("RGB")

# Scale so the WHOLE photo fits the card's height; nothing gets cropped.
scale = HEIGHT / photo.height
photo = photo.resize((round(photo.width * scale), HEIGHT))

# Make an empty dark canvas, then paste the photo in the horizontal centre.
card = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
card.paste(photo, ((WIDTH - photo.width) // 2, 0))

# Save as a compressed JPEG so the file stays small and loads fast.
card.save("assets/og-image.jpg", quality=85, optimize=True)
print("Saved assets/og-image.jpg", card.size)
