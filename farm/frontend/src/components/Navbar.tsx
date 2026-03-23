import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Crown, Bell } from "lucide-react";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";
import { authApi } from "@/Backend/api/todoApi";
import { useCart } from "@/contexts/CartContext"; // Import useCart hook

const Navbar = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { cartItemCount } = useCart(); // Use useCart hook to get cartItemCount

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    authApi.logout();
    navigate(0);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/Farming Logo.ico" 
              alt="AgroArmor Logo" 
              className="w-8 h-8" 
              style={{ 
                objectFit: 'contain',
                imageRendering: 'auto'
              }}
            />
            <span className="text-2xl font-bold text-primary">{t('title')}</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('home')}
            </Link>
            <Link
              to="/awareness"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/awareness') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('awareness')}
            </Link>
            <Link
              to="/hygiene-test"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/hygiene-test') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('hygieneTest')}
            </Link>
            <Link
              to="/todo-list"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/todo-list') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('todoList')}
            </Link>
            <Link
              to="/marketplace"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/marketplace') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('marketplace')}
            </Link>
            <Link
              to="/gps-tracking"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/gps-tracking') ? "text-primary" : "text-muted-foreground"
              )}
            >
              🗺️ {t('gpsTracking')}
            </Link>
            <Link
              to="/medical"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/medical') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('vetDoctors')}
            </Link>
            <Link
              to="/compliance"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/compliance') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('compliance')}
            </Link>
            <Link
              to="/subscription"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/subscription') ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Crown className="w-4 h-4 inline mr-1" />
              {t('premium')}
            </Link>
            <Link
              to="/about"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive('/about') ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t('aboutTitle')}
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNotificationOpen(true)}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {/* Notification badge - now displays cart item count */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white items-center justify-center">
                    {cartItemCount}
                  </span>
                </span>
              )}
            </Button>
            
            <LanguageSelector />
            <Button variant="ghost" className="text-sm" onClick={handleLogout}>
              {t('logout')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
