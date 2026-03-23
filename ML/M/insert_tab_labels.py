with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', encoding='utf-8') as f:
    content = f.read()

# Keys to insert after each vetDoctors line in each language
inserts = {
    # en: after 'vetDoctors: "Vet Doctors",'
    'vetDoctors: "Vet Doctors",': '\n    vetClinics: "Vet Clinics",\n    patients: "Patients",\n    appointments: "Appointments",',
    # hi: after 'vetDoctors: "पशु चिकित्सक",'
    'vetDoctors: "\u092a\u0936\u0941 \u091a\u093f\u0915\u093f\u0924\u094d\u0938\u0915",': '\n    vetClinics: "\u092a\u0936\u0941 \u0915\u094d\u0932\u0940\u0928\u093f\u0915",\n    patients: "\u092e\u0930\u0940\u091c\u093c",\n    appointments: "\u0905\u092a\u0949\u0907\u0902\u091f\u092e\u0947\u0902\u091f",',
    # kn: after 'vetDoctors: "ವೆಟ್ ವೈದ್ಯರು",'
    'vetDoctors: "\u0cb5\u0cc6\u0c9f\u0ccd \u0cb5\u0cc8\u0ca6\u0ccd\u0caf\u0cb0\u0cc1",': '\n    vetClinics: "\u0cb5\u0cc6\u0c9f\u0ccd \u0c95\u0ccd\u0cb2\u0cbf\u0ca8\u0cbf\u0c95\u0ccd",\n    patients: "\u0cb0\u0ccb\u0c97\u0cbf\u0c97\u0cb3\u0cc1",\n    appointments: "\u0ca8\u0cc7\u0cae\u0c95\u0cbe\u0ca4\u0cbf\u0c97\u0cb3\u0cc1",',
}

for old_str, new_suffix in inserts.items():
    if old_str in content:
        content = content.replace(old_str, old_str + new_suffix, 1)
        print(f"Inserted after: {old_str[:40]}...")
    else:
        print(f"NOT FOUND: {old_str[:40]}...")

with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
