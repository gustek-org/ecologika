
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.about': 'Quem Somos',
    'nav.products': 'Produtos',
    'nav.login': 'Entrar',
    'nav.register': 'Cadastrar',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Sair',
    
    // Landing Page
    'landing.title': 'Marketplace Ecológico',
    'landing.subtitle': 'Conectando compradores e vendedores de materiais recicláveis',
    'landing.description': 'Promovemos a economia circular através de uma plataforma segura e sustentável',
    'landing.cta': 'Comece Agora',
    'landing.learn_more': 'Saiba Mais',
    
    // Features
    'features.title': 'Por que escolher nossa plataforma?',
    'features.eco.title': 'Sustentabilidade',
    'features.eco.description': 'Reduza sua pegada de carbono participando da economia circular',
    'features.secure.title': 'Segurança',
    'features.secure.description': 'Transações seguras e vendedores verificados',
    'features.network.title': 'Rede Nacional',
    'features.network.description': 'Conecte-se com parceiros em todo o país',
    
    // About
    'about.title': 'Quem Somos',
    'about.mission': 'Nossa Missão',
    'about.mission.text': 'Facilitar o comércio de materiais recicláveis, promovendo a sustentabilidade e a economia circular.',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.forgot_password': 'Esqueci minha senha',
    'auth.buyer': 'Comprador',
    'auth.seller': 'Vendedor',
    'auth.name': 'Nome',
    'auth.company': 'Empresa',
    'auth.location': 'Localização',
    
    // Common
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.products': 'Products',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    
    // Landing Page
    'landing.title': 'Ecological Marketplace',
    'landing.subtitle': 'Connecting buyers and sellers of recyclable materials',
    'landing.description': 'We promote circular economy through a secure and sustainable platform',
    'landing.cta': 'Get Started',
    'landing.learn_more': 'Learn More',
    
    // Features
    'features.title': 'Why choose our platform?',
    'features.eco.title': 'Sustainability',
    'features.eco.description': 'Reduce your carbon footprint by participating in the circular economy',
    'features.secure.title': 'Security',
    'features.secure.description': 'Secure transactions and verified sellers',
    'features.network.title': 'National Network',
    'features.network.description': 'Connect with partners across the country',
    
    // About
    'about.title': 'About Us',
    'about.mission': 'Our Mission',
    'about.mission.text': 'Facilitate the trade of recyclable materials, promoting sustainability and circular economy.',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.forgot_password': 'Forgot password',
    'auth.buyer': 'Buyer',
    'auth.seller': 'Seller',
    'auth.name': 'Name',
    'auth.company': 'Company',
    'auth.location': 'Location',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (undefined === context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const savedLang = localStorage.getItem('ecomarket_language') as Language;
    if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('ecomarket_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
