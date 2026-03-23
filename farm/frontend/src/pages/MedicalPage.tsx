import React from 'react';
import MedicalDashboard from '@/components/MedicalDashboard';
import DiseaseDetection from '@/components/DiseaseDetection';
import Navbar from '@/components/Navbar';

import { useLanguage } from '@/contexts/LanguageContext';

const MedicalPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('vetDoctorsPageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('vetDoctorsPageDesc')}
          </p>
        </div>
        <DiseaseDetection />
        <MedicalDashboard />
      </div>
    </div>
  );
};

export default MedicalPage;
