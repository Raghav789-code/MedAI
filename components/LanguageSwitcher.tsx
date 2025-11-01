import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="relative flex w-fit items-center rounded-full bg-brand-gray-light p-1">
        <button
          onClick={() => setLanguage('en')}
          className={`relative z-10 h-8 w-14 rounded-full text-sm font-medium transition-colors ${
            language === 'en' ? 'text-white' : 'text-brand-gray-dark'
          }`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('hi')}
          className={`relative z-10 h-8 w-14 rounded-full text-sm font-medium transition-colors ${
            language === 'hi' ? 'text-white' : 'text-brand-gray-dark'
          }`}
        >
          हिन्दी
        </button>
        <div
          className={`absolute top-1/2 left-1 z-0 h-8 w-14 -translate-y-1/2 rounded-full bg-brand-green shadow-md transition-transform duration-300 ease-in-out ${
            language === 'hi' ? 'translate-x-[calc(100%-4px)]' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};

export default LanguageSwitcher;
