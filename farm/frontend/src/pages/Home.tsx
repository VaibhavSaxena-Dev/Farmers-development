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
    </div>
  );
};

export default Home;