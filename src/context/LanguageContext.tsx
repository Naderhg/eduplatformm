import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => void;
  isRTL: boolean;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'ar');
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    // Determine effective language - default to Arabic
    const lang = i18n.language || 'ar';
    const isArabic = lang === 'ar' || lang.startsWith('ar');
    setCurrentLanguage(lang);
    setIsRTL(isArabic);

    // Update document direction and language
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // Ensure body font matches language
    if (isArabic) {
      document.body.style.fontFamily = "'Cairo', 'Inter', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', 'Cairo', sans-serif";
    }
  }, [i18n.language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      isRTL,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
