import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-farm.jpg";
import awarenessImage from "@/assets/awareness.jpg";
import hygieneImage from "@/assets/hygeine.jpg";
import vetImage from "@/assets/veternary.jpg";
import { BookOpen, ClipboardCheck, Users } from "lucide-react";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg">
            {t('subtitle')}
          </p>
          <Link to="/awareness">
            <Button size="lg" className="text-lg px-8 py-6 shadow-glow hover:scale-105 transition-transform">
              {t('getStarted')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-16">{t('features')}</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 animate-slide-up">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('feature1Title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('feature1Desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={awarenessImage} 
                  alt="Disease awareness" 
                  className="w-full h-48 object-cover rounded-md hover:scale-105 transition-transform"
                />
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('feature2Title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('feature2Desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={hygieneImage} 
                  alt="Hygiene assessment" 
                  className="w-full h-48 object-cover rounded-md hover:scale-105 transition-transform"
                />
              </CardContent>
            </Card>

            <Card className="shadow-elegant hover:shadow-glow transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{t('feature3Title')}</CardTitle>
                <CardDescription className="text-base">
                  {t('feature3Desc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <img 
                  src={vetImage} 
                  alt="Expert guidance" 
                  className="w-full h-48 object-cover rounded-md hover:scale-105 transition-transform"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
