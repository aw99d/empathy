import re
import urllib.parse
import urllib.request
import os

with open('/tmp/empathy_js.js') as f:
    content = f.read()

# Match image:`...` or image:"..." or image:'...'
images = re.findall(r'image:\s*[`\'"]([^`\'"]+)[`\'"]', content)
fallback_images = re.findall(r'fallbackImage:\s*[`\'"]([^`\'"]+)[`\'"]', content)
default_images = re.findall(r'(?:defaultPlaceholderImage|generatedAssetFallback):\s*[`\'"]([^`\'"]+)[`\'"]', content)

all_images = set(images + fallback_images + default_images)
print(f"Total unique images referenced: {len(all_images)}")
for img in sorted(all_images):
    print("Image ref:", repr(img))

base_url = "https://empathy1.netlify.app"
success = 0
failed = 0

os.makedirs('public/images', exist_ok=True)

for img in sorted(all_images):
    if not img.startswith('/'):
        continue
    encoded_url = base_url + urllib.parse.quote(img)
    local_path = 'public' + img
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    try:
        req = urllib.request.Request(encoded_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(local_path, 'wb') as out_f:
            out_f.write(resp.read())
        print(f"Downloaded: {img} -> {os.path.getsize(local_path)} bytes")
        success += 1
    except Exception as e:
        print(f"Failed to download {img}: {e}")
        failed += 1

print(f"Result: {success} downloaded, {failed} failed")
