import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SpeechButton } from "@/components/ui/speech-button";
import { useToast } from "@/hooks/use-toast";
import CheckoutModal from "@/components/CheckoutModal";
import poultryFeedImg from "@/assets/poultry-farm.jpg";
import vaccineImg from "@/assets/newcastle-disease.jpg";
import cattleFeedImg from "@/assets/cattle-health.jpg";
import { useCart } from "@/contexts/CartContext"; // Import useCart hook
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Package,
  Leaf,
  Droplets,
  Shield,
  Check
} from "lucide-react";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  seller: {
    name: string;
    location: string;
    rating: number;
    phone: string;
  };
  image: string;
  inStock: boolean;
  deliveryAvailable: boolean;
  features: string[];
  benefits: string[];
  sku: string;
  weight?: string;
  origin?: string;
  categoryLabel: string;
  /** Link to product info / images (e.g. Google search) */
  infoUrl?: string;
}

const Marketplace = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { cart, addToCart, clearCart } = useCart(); // Use useCart hook
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [cart, setCart] = useState<MarketplaceItem[]>([]); // Removed local cart state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<MarketplaceItem | null>(null);

  const categories = [
    { id: "all", nameKey: "allProducts", icon: <Package className="w-4 h-4" /> },
    { id: "vaccines", nameKey: "vaccinesLabel", icon: <Shield className="w-4 h-4" /> },
    { id: "feed", nameKey: "animalFeed", icon: <Leaf className="w-4 h-4" /> },
  ];

  const defaultSeller = { name: "AgroArmor Farm Supplies", location: "India", rating: 4.8, phone: "+91 9876543210" };
  const defaultFeatures = ["Quality assured", "Delivery available", "Verified seller"];
  const defaultBenefits = ["Trusted by farmers", "Best prices"];

  const marketplaceItems: MarketplaceItem[] = useMemo(() => [
    // Vaccines
    { id: "v1", name: t("marketplaceItem2Name"), description: t("marketplaceItem2Description"), price: 850, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "FMD-PV-100", weight: "100 ml", origin: "India", features: [t("marketplaceItem2Feature1"), t("marketplaceItem2Feature2"), t("marketplaceItem2Feature3"), t("marketplaceItem2Feature4")], benefits: [t("marketplaceItem2Benefit1"), t("marketplaceItem2Benefit2"), t("marketplaceItem2Benefit3"), t("marketplaceItem2Benefit4")], infoUrl: "https://www.google.com/search?q=FMD+vaccine(polyvalent)" },
    { id: "v2", name: t("vaccineItem2Name"), description: t("vaccineItem2Desc"), price: 650, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "LSD-50", weight: "50 doses", origin: "India", features: [t("vaccineItem2F1"), t("vaccineItem2F2"), t("vaccineItem2F3"), t("vaccineItem2F4")], benefits: [t("vaccineItem2B1"), t("vaccineItem2B2"), t("vaccineItem2B3"), t("vaccineItem2B4")], infoUrl: "https://www.google.com/search?q=LSD+vaccine" },
    { id: "v3", name: t("vaccineItem3Name"), description: t("vaccineItem3Desc"), price: 720, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "BVD-100", weight: "100 ml", origin: "India", features: [t("vaccineItem3F1"), t("vaccineItem3F2"), t("vaccineItem3F3"), t("vaccineItem3F4")], benefits: [t("vaccineItem3B1"), t("vaccineItem3B2"), t("vaccineItem3B3"), t("vaccineItem3B4")], infoUrl: "https://www.google.com/search?q=bvd+vaccine" },
    { id: "v4", name: t("vaccineItem4Name"), description: t("vaccineItem4Desc"), price: 580, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "IBR-M-50", weight: "50 doses", origin: "India", features: [t("vaccineItem4F1"), t("vaccineItem4F2"), t("vaccineItem4F3"), t("vaccineItem4F4")], benefits: [t("vaccineItem4B1"), t("vaccineItem4B2"), t("vaccineItem4B3"), t("vaccineItem4B4")], infoUrl: "https://www.google.com/search?q=IBR+Marker+vaccine" },
    { id: "v5", name: t("vaccineItem5Name"), description: t("vaccineItem5Desc"), price: 450, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "ND-LR-200", weight: "200 doses", origin: "India", features: [t("vaccineItem5F1"), t("vaccineItem5F2"), t("vaccineItem5F3"), t("vaccineItem5F4")], benefits: [t("vaccineItem5B1"), t("vaccineItem5B2"), t("vaccineItem5B3"), t("vaccineItem5B4")], infoUrl: "https://www.google.com/search?q=Newcastle+vaccine(Lasota,R2B)" },
    { id: "v6", name: t("vaccineItem6Name"), description: t("vaccineItem6Desc"), price: 380, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "FP-100", weight: "100 doses", origin: "India", features: [t("vaccineItem6F1"), t("vaccineItem6F2"), t("vaccineItem6F3"), t("vaccineItem6F4")], benefits: [t("vaccineItem6B1"), t("vaccineItem6B2"), t("vaccineItem6B3"), t("vaccineItem6B4")], infoUrl: "https://www.google.com/search?q=fowl+pox+vaccine" },
    { id: "v7", name: t("vaccineItem7Name"), description: t("vaccineItem7Desc"), price: 420, category: "vaccines", seller: defaultSeller, image: vaccineImg, inStock: true, deliveryAvailable: true, categoryLabel: t("vaccinesLabel"), sku: "IB-200", weight: "200 doses", origin: "India", features: [t("vaccineItem7F1"), t("vaccineItem7F2"), t("vaccineItem7F3"), t("vaccineItem7F4")], benefits: [t("vaccineItem7B1"), t("vaccineItem7B2"), t("vaccineItem7B3"), t("vaccineItem7B4")], infoUrl: "https://www.google.com/search?q=IB+vaccine" },
    // Feed & Fodder
    { id: "f1", name: t("vaccineItem9Name"), description: t("vaccineItem9Desc"), price: 120, category: "feed", seller: defaultSeller, image: poultryFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "FOD-1", weight: "per bundle", origin: "Local", features: [t("vaccineItem9F1"), t("vaccineItem9F2"), t("vaccineItem9F3"), t("vaccineItem9F4")], benefits: [t("vaccineItem9B1"), t("vaccineItem9B2"), t("vaccineItem9B3"), t("vaccineItem9B4")], infoUrl: "https://www.google.com/search?q=fodder" },
    { id: "f2", name: t("vaccineItem10Name"), description: t("vaccineItem10Desc"), price: 80, category: "feed", seller: defaultSeller, image: cattleFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "HAY-1", weight: "per kg", origin: "Local", features: [t("vaccineItem10F1"), t("vaccineItem10F2"), t("vaccineItem10F3"), t("vaccineItem10F4")], benefits: [t("vaccineItem10B1"), t("vaccineItem10B2"), t("vaccineItem10B3"), t("vaccineItem10B4")], infoUrl: "https://www.google.com/search?q=hay" },
    { id: "f3", name: t("vaccineItem11Name"), description: t("vaccineItem11Desc"), price: 950, category: "feed", seller: defaultSeller, image: cattleFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "CF-50", weight: "50 kg", origin: "India", features: [t("vaccineItem11F1"), t("vaccineItem11F2"), t("vaccineItem11F3"), t("vaccineItem11F4")], benefits: [t("vaccineItem11B1"), t("vaccineItem11B2"), t("vaccineItem11B3"), t("vaccineItem11B4")], infoUrl: "https://www.google.com/search?q=cattle+feed+concentrate" },
    { id: "f4", name: t("vaccineItem12Name"), description: t("vaccineItem12Desc"), price: 750, category: "feed", seller: defaultSeller, image: poultryFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "MASH-50", weight: "50 kg", origin: "India", features: [t("vaccineItem12F1"), t("vaccineItem12F2"), t("vaccineItem12F3"), t("vaccineItem12F4")], benefits: [t("vaccineItem12B1"), t("vaccineItem12B2"), t("vaccineItem12B3"), t("vaccineItem12B4")], infoUrl: "https://www.google.com/search?q=mash+feed" },
    { id: "f5", name: t("vaccineItem13Name"), description: t("vaccineItem13Desc"), price: 880, category: "feed", seller: defaultSeller, image: poultryFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "PEL-50", weight: "50 kg", origin: "India", features: [t("vaccineItem13F1"), t("vaccineItem13F2"), t("vaccineItem13F3"), t("vaccineItem13F4")], benefits: [t("vaccineItem13B1"), t("vaccineItem13B2"), t("vaccineItem13B3"), t("vaccineItem13B4")], infoUrl: "https://www.google.com/search?q=pellet+feed" },
    { id: "f6", name: t("vaccineItem14Name"), description: t("vaccineItem14Desc"), price: 650, category: "feed", seller: defaultSeller, image: cattleFeedImg, inStock: true, deliveryAvailable: true, categoryLabel: t("animalFeed"), sku: "GM-25", weight: "25 kg", origin: "India", features: [t("vaccineItem14F1"), t("vaccineItem14F2"), t("vaccineItem14F3"), t("vaccineItem14F4")], benefits: [t("vaccineItem14B1"), t("vaccineItem14B2"), t("vaccineItem14B3"), t("vaccineItem14B4")], infoUrl: "https://www.google.com/search?q=grain+mix" },
  ], [t]);

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Removed paymentItems aggregation as cart already handles quantities
  /*
  const paymentItems = Object.values(
    cart.reduce((acc, item) => {
      if (!acc[item.id]) {
        acc[item.id] = {
          name: item.name,
          quantity: 0,
          price: item.price,
          category: item.category,
        };
      }
      acc[item.id].quantity += 1;
      return acc;
    }, {} as Record<string, { name: string; quantity: number; price: number; category: string }>)
  );
  */

  const handleVoiceSearch = (text: string) => {
    setSearchQuery(text);
    toast({
      title: t('voiceSearchTitle'),
      description: t('voiceSearchDescription', { query: text }),
    });
  };

  const handleAddToCart = (item: MarketplaceItem) => {
    if (!item.inStock) {
      toast({
        title: t('outOfStockTitle'),
        description: t('outOfStockMsg'),
        variant: "destructive"
      });
      return;
    }

    addToCart(item); // Use addToCart from context
    toast({
      title: t('addedToCartTitle'),
      description: t('addedToCartDescription', { item: item.name }),
    });
  };

  const handleViewDetails = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleContactSeller = (seller: MarketplaceItem['seller']) => {
    toast({
      title: t('contactSellerTitle'),
      description: t('contactSellerDescription', { seller: seller.name, phone: seller.phone }),
    });
  };

  const handleBuyNow = (item: MarketplaceItem) => {
    if (!item.inStock) {
      toast({
        title: t('outOfStockTitle'),
        description: t('outOfStockMsg'),
        variant: "destructive"
      });
      return;
    }
    setBuyNowItem(item);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('marketplaceTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('marketplaceSubtitle')}
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <SpeechButton
                  onTextCapture={handleVoiceSearch}
                  className="flex-shrink-0"
                />
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{t(category.nameKey)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">
                    {t('cartSummary')} ({cart.length} {t('cartItems')})
                  </span>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    if (cart.length > 0) {
                      setIsCheckoutOpen(true);
                    } else {
                      toast({
                        title: t('cartEmpty') || "Cart is Empty",
                        description: t('cartEmptyDescription') || "Add items to cart first.",
                      });
                    }
                  }}
                  disabled={cart.length === 0}
                >
                  {t('viewCart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">₹{item.price}</span>
                  <Badge variant="secondary">
                    {item.categoryLabel}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{item.seller.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{item.seller.rating}</span>
                  <span className="text-muted-foreground">({item.seller.name})</span>
                </div>

                <div className="flex flex-col gap-2">
                  {item.infoUrl && (
                    <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
                      <a href={item.infoUrl} target="_blank" rel="noopener noreferrer">
                        View images & info
                      </a>
                    </Button>
                  )}
                  <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(item)}
                  >
                    {t('viewDetails')}
                  </Button>
                  <div className="flex gap-2 flex-1">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.inStock}
                    >
                      {t('addToCart')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleBuyNow(item)}
                      disabled={!item.inStock}
                    >
                      {t('buyNow')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('noProductsFound')}</h3>
              <p className="text-muted-foreground">
                {t('adjustFilters')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedItem?.name}</DialogTitle>
            <DialogDescription>
              {selectedItem?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div className="aspect-video bg-muted rounded-md overflow-hidden">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              </div>
              {selectedItem.infoUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedItem.infoUrl} target="_blank" rel="noopener noreferrer">
                    View images & more info
                  </a>
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('priceLabel')}</h4>
                  <p className="text-2xl font-bold">₹{selectedItem.price}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('availabilityLabel')}</h4>
                  <Badge variant={selectedItem.inStock ? "default" : "secondary"}>
                    {selectedItem.inStock ? t('inStock') : t('outOfStock')}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('marketplaceSku')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.sku}</p>
                </div>
                {selectedItem.weight && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('marketplaceWeight')}</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.weight}</p>
                  </div>
                )}
                {selectedItem.origin && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('marketplaceOrigin')}</h4>
                    <p className="text-sm text-muted-foreground">{selectedItem.origin}</p>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-2">{t('featuresLabel')}</h4>
                <ul className="space-y-1">
                  {selectedItem.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedItem.benefits.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">{t('marketplaceBenefits')}</h4>
                  <ul className="space-y-1">
                    {selectedItem.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">{t('sellerInfoLabel')}</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{selectedItem.seller.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{selectedItem.seller.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedItem.seller.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactSeller(selectedItem.seller)}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {t('call')}
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t('message')}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  {t('close')}
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedItem) {
                      addToCart(selectedItem); // Use addToCart from context
                    }
                  }}
                  disabled={!selectedItem.inStock}
                  className="flex-1"
                >
                  {t('addToCart')}
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedItem) {
                      handleBuyNow(selectedItem);
                      setIsDialogOpen(false);
                    }
                  }}
                  disabled={!selectedItem.inStock}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {t('buyNow')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setBuyNowItem(null);
        }}
        items={buyNowItem ? [{
          name: buyNowItem.name,
          quantity: 1,
          price: buyNowItem.price,
          category: buyNowItem.category
        }] : cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          category: item.category
        }))}
        onSuccess={(paymentData) => {
          toast({
            title: t('orderPlaced') || "Order Placed Successfully!",
            description: t('orderPlacedDescription') || "Your order has been confirmed and will be delivered soon.",
          });
          setBuyNowItem(null);
          clearCart(); // Use clearCart from context
        }}
      />
    </div>
  );
};

export default Marketplace;
