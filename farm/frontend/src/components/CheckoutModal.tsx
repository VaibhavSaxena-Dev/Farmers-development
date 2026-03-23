import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, User, Phone, Home, ArrowRight } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { useCart } from "@/contexts/CartContext"; // Import useCart hook

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[]; // Changed to CartItem[]
  onSuccess: (paymentData: any) => void;
}

interface CartItem {
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
  quantity?: number; // Quantity is now part of CartItem
}

interface ShippingDetails {
  fullName: string;
  phone: string;
  address: string;
  pincode: string;
  city: string;
  state: string;
  landmark?: string;
}

const CheckoutModal = ({ isOpen, onClose, items, onSuccess }: CheckoutModalProps) => {
  const { t } = useLanguage();
  const { removeFromCart } = useCart(); // Use removeFromCart hook
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    fullName: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    landmark: ""
  });
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingDetails>>({});

  const totalAmount = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const gstAmount = totalAmount * 0.18;
  const finalAmount = totalAmount + gstAmount;

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingDetails> = {};

    if (!shippingDetails.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }
    if (!shippingDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(shippingDetails.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }
    if (!shippingDetails.address.trim()) {
      newErrors.address = "Address is required";
    }
    if (!shippingDetails.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(shippingDetails.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }
    if (!shippingDetails.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!shippingDetails.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setIsPaymentOpen(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    onSuccess({
      ...paymentData,
      shippingDetails
    });
    setIsPaymentOpen(false);
    onClose();
    // Reset form
    setShippingDetails({
      fullName: "",
      phone: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      landmark: ""
    });
    setErrors({});
  };

  return (
    <>
      <Dialog open={isOpen && !isPaymentOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              {t('checkoutTitle') || "Delivery Details"}
            </DialogTitle>
            <DialogDescription>
              {t('checkoutDescription') || "Please provide your shipping address to continue"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Shipping Form */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('shippingDetails') || "Shipping Details"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      {t('fullName') || "Full Name"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder={t('enterFullName') || "Enter your full name"}
                      value={shippingDetails.fullName}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {t('phoneNumber') || "Phone Number"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder={t('enterPhone') || "10-digit mobile number"}
                        value={shippingDetails.phone}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      {t('address') || "Address"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                      <textarea
                        id="address"
                        placeholder={t('enterAddress') || "House/Flat No., Building, Street"}
                        value={shippingDetails.address}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                        className={`w-full min-h-[80px] px-3 py-2 pl-10 border rounded-md ${errors.address ? "border-red-500" : ""}`}
                        rows={3}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pincode">
                        {t('pincode') || "Pincode"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        type="text"
                        placeholder={t('enterPincode') || "6-digit pincode"}
                        value={shippingDetails.pincode}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                        className={errors.pincode ? "border-red-500" : ""}
                      />
                      {errors.pincode && (
                        <p className="text-sm text-red-500">{errors.pincode}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        {t('city') || "City"} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder={t('enterCity') || "Enter city"}
                        value={shippingDetails.city}
                        onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                        className={errors.city ? "border-red-500" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">
                      {t('state') || "State"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      placeholder={t('enterState') || "Enter state"}
                      value={shippingDetails.state}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                      className={errors.state ? "border-red-500" : ""}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="landmark">
                      {t('landmark') || "Landmark (Optional)"}
                    </Label>
                    <Input
                      id="landmark"
                      placeholder={t('enterLandmark') || "Nearby landmark"}
                      value={shippingDetails.landmark}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, landmark: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">{t('orderSummary') || "Order Summary"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-circle"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('subtotal') || "Subtotal"}</span>
                      <span>₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('gst') || "GST (18%)"}</span>
                      <span>₹{gstAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t('total') || "Total"}</span>
                      <span>₹{finalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleProceedToPayment} 
                    className="w-full mt-4"
                    size="lg"
                  >
                    {t('proceedToPayment') || "Proceed to Payment"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="w-full"
                  >
                    {t('cancel') || "Cancel"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        items={items}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default CheckoutModal;

