
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-ecologika-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="animate-fade-in">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/75c38a0d-fba9-485d-914e-54b13cd3c77e.png" 
                alt="Ecologika" 
                className="h-10 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Promovendo a economia circular através do comércio sustentável de materiais recicláveis.
            </p>
          </div>

          <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
            <h3 className="font-bold mb-6 text-lg text-white">Navegação</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="/" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t('nav.home')}
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t('nav.about')}
                </a>
              </li>
              <li>
                <a 
                  href="/products" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  {t('nav.products')}
                </a>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h3 className="font-bold mb-6 text-lg text-white">Suporte</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Contato
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-300 hover:text-ecologika-secondary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h3 className="font-bold mb-6 text-lg text-white">Sustentabilidade</h3>
            <div className="text-sm space-y-3">
              <p className="text-gray-300 flex items-center">
                <span className="text-lg mr-2 animate-bounce-gentle">🌱</span>
                Materiais reciclados
              </p>
              <p className="text-gray-300 flex items-center">
                <span className="text-lg mr-2 animate-bounce-gentle" style={{animationDelay: '0.5s'}}>♻️</span>
                Economia circular
              </p>
              <p className="text-gray-300 flex items-center">
                <span className="text-lg mr-2 animate-bounce-gentle" style={{animationDelay: '1s'}}>🌍</span>
                Impacto ambiental positivo
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; 2024 Ecologika. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
