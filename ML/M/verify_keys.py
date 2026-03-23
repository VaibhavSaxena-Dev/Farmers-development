import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', encoding='utf-8') as f:
    content = f.read()

import re
for m in re.finditer(r'vetClinics: "[^"]*"', content):
    pos = m.start()
    print(f"pos={pos}: {repr(content[pos:pos+60])}")

print()
for m in re.finditer(r'patients: "[^"]*"', content):
    pos = m.start()
    print(f"pos={pos}: {repr(content[pos:pos+60])}")

print()
for m in re.finditer(r'appointments: "[^"]*"', content):
    pos = m.start()
    print(f"pos={pos}: {repr(content[pos:pos+60])}")
