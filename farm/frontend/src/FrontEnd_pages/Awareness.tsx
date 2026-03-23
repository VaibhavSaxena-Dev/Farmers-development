import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Pill, Shield } from "lucide-react";

const Awareness = () => {
  const { t } = useLanguage();

  const DiseaseCard = ({ 
    title, 
    symptoms, 
    treatment, 
    prevention 
  }: { 
    title: string; 
    symptoms: string; 
    treatment: string; 
    prevention: string;
  }) => (
    <Card className="mb-6 shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h4 className="font-semibold text-lg">{t('symptoms')}</h4>
          </div>
          <p className="text-muted-foreground ml-7">{symptoms}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Pill className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-lg">{t('treatment')}</h4>
          </div>
          <p className="text-muted-foreground ml-7">{treatment}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-lg">{t('prevention')}</h4>
          </div>
          <p className="text-muted-foreground ml-7">{prevention}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl animate-fade-in">
        <h1 className="text-4xl font-bold mb-8 text-center gradient-primary bg-clip-text text-transparent">{t('awarenessTitle')}</h1>
        
        <Tabs defaultValue="poultry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="poultry" className="text-lg">
              {t('poultryDiseases')}
            </TabsTrigger>
            <TabsTrigger value="cattle" className="text-lg">
              {t('cattleDiseases')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="poultry">
            <DiseaseCard
              title={t('newcastleDisease')}
              symptoms={t('newcastleSymptoms')}
              treatment={t('newcastleTreatment')}
              prevention={t('newcastlePrevention')}
            />
            
            <DiseaseCard
              title={t('fowlPox')}
              symptoms={t('fowlPoxSymptoms')}
              treatment={t('fowlPoxTreatment')}
              prevention={t('fowlPoxPrevention')}
            />
            
            <DiseaseCard
              title={t('coccidiosis')}
              symptoms={t('coccidiosisSymptoms')}
              treatment={t('coccidiosisTreatment')}
              prevention={t('coccidiosisPrevention')}
            />
          </TabsContent>
          
          <TabsContent value="cattle">
            <DiseaseCard
              title={t('fmd')}
              symptoms={t('fmdSymptoms')}
              treatment={t('fmdTreatment')}
              prevention={t('fmdPrevention')}
            />
            
            <DiseaseCard
              title={t('mastitis')}
              symptoms={t('mastitisSymptoms')}
              treatment={t('mastitisTreatment')}
              prevention={t('mastitisPrevention')}
            />
            
            <DiseaseCard
              title={t('blackQuarter')}
              symptoms={t('blackQuarterSymptoms')}
              treatment={t('blackQuarterTreatment')}
              prevention={t('blackQuarterPrevention')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Awareness;
