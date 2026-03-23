import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', encoding='utf-8') as f:
    content = f.read()

# Insert after vetClinicsComingSoon in each language section
inserts = {
    'vetClinicsComingSoon: "Vet clinics management coming soon...",': (
        '\n    diseaseHealthy: "Healthy",'
        '\n    diseaseCoccidiosis: "Coccidiosis",'
        '\n    diseaseNewCastle: "New Castle Disease",'
        '\n    diseaseSalmonella: "Salmonella",'
    ),
    'vetClinicsComingSoon: "\u092a\u0936\u0941 \u0915\u094d\u0932\u0940\u0928\u093f\u0915 \u092a\u094d\u0930\u092c\u0902\u0927\u0928 \u091c\u0932\u094d\u0926 \u0906 \u0930\u0939\u093e \u0939\u0948...",': (
        '\n    diseaseHealthy: "\u0938\u094d\u0935\u0938\u094d\u0925",'
        '\n    diseaseCoccidiosis: "\u0915\u0949\u0915\u094d\u0938\u0940\u0921\u093f\u092f\u094b\u0938\u093f\u0938",'
        '\n    diseaseNewCastle: "\u0928\u094d\u092f\u0942\u0915\u0948\u0938\u0932 \u0930\u094b\u0917",'
        '\n    diseaseSalmonella: "\u0938\u093e\u0932\u094d\u092e\u094b\u0928\u0947\u0932\u093e",'
    ),
    'vetClinicsComingSoon: "\u0caa\u0cb6\u0cc1 \u0c95\u0ccd\u0cb2\u0cbf\u0ca8\u0cbf\u0c95\u0ccd \u0ca8\u0cbf\u0cb0\u0ccd\u0cb5\u0cb9\u0ca3\u0cc6 \u0cb6\u0cc0\u0c98\u0ccd\u0cb0\u0ca6\u0cb2\u0ccd\u0cb2\u0cc7 \u0cac\u0cb0\u0cb2\u0cbf\u0ca6\u0cc6...",': (
        '\n    diseaseHealthy: "\u0c86\u0cb0\u0ccb\u0c97\u0ccd\u0caf\u0c95\u0cb0",'
        '\n    diseaseCoccidiosis: "\u0c95\u0cca\u0c95\u0ccd\u0cb8\u0cbf\u0ca1\u0cbf\u0caf\u0ccb\u0cb8\u0cbf\u0cb8\u0ccd",'
        '\n    diseaseNewCastle: "\u0ca8\u0ccd\u0caf\u0cc2\u0c95\u0cbe\u0cb8\u0cb2\u0ccd \u0cb0\u0ccb\u0c97",'
        '\n    diseaseSalmonella: "\u0cb8\u0cbe\u0cb2\u0ccd\u0cae\u0ccb\u0ca8\u0cc6\u0cb2\u0cbe",'
    ),
}

for old_str, new_suffix in inserts.items():
    if old_str in content:
        content = content.replace(old_str, old_str + new_suffix, 1)
        print(f"Inserted OK for: {old_str[:40]}")
    else:
        print(f"NOT FOUND: {old_str[:40]}")

with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
