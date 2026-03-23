import { useState, useEffect, useCallback } from "react";
import { Button } from "./button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

type RecognitionConstructor = new () => {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onaudioend: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onresult: ((event: RecognitionResultEvent) => void) | null;
};

type RecognitionResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type RecognitionErrorEvent = {
  error: string;
};

const LANGUAGE_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  bn: "bn-IN",
  te: "te-IN",
  ta: "ta-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  or: "or-IN"
};

interface SpeechButtonProps {
  onTextCapture: (text: string) => void;
  className?: string;
  enableVoiceOutput?: boolean;
  voiceMessage?: string;
}

export function SpeechButton({ 
  onTextCapture, 
  className = "", 
  enableVoiceOutput = false, 
  voiceMessage = "" 
}: SpeechButtonProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  // Map language codes to speech recognition language codes
  // Voice output function
  const speakText = useCallback((text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGUAGE_MAP[language] || "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, language]);

  // Auto-speak important messages
  useEffect(() => {
    if (enableVoiceOutput && voiceMessage && isVoiceEnabled) {
      speakText(voiceMessage);
    }
  }, [voiceMessage, enableVoiceOutput, isVoiceEnabled, speakText]);

  const handleSpeechToggle = () => {
    const recognizerFactory =
      (window as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor })        
        .SpeechRecognition ||
      (window as { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor })
        .webkitSpeechRecognition;

    if (!recognizerFactory) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support voice input. Please try using Chrome.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new recognizerFactory();
    
    const langCode = LANGUAGE_MAP[language] || "en-US";
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.continuous = false;
    
    setIsListening(true);
    setError(null);
    
    recognition.onresult = (event: RecognitionResultEvent) => {
      const firstGroup = event.results?.[0];
      const firstResult = firstGroup && firstGroup[0];
      const transcript = firstResult?.transcript;
      if (transcript) {
        onTextCapture(transcript);
        if (isVoiceEnabled) {
          speakText(`Captured: ${transcript}`);
        }
      }
      setIsListening(false);
    };
    
    recognition.onerror = (event: RecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Error: ${event.error}`);
      setIsListening(false);
      
      toast({
        title: "Voice Input Error",
        description: `Failed to recognize speech: ${event.error}`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  };

  const toggleVoiceOutput = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        onClick={handleSpeechToggle}
        className={`relative ${className}`}
        title={isListening ? "Stop recording" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4 text-red-500" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>
      
      {enableVoiceOutput && (
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={toggleVoiceOutput}
          title={isVoiceEnabled ? "Disable voice output" : "Enable voice output"}
        >
          {isVoiceEnabled ? (
            <Volume2 className="h-4 w-4 text-green-500" />
          ) : (
            <VolumeX className="h-4 w-4 text-gray-500" />
          )}
        </Button>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
    </div>
  );
}