import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';
import './LanguageSwitcher.css';

export const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className="language-switcher">
      <div className="relative">
        <button 
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Language switcher"
          aria-expanded={isOpen}
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentLang?.flag}
          </span>
          <span className="text-sm hidden sm:inline">
            {currentLang?.name}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className={`absolute top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-full ${isRTL ? 'right-0' : 'left-0'}`}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <span>{language.flag}</span>
                <span>{language.name}</span>
                {currentLanguage === language.code && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
