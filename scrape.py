
import urllib.request, re
req = urllib.request.Request('https://leveragegreenheights.in/', headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        html = r.read().decode('utf-8', errors='ignore')
        for m in re.findall(r'src="([^"]+)"', html):
            print('SRC:', m)
except Exception as e:
    print(e)
