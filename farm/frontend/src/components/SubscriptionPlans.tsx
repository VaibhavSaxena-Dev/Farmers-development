import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Users, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import PaymentModal from "./PaymentModal";
import Navbar from "@/components/Navbar";

interface SubscriptionPlansProps {
  onSubscribe: (plan: SubscriptionPlan) => void;
}

interface SubscriptionPlan {
  planId: string;
  planName: string;
  duration: string;
  price: number;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

const SubscriptionPlans = ({ onSubscribe }: SubscriptionPlansProps) => {
  const { t } = useLanguage();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const plans: SubscriptionPlan[] = useMemo(() => ([
    {
      planId: "basic_monthly",
      planName: t('subscriptionPlanBasic'),
      duration: t('subscriptionPlanDurationMonthly'),
      price: 299,
      color: "blue",
      icon: <Users className="w-6 h-6" />,
      features: [
        t('subscriptionFeatureBasicDiseaseInfo'),
        t('subscriptionFeatureHygieneAssessmentLimit'),
        t('subscriptionFeatureBasicNotifications'),
        t('subscriptionFeatureVoiceInputSupport'),
        t('subscriptionFeatureMobileApp'),
        t('subscriptionFeatureEmailSupport')
      ]
    },
    {
      planId: "premium_monthly",
      planName: t('subscriptionPlanPremium'),
      duration: t('subscriptionPlanDurationMonthly'),
      price: 599,
      color: "green",
      icon: <Star className="w-6 h-6" />,
      popular: true,
      features: [
        t('subscriptionFeatureAllBasic'),
        t('subscriptionFeatureAdvancedDisease'),
        t('subscriptionFeatureUnlimitedHygiene'),
        t('subscriptionFeatureVoiceNotifications'),
        t('subscriptionFeatureExpertConsultation'),
        t('subscriptionFeatureMarketplaceAccess'),
        t('subscriptionFeaturePrioritySupport'),
        t('subscriptionFeatureCustomReports')
      ]
    },
    {
      planId: "enterprise_monthly",
      planName: t('subscriptionPlanEnterprise'),
      duration: t('subscriptionPlanDurationMonthly'),
      price: 1299,
      color: "purple",
      icon: <Crown className="w-6 h-6" />,
      features: [
        t('subscriptionFeatureAllBasic'),
        t('subscriptionFeatureUnlimitedConsultations'),
        t('subscriptionFeatureApiAccessFull'),
        t('subscriptionFeatureCustomIntegrations'),
        t('subscriptionFeatureAccountManager'),
        t('subscriptionFeatureAdvancedAnalytics'),
        t('subscriptionFeatureWhiteLabel'),
        t('subscriptionFeature247Support')
      ]
    },
    {
      planId: "veterinary_pro_monthly",
      planName: t('subscriptionPlanVeterinary'),
      duration: t('subscriptionPlanDurationMonthly'),
      price: 1999,
      color: "orange",
      icon: <Zap className="w-6 h-6" />,
      features: [
        t('subscriptionFeatureVetDashboard'),
        t('subscriptionFeaturePatientManagement'),
        t('subscriptionFeaturePrescriptionTracking'),
        t('subscriptionFeatureClientCommunication'),
        t('subscriptionFeatureMedicalRecords'),
        t('subscriptionFeatureAppointmentScheduling'),
        t('subscriptionFeatureBilling'),
        t('subscriptionFeatureEducation')
      ]
    }
  ]), [t]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
    // Handle successful subscription
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50 text-blue-800",
      green: "border-green-200 bg-green-50 text-green-800",
      purple: "border-purple-200 bg-purple-50 text-purple-800",
      orange: "border-orange-200 bg-orange-50 text-orange-800"
    };
    return colors[color] || colors.blue;
  };

  const getButtonColor = (color: string) => {
    const colors = {
      blue: "bg-blue-600 hover:bg-blue-700",
      green: "bg-green-600 hover:bg-green-700",
      purple: "bg-purple-600 hover:bg-purple-700",
      orange: "bg-orange-600 hover:bg-orange-700"
    };
    return colors[color] || colors.blue;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('subscriptionTitle')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subscriptionSubtitle')}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.planId} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-105'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    {t('subscriptionBadgePopular')}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${getColorClasses(plan.color)}`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.planName}</CardTitle>
                <CardDescription className="text-sm uppercase tracking-wide">
                  {plan.duration}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-muted-foreground">{t('subscriptionPricePerMonth')}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full mt-6 ${getButtonColor(plan.color)}`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {t('subscriptionChooseButton', { plan: plan.planName })}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('subscriptionFeatureComparisonTitle')}</CardTitle>
            <CardDescription className="text-center">
              {t('subscriptionFeatureComparisonSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t('subscriptionFeatureColumnLabel')}</th>
                    <th className="text-center p-4">{t('subscriptionPlanBasic')}</th>
                    <th className="text-center p-4">{t('subscriptionPlanPremium')}</th>
                    <th className="text-center p-4">{t('subscriptionPlanEnterprise')}</th>
                    <th className="text-center p-4">{t('subscriptionPlanVeterinary')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureVoiceInput')}</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureMobileAccess')}</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureHygieneAssessments')}</td>
                    <td className="text-center p-4">{t('subscriptionFeature5PerMonth')}</td>
                    <td className="text-center p-4">{t('subscriptionFeatureUnlimited')}</td>
                    <td className="text-center p-4">{t('subscriptionFeatureUnlimited')}</td>
                    <td className="text-center p-4">{t('subscriptionFeatureUnlimited')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureConsultations')}</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">{t('subscriptionFeatureExpertConsultation')}</td>
                    <td className="text-center p-4">{t('subscriptionFeatureUnlimited')}</td>
                    <td className="text-center p-4">{t('subscriptionFeatureUnlimited')}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureApiAccess')}</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">❌</td>
                    <td className="text-center p-4">✅</td>
                    <td className="text-center p-4">✅</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4 font-medium">{t('subscriptionFeatureSupportLevel')}</td>
                    <td className="text-center p-4">{t('subscriptionSupportEmail')}</td>
                    <td className="text-center p-4">{t('subscriptionSupportPriority')}</td>
                    <td className="text-center p-4">{t('subscriptionSupport24x7')}</td>
                    <td className="text-center p-4">{t('subscriptionSupport24x7')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">{t('subscriptionFaqTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t('subscriptionFaqPaymentQuestion')}</h3>
              <p className="text-muted-foreground">
                {t('subscriptionFaqPaymentAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('subscriptionFaqChangePlanQuestion')}</h3>
              <p className="text-muted-foreground">
                {t('subscriptionFaqChangePlanAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('subscriptionFaqTrialQuestion')}</h3>
              <p className="text-muted-foreground">
                {t('subscriptionFaqTrialAnswer')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t('subscriptionFaqCancelQuestion')}</h3>
              <p className="text-muted-foreground">
                {t('subscriptionFaqCancelAnswer')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedPlan(null);
          }}
          items={[{
            name: `${selectedPlan.planName} (${selectedPlan.duration})`,
            quantity: 1,
            price: selectedPlan.price,
            category: 'subscription'
          }]}
          subscription={selectedPlan}
          onSuccess={handlePaymentSuccess}
        />
      )}
      </div>
    </>
  );
};

export default SubscriptionPlans;
