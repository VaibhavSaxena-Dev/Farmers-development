import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import CheckoutModal from "@/components/CheckoutModal";
import { useCart } from "@/contexts/CartContext";
import {
  Search,
  ShoppingCart,
  Star,
  MapPin,
  Phone,
  Truck,
  Shield,
  Check,
  Syringe,
  Heart,
  Activity,
  Leaf
} from "lucide-react";

interface VaccineItem {
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
  targetAnimal: string;
  dosage: string;
  storage: string;
  shelfLife: string;
}

const Marketplace = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { cart, addToCart, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<VaccineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<VaccineItem | null>(null);

  const categories = [
    { id: "all", nameKey: t("allProducts"), icon: <Shield className="w-4 h-4" /> },
    { id: "vaccines", nameKey: t("vaccinesLabel"), icon: <Syringe className="w-4 h-4" /> },
    { id: "poultry", nameKey: t("poultryVaccines"), icon: <Heart className="w-4 h-4" /> },
    { id: "cattle", nameKey: t("cattleVaccines"), icon: <Activity className="w-4 h-4" /> },
    { id: "goats", nameKey: t("goatSheepVaccines"), icon: <Syringe className="w-4 h-4" /> },
    { id: "pigs", nameKey: t("pigVaccines"), icon: <Shield className="w-4 h-4" /> },
    { id: "feed", nameKey: t("animalFeed"), icon: <Leaf className="w-4 h-4" /> }
  ];

  const vaccineItems: VaccineItem[] = useMemo(() => [
    // VACCINES
    {
      id: "1",
      name: t("vaccineItem1Name"),
      description: t("vaccineItem1Desc"),
      price: 1200,
      category: "cattle",
      seller: {
        name: "VetCare Solutions",
        location: "Mumbai, Maharashtra",
        rating: 4.9,
        phone: "+91 9876543211"
      },
      image: "https://picsum.photos/400/300?text=FMD-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("cattleVaccineLabel"),
      sku: "FMD-POL-001",
      weight: "50 doses",
      origin: "Pune, Maharashtra",
      targetAnimal: t("vaccineItem1Target"),
      dosage: t("vaccineItem1Dosage"),
      storage: t("vaccineItem1Storage"),
      shelfLife: t("vaccineItem1ShelfLife"),
      features: [
        t("vaccineItem1F1"),
        t("vaccineItem1F2"),
        t("vaccineItem1F3"),
        t("vaccineItem1F4")
      ],
      benefits: [
        t("vaccineItem1B1"),
        t("vaccineItem1B2"),
        t("vaccineItem1B3"),
        t("vaccineItem1B4")
      ]
    },
    {
      id: "2",
      name: t("vaccineItem2Name"),
      description: t("vaccineItem2Desc"),
      price: 950,
      category: "cattle",
      seller: {
        name: "Livestock Health India",
        location: "Pune, Maharashtra",
        rating: 4.8,
        phone: "+91 9876543212"
      },
      image: "https://picsum.photos/400/300?text=LSD-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("cattleVaccineLabel"),
      sku: "LSD-001",
      weight: "25 doses",
      origin: "Bangalore, Karnataka",
      targetAnimal: t("vaccineItem2Target"),
      dosage: t("vaccineItem2Dosage"),
      storage: t("vaccineItem2Storage"),
      shelfLife: t("vaccineItem2ShelfLife"),
      features: [
        t("vaccineItem2F1"),
        t("vaccineItem2F2"),
        t("vaccineItem2F3"),
        t("vaccineItem2F4")
      ],
      benefits: [
        t("vaccineItem2B1"),
        t("vaccineItem2B2"),
        t("vaccineItem2B3"),
        t("vaccineItem2B4")
      ]
    },
    {
      id: "3",
      name: t("vaccineItem3Name"),
      description: t("vaccineItem3Desc"),
      price: 850,
      category: "cattle",
      seller: {
        name: "AgriVet Pharmaceuticals",
        location: "Bangalore, Karnataka",
        rating: 4.7,
        phone: "+91 9876543213"
      },
      image: "https://picsum.photos/400/300?text=BVD-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("cattleVaccineLabel"),
      sku: "BVD-002",
      weight: "50 doses",
      origin: "Hyderabad, Telangana",
      targetAnimal: t("vaccineItem3Target"),
      dosage: t("vaccineItem3Dosage"),
      storage: t("vaccineItem3Storage"),
      shelfLife: t("vaccineItem3ShelfLife"),
      features: [
        t("vaccineItem3F1"),
        t("vaccineItem3F2"),
        t("vaccineItem3F3"),
        t("vaccineItem3F4")
      ],
      benefits: [
        t("vaccineItem3B1"),
        t("vaccineItem3B2"),
        t("vaccineItem3B3"),
        t("vaccineItem3B4")
      ]
    },
    {
      id: "4",
      name: t("vaccineItem4Name"),
      description: t("vaccineItem4Desc"),
      price: 1100,
      category: "cattle",
      seller: {
        name: "CattleVet Solutions",
        location: "Delhi, NCR",
        rating: 4.8,
        phone: "+91 9876543214"
      },
      image: "https://picsum.photos/400/300?text=IBR-Marker-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("cattleVaccineLabel"),
      sku: "IBR-MK-003",
      weight: "25 doses",
      origin: "Delhi, NCR",
      targetAnimal: t("vaccineItem4Target"),
      dosage: t("vaccineItem4Dosage"),
      storage: t("vaccineItem4Storage"),
      shelfLife: t("vaccineItem4ShelfLife"),
      features: [
        t("vaccineItem4F1"),
        t("vaccineItem4F2"),
        t("vaccineItem4F3"),
        t("vaccineItem4F4")
      ],
      benefits: [
        t("vaccineItem4B1"),
        t("vaccineItem4B2"),
        t("vaccineItem4B3"),
        t("vaccineItem4B4")
      ]
    },
    {
      id: "5",
      name: t("vaccineItem5Name"),
      description: t("vaccineItem5Desc"),
      price: 480,
      category: "poultry",
      seller: {
        name: "PoultryVet India",
        location: "Hyderabad, Telangana",
        rating: 4.7,
        phone: "+91 9876543215"
      },
      image: "https://picsum.photos/400/300?text=Newcastle-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("poultryVaccineLabel"),
      sku: "ND-LR-004",
      weight: "1000 doses",
      origin: "Hyderabad, Telangana",
      targetAnimal: t("vaccineItem5Target"),
      dosage: t("vaccineItem5Dosage"),
      storage: t("vaccineItem5Storage"),
      shelfLife: t("vaccineItem5ShelfLife"),
      features: [
        t("vaccineItem5F1"),
        t("vaccineItem5F2"),
        t("vaccineItem5F3"),
        t("vaccineItem5F4")
      ],
      benefits: [
        t("vaccineItem5B1"),
        t("vaccineItem5B2"),
        t("vaccineItem5B3"),
        t("vaccineItem5B4")
      ]
    },
    {
      id: "6",
      name: t("vaccineItem6Name"),
      description: t("vaccineItem6Desc"),
      price: 380,
      category: "poultry",
      seller: {
        name: "BirdCare Pharmaceuticals",
        location: "Chennai, Tamil Nadu",
        rating: 4.6,
        phone: "+91 9876543216"
      },
      image: "https://picsum.photos/400/300?text=Fowl-Pox-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("poultryVaccineLabel"),
      sku: "FP-005",
      weight: "1000 doses",
      origin: "Chennai, Tamil Nadu",
      targetAnimal: t("vaccineItem6Target"),
      dosage: t("vaccineItem6Dosage"),
      storage: t("vaccineItem6Storage"),
      shelfLife: t("vaccineItem6ShelfLife"),
      features: [
        t("vaccineItem6F1"),
        t("vaccineItem6F2"),
        t("vaccineItem6F3"),
        t("vaccineItem6F4")
      ],
      benefits: [
        t("vaccineItem6B1"),
        t("vaccineItem6B2"),
        t("vaccineItem6B3"),
        t("vaccineItem6B4")
      ]
    },
    {
      id: "7",
      name: t("vaccineItem7Name"),
      description: t("vaccineItem7Desc"),
      price: 420,
      category: "poultry",
      seller: {
        name: "Respiratory Health Solutions",
        location: "Kolkata, West Bengal",
        rating: 4.8,
        phone: "+91 9876543217"
      },
      image: "https://picsum.photos/400/300?text=IB-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("poultryVaccineLabel"),
      sku: "IB-006",
      weight: "1000 doses",
      origin: "Kolkata, West Bengal",
      targetAnimal: t("vaccineItem7Target"),
      dosage: t("vaccineItem7Dosage"),
      storage: t("vaccineItem7Storage"),
      shelfLife: t("vaccineItem7ShelfLife"),
      features: [
        t("vaccineItem7F1"),
        t("vaccineItem7F2"),
        t("vaccineItem7F3"),
        t("vaccineItem7F4")
      ],
      benefits: [
        t("vaccineItem7B1"),
        t("vaccineItem7B2"),
        t("vaccineItem7B3"),
        t("vaccineItem7B4")
      ]
    },
    {
      id: "8",
      name: t("vaccineItem8Name"),
      description: t("vaccineItem8Desc"),
      price: 350,
      category: "goats",
      seller: {
        name: "GoatCare Solutions",
        location: "Hyderabad, Telangana",
        rating: 4.9,
        phone: "+91 9876543218"
      },
      image: "https://picsum.photos/400/300?text=PPR-Vaccine",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("goatSheepVaccineLabel"),
      sku: "PPR-007",
      weight: "100 doses",
      origin: "Hyderabad, Telangana",
      targetAnimal: t("vaccineItem8Target"),
      dosage: t("vaccineItem8Dosage"),
      storage: t("vaccineItem8Storage"),
      shelfLife: t("vaccineItem8ShelfLife"),
      features: [
        t("vaccineItem8F1"),
        t("vaccineItem8F2"),
        t("vaccineItem8F3"),
        t("vaccineItem8F4")
      ],
      benefits: [
        t("vaccineItem8B1"),
        t("vaccineItem8B2"),
        t("vaccineItem8B3"),
        t("vaccineItem8B4")
      ]
    },
    // FEED PRODUCTS
    {
      id: "9",
      name: t("vaccineItem9Name"),
      description: t("vaccineItem9Desc"),
      price: 250,
      category: "feed",
      seller: {
        name: "Green Feed Suppliers",
        location: "Pune, Maharashtra",
        rating: 4.7,
        phone: "+91 9876543219"
      },
      image: "https://picsum.photos/400/300?text=Green-Fodder",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "FOD-GG-008",
      weight: "100 kg bundle",
      origin: "Pune, Maharashtra",
      targetAnimal: t("vaccineItem9Target"),
      dosage: t("vaccineItem9Dosage"),
      storage: t("vaccineItem9Storage"),
      shelfLife: t("vaccineItem9ShelfLife"),
      features: [
        t("vaccineItem9F1"),
        t("vaccineItem9F2"),
        t("vaccineItem9F3"),
        t("vaccineItem9F4")
      ],
      benefits: [
        t("vaccineItem9B1"),
        t("vaccineItem9B2"),
        t("vaccineItem9B3"),
        t("vaccineItem9B4")
      ]
    },
    {
      id: "10",
      name: t("vaccineItem10Name"),
      description: t("vaccineItem10Desc"),
      price: 180,
      category: "feed",
      seller: {
        name: "Hay Suppliers India",
        location: "Nashik, Maharashtra",
        rating: 4.6,
        phone: "+91 9876543220"
      },
      image: "https://picsum.photos/400/300?text=Dried-Hay",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "HAY-009",
      weight: "50 kg bale",
      origin: "Nashik, Maharashtra",
      targetAnimal: t("vaccineItem10Target"),
      dosage: t("vaccineItem10Dosage"),
      storage: t("vaccineItem10Storage"),
      shelfLife: t("vaccineItem10ShelfLife"),
      features: [
        t("vaccineItem10F1"),
        t("vaccineItem10F2"),
        t("vaccineItem10F3"),
        t("vaccineItem10F4")
      ],
      benefits: [
        t("vaccineItem10B1"),
        t("vaccineItem10B2"),
        t("vaccineItem10B3"),
        t("vaccineItem10B4")
      ]
    },
    {
      id: "11",
      name: t("vaccineItem11Name"),
      description: t("vaccineItem11Desc"),
      price: 1200,
      category: "feed",
      seller: {
        name: "Dairy Feed Solutions",
        location: "Bangalore, Karnataka",
        rating: 4.8,
        phone: "+91 9876543221"
      },
      image: "https://picsum.photos/400/300?text=Cattle-Concentrate",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "CF-010",
      weight: "50 kg bag",
      origin: "Bangalore, Karnataka",
      targetAnimal: t("vaccineItem11Target"),
      dosage: t("vaccineItem11Dosage"),
      storage: t("vaccineItem11Storage"),
      shelfLife: t("vaccineItem11ShelfLife"),
      features: [
        t("vaccineItem11F1"),
        t("vaccineItem11F2"),
        t("vaccineItem11F3"),
        t("vaccineItem11F4")
      ],
      benefits: [
        t("vaccineItem11B1"),
        t("vaccineItem11B2"),
        t("vaccineItem11B3"),
        t("vaccineItem11B4")
      ]
    },
    {
      id: "12",
      name: t("vaccineItem12Name"),
      description: t("vaccineItem12Desc"),
      price: 950,
      category: "feed",
      seller: {
        name: "Poultry Feed Masters",
        location: "Hyderabad, Telangana",
        rating: 4.7,
        phone: "+91 9876543222"
      },
      image: "https://picsum.photos/400/300?text=Mash-Feed",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "MF-011",
      weight: "50 kg bag",
      origin: "Hyderabad, Telangana",
      targetAnimal: t("vaccineItem12Target"),
      dosage: t("vaccineItem12Dosage"),
      storage: t("vaccineItem12Storage"),
      shelfLife: t("vaccineItem12ShelfLife"),
      features: [
        t("vaccineItem12F1"),
        t("vaccineItem12F2"),
        t("vaccineItem12F3"),
        t("vaccineItem12F4")
      ],
      benefits: [
        t("vaccineItem12B1"),
        t("vaccineItem12B2"),
        t("vaccineItem12B3"),
        t("vaccineItem12B4")
      ]
    },
    {
      id: "13",
      name: t("vaccineItem13Name"),
      description: t("vaccineItem13Desc"),
      price: 1350,
      category: "feed",
      seller: {
        name: "Pellet Feed India",
        location: "Chennai, Tamil Nadu",
        rating: 4.9,
        phone: "+91 9876543223"
      },
      image: "https://picsum.photos/400/300?text=Pellet-Feed",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "PF-012",
      weight: "50 kg bag",
      origin: "Chennai, Tamil Nadu",
      targetAnimal: t("vaccineItem13Target"),
      dosage: t("vaccineItem13Dosage"),
      storage: t("vaccineItem13Storage"),
      shelfLife: t("vaccineItem13ShelfLife"),
      features: [
        t("vaccineItem13F1"),
        t("vaccineItem13F2"),
        t("vaccineItem13F3"),
        t("vaccineItem13F4")
      ],
      benefits: [
        t("vaccineItem13B1"),
        t("vaccineItem13B2"),
        t("vaccineItem13B3"),
        t("vaccineItem13B4")
      ]
    },
    {
      id: "14",
      name: t("vaccineItem14Name"),
      description: t("vaccineItem14Desc"),
      price: 850,
      category: "feed",
      seller: {
        name: "Grain Mix Suppliers",
        location: "Delhi, NCR",
        rating: 4.6,
        phone: "+91 9876543224"
      },
      image: "https://picsum.photos/400/300?text=Grain-Mix",
      inStock: true,
      deliveryAvailable: true,
      categoryLabel: t("animalFeedLabel"),
      sku: "GM-013",
      weight: "50 kg bag",
      origin: "Delhi, NCR",
      targetAnimal: t("vaccineItem14Target"),
      dosage: t("vaccineItem14Dosage"),
      storage: t("vaccineItem14Storage"),
      shelfLife: t("vaccineItem14ShelfLife"),
      features: [
        t("vaccineItem14F1"),
        t("vaccineItem14F2"),
        t("vaccineItem14F3"),
        t("vaccineItem14F4")
      ],
      benefits: [
        t("vaccineItem14B1"),
        t("vaccineItem14B2"),
        t("vaccineItem14B3"),
        t("vaccineItem14B4")
      ]
    }
  ], [t]);

  const filteredItems = useMemo(() => {
    return vaccineItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, vaccineItems]);

  const handleAddToCart = (item: VaccineItem) => {
    addToCart(item);
    toast({
      title: t("addedToCartTitle"),
      description: t("addedToCartDescription", { item: item.name }),
    });
  };

  const handleBuyNow = (item: VaccineItem) => {
    setBuyNowItem(item);
    setIsCheckoutOpen(true);
  };

  const openItemDialog = (item: VaccineItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🐄 {t("marketplaceTitle")}</h1>
          <p className="text-xl text-muted-foreground">{t("marketplaceSubtitle")}</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.nameKey}
              </Button>
            ))}
          </div>
        </div>

        {/* Vaccine Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {item.inStock && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    {t("inStock")}
                  </Badge>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{item.name}</CardTitle>
                  <Badge variant="secondary">{item.categoryLabel}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">₹{item.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.seller.rating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{item.seller.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Syringe className="w-3 h-3" />
                      <span>{item.targetAnimal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      <span>{item.sku}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openItemDialog(item)}
                      className="flex-1"
                    >
                      {t("viewDetails")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(item)}
                      className="flex-1"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {t("addToCart")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Item Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedItem.name}</DialogTitle>
                  <DialogDescription>{selectedItem.description}</DialogDescription>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold">{t("sellerInfoLabel")}</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedItem.seller.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{selectedItem.seller.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{selectedItem.seller.rating} {t("ratingLabel")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="text-3xl font-bold text-primary">₹{selectedItem.price}</div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{t("productDetails")}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>{t("targetAnimal")}:</div>
                          <div>{selectedItem.targetAnimal}</div>
                          <div>{t("dosage")}:</div>
                          <div>{selectedItem.dosage}</div>
                          <div>{t("storage")}:</div>
                          <div>{selectedItem.storage}</div>
                          <div>{t("shelfLife")}:</div>
                          <div>{selectedItem.shelfLife}</div>
                          <div>{t("marketplaceSku")}:</div>
                          <div>{selectedItem.sku}</div>
                          <div>{t("marketplaceWeight")}:</div>
                          <div>{selectedItem.weight}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{t("featuresLabel")}</h4>
                        <ul className="text-sm space-y-1">
                          {selectedItem.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{t("marketplaceBenefits")}</h4>
                        <ul className="text-sm space-y-1">
                          {selectedItem.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-500" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleAddToCart(selectedItem)}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t("addToCart")}
                      </Button>
                      <Button
                        onClick={() => handleBuyNow(selectedItem)}
                        className="flex-1"
                      >
                        {t("buyNow")}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Checkout Modal */}
        {buyNowItem && (
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            items={[buyNowItem]}
            onSuccess={() => {
              setIsCheckoutOpen(false);
              toast({
                title: t("orderPlaced"),
                description: t("orderPlacedDescription"),
              });
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Marketplace;
