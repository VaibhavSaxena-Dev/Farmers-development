import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Camera, AlertCircle, Clipboard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ML_BASE_URL } from '@/config/env';

const diseaseKeyMap: Record<string, string> = {
  'Healthy': 'diseaseHealthy',
  'Coccidiosis': 'diseaseCoccidiosis',
  'New Castle Disease': 'diseaseNewCastle',
  'Salmonella': 'diseaseSalmonella',
};

const DiseaseDetection: React.FC = () => {
  const { t } = useLanguage();
  const tDisease = (name: string) => t(diseaseKeyMap[name] || name) || name;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSelectedImage(reader.result as string);
              setPrediction(null);
            };
            reader.readAsDataURL(blob);
            toast({
              title: 'Image Pasted',
              description: 'Image loaded from clipboard',
            });
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeDiseaseImage = async () => {
    if (!selectedImage) return;

    setLoading(true);
    try {
      const blob = await fetch(selectedImage).then(r => r.blob());
      const formData = new FormData();
      formData.append('image', blob, 'chicken.jpg');

      const response = await fetch(`${ML_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);

      toast({
        title: t('detectionResult'),
        description: `${t('detectionResult')}: ${tDisease(result.disease)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Analysis Failed',
        description: error.message || 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-6 h-6" />
          {t('aiDiseaseDetection')}
        </CardTitle>
        <CardDescription>
          {t('aiDiseaseDetectionDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {selectedImage ? (
                <img src={selectedImage} alt="Preview" className="max-h-64 mx-auto rounded" />
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-gray-500">{t('uploadOrPaste')}</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                      <Clipboard className="w-4 h-4" />
                      <span>{t('pressCtrlV')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload">
                <Button className="w-full" variant="outline" asChild>
                  <span>{t('chooseImage')}</span>
                </Button>
              </label>
              <Button
                className="w-full"
                onClick={analyzeDiseaseImage}
                disabled={!selectedImage || loading}
              >
                {loading ? t('analyzing') : t('analyzeDisease')}
              </Button>
            </div>
          </div>

          <div>
            {prediction ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{t('detectionResult')}</h3>
                  <p className="text-2xl font-bold text-green-700">{tDisease(prediction.disease)}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t('confidenceLabel')}: {(prediction.confidence * 100).toFixed(2)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">{t('allPredictions')}</h4>
                  {Object.entries(prediction.all_predictions).map(([disease, conf]: [string, any]) => (
                    <div key={disease} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span>{tDisease(disease)}</span>
                      <span className="font-mono text-sm">{(conf * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>

                {prediction.disease !== 'Healthy' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">{t('recommendation')}</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          {t('recommendationText')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>{t('uploadToSeeResults')}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiseaseDetection;

