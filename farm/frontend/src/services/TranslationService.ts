import { useLanguage } from "@/contexts/LanguageContext";

// Simple cache to store translations
const translationCache: Record<string, Record<string, string>> = {};

// Translation service for todo items
export class TranslationService {
  private static instance: TranslationService;
  
  private constructor() {}
  
  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }
  
  // Translate text using the browser's translation API
  public async translateText(text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> {
    if (!text) return '';
    
    // Return original text if target language is the same as source language
    if (targetLang === sourceLang) return text;
    
    // Check cache first
    const cacheKey = `${sourceLang}_${targetLang}_${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }
    
    try {
      // Use browser's fetch API to call a free translation service
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
      const data = await response.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText;
        
        // Cache the result
        translationCache[cacheKey] = translatedText;
        
        return translatedText;
      }
      
      return text; // Return original text if translation fails
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }
  
  // Map our app language codes to translation API language codes
  public mapLanguageCode(langCode: string): string {
    const languageMap: Record<string, string> = {
      en: "en",
      hi: "hi",
      mr: "mr",
      gu: "gu",
      pa: "pa",
      bn: "bn",
      te: "te",
      ta: "ta",
      kn: "kn",
      ml: "ml",
      or: "or"
    };
    
    return languageMap[langCode] || "en";
  }
}

// React hook to use the translation service
export function useTranslation() {
  const { currentLanguage } = useLanguage();
  const translationService = TranslationService.getInstance();
  
  const translateText = async (text: string, sourceLang: string = 'en'): Promise<string> => {
    const targetLang = translationService.mapLanguageCode(currentLanguage);
    return translationService.translateText(text, targetLang, sourceLang);
  };
  
  return { translateText, currentLanguage };
}