import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Heart } from "lucide-react";
import farmerImage from "@/assets/farmer-portrait.jpg";
import vetImage from "@/assets/vet-consultation.jpg";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="animate-fade-in">
          <h1 className="text-5xl font-bold mb-6 text-center gradient-primary bg-clip-text text-transparent">
            {t('aboutTitle')}
          </h1>
          <p className="text-xl text-center text-muted-foreground mb-12">
            {t('aboutSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12 animate-slide-up">
          <div className="space-y-6">
            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="pt-6">
                <img 
                  src={farmerImage} 
                  alt="Indian farmer" 
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('aboutText')}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Heart className="w-6 h-6 text-primary" />
                  {t('ourMission')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('missionText')}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300">
              <CardContent className="pt-6">
                <img 
                  src={vetImage} 
                  alt="Veterinary consultation" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-2xl">{t('contactUs')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('emailLabel')}</p>
                    <p className="font-medium">support@kisanseva.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('phoneLabel')}</p>
                    <p className="font-medium">+91 1800-XXX-XXXX</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
