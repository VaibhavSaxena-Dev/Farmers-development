import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', encoding='utf-8') as f:
    content = f.read()

import re

for pat in ['disease', 'Disease', 'salmonella', 'Salmonella', 'prediction', 'Healthy', 'Newcastle', 'Coccidiosis']:
    count = content.count(pat)
    print(f"'{pat}': {count} occurrences")
