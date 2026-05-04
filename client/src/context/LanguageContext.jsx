import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    // Read language from cookie
    const match = document.cookie.match(new RegExp('(^| )lang=([^;]+)'));
    if (match) {
      setLanguage(match[2]);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`; // 1 year expiry
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (let k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // fallback to key if missing
      }
    }

    if (typeof value === 'string') {
      // Simple param replacement e.g. {count}
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
      }, value);
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
