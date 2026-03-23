import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type FarmType = 'poultry' | 'cattle' | null;

const HygieneTest = () => {
  const { t } = useLanguage();
  const [farmType, setFarmType] = useState<FarmType>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const poultryQuestions = [
    { question: 'poultryQ1', options: ['poultryQ1A1', 'poultryQ1A2', 'poultryQ1A3', 'poultryQ1A4'] },
    { question: 'poultryQ2', options: ['poultryQ2A1', 'poultryQ2A2', 'poultryQ2A3', 'poultryQ2A4'] },
    { question: 'poultryQ3', options: ['poultryQ3A1', 'poultryQ3A2', 'poultryQ3A3', 'poultryQ3A4'] },
    { question: 'poultryQ4', options: ['poultryQ4A1', 'poultryQ4A2', 'poultryQ4A3', 'poultryQ4A4'] },
    { question: 'poultryQ5', options: ['poultryQ5A1', 'poultryQ5A2', 'poultryQ5A3', 'poultryQ5A4'] },
  ];

  const cattleQuestions = [
    { question: 'cattleQ1', options: ['cattleQ1A1', 'cattleQ1A2', 'cattleQ1A3', 'cattleQ1A4'] },
    { question: 'cattleQ2', options: ['cattleQ2A1', 'cattleQ2A2', 'cattleQ2A3', 'cattleQ2A4'] },
    { question: 'cattleQ3', options: ['cattleQ3A1', 'cattleQ3A2', 'cattleQ3A3', 'cattleQ3A4'] },
    { question: 'cattleQ4', options: ['cattleQ4A1', 'cattleQ4A2', 'cattleQ4A3', 'cattleQ4A4'] },
    { question: 'cattleQ5', options: ['cattleQ5A1', 'cattleQ5A2', 'cattleQ5A3', 'cattleQ5A4'] },
  ];

  const questions = farmType === 'poultry' ? poultryQuestions : cattleQuestions;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    // Reverse the logic: 0 is best, 3 is worst
    const totalScore = answers.reduce((sum, answer) => sum + (3 - answer), 0);
    // Calculate percentage where 0 is possible
    const maxPossibleScore = questions.length * 3;
    const percentage = (totalScore / maxPossibleScore) * 100;
    // Cap at 100% to ensure it never exceeds 100%
    return Math.min(100, Math.round(percentage));
  };

  const getRecommendations = (score: number) => {
    if (score >= 85) {
      return [
        t('rec_excellent_1'),
        t('rec_excellent_2'),
        t('rec_excellent_3'),
        t('rec_excellent_4')
      ];
    } else if (score >= 65) {
      return [
        t('rec_good_1'),
        t('rec_good_2'),
        t('rec_good_3'),
        t('rec_good_4'),
        t('rec_good_5')
      ];
    } else if (score >= 45) {
      return [
        t('rec_moderate_1'),
        t('rec_moderate_2'),
        t('rec_moderate_3'),
        t('rec_moderate_4'),
        t('rec_moderate_5'),
        t('rec_moderate_6')
      ];
    } else {
      return [
        t('rec_poor_1'),
        t('rec_poor_2'),
        t('rec_poor_3'),
        t('rec_poor_4'),
        t('rec_poor_5'),
        t('rec_poor_6'),
        t('rec_poor_7'),
        t('rec_poor_8')
      ];
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { level: t('excellent'), color: 'text-green-600', message: t('excellentMsg') };
    if (score >= 65) return { level: t('good'), color: 'text-blue-600', message: t('goodMsg') };
    if (score >= 45) return { level: t('average'), color: 'text-yellow-600', message: t('moderateMsg') };
    return { level: t('poor'), color: 'text-red-600', message: t('poorMsg') };
  };

  const resetTest = () => {
    setFarmType(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (!farmType) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">{t('testTitle')}</CardTitle>
              <CardDescription className="text-lg">{t('selectFarmType')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full py-8 text-lg" 
                onClick={() => setFarmType('poultry')}
              >
                {t('poultryFarm')}
              </Button>
              <Button 
                className="w-full py-8 text-lg" 
                variant="secondary"
                onClick={() => setFarmType('cattle')}
              >
                {t('cattleFarm')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const risk = getRiskLevel(score);
    const recommendations = getRecommendations(score);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">{t('resultsTitle')}</CardTitle>
              <div className="space-y-4">
                <div>
                  <p className="text-lg mb-2">{t('riskLevel')}</p>
                  <p className={`text-5xl font-bold ${risk.color}`}>{score}%</p>
                  <div className="mt-3 flex flex-col items-center">
                      <p className={`text-2xl font-semibold ${risk.color}`}>{risk.level}</p>
                      <div className="w-full max-w-md mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            score >= 85 ? 'bg-green-600' : 
                            score >= 65 ? 'bg-blue-600' : 
                            score >= 45 ? 'bg-yellow-600' : 
                            'bg-red-600'
                          }`} 
                          style={{ width: `${score}%` }}
                        ></div>
                      </div>
                    </div>
                </div>
                <p className="text-lg text-muted-foreground">{risk.message}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {t('recommendations')}
                </h3>
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full" onClick={resetTest}>
                {t('backToTest')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <Progress value={progress} className="w-full" />
              <CardDescription className="text-center">
                Question {currentQuestion + 1} of {questions.length}
              </CardDescription>
              <CardTitle className="text-2xl">
                {t(questions[currentQuestion].question)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-pink-100 cursor-pointer"
                  onClick={() => handleAnswer(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    className="text-black data-[state=checked]:bg-black data-[state=checked]:text-white" 
                  />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                    {t(option)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              className="w-full" 
              onClick={handleNext}
              disabled={answers[currentQuestion] === undefined}
            >
              {currentQuestion < questions.length - 1 ? t('nextQuestion') : t('submitTest')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HygieneTest;
