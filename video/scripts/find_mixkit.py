import urllib.request
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

categories = [
    ('credit-card', 'https://mixkit.co/free-stock-video/credit-card/'),
    ('atm', 'https://mixkit.co/free-stock-video/atm/'),
    ('night-city', 'https://mixkit.co/free-stock-video/night-city/'),
    ('server', 'https://mixkit.co/free-stock-video/server/'),
    ('cyber-security', 'https://mixkit.co/free-stock-video/cyber-security/'),
    ('phone', 'https://mixkit.co/free-stock-video/smartphone/'),
    ('family', 'https://mixkit.co/free-stock-video/family/'),
    ('coding', 'https://mixkit.co/free-stock-video/coding/'),
]

for name, url in categories:
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            matches = list(set(re.findall(r'https://assets\.mixkit\.co/videos/[^"\'\s]+\.mp4', html)))
            print(f"Category '{name}': found {len(matches)} MP4s")
            for m in matches[:3]:
                print(f"  {m}")
    except Exception as e:
        print(f"Category '{name}' error:", e)
