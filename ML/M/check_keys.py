with open(r'c:\farmers-dev-new\Farmers-development\farm\frontend\src\contexts\LanguageContext.tsx', encoding='utf-8') as f:
    content = f.read()
print('File length:', len(content))
for key in ['vetDoctors', 'vetClinics', 'patients', 'appointments', 'vetClinicsComingSoon', 'vetPatientsComingSoon', 'vetAppointmentsComingSoon']:
    print(f'{key}: {content.count(key)}')
