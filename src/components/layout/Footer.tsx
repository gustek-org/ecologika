
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">EcoMarket</span>
            </div>
            <p className="text-gray-400 text-sm">
              Promovendo a economia circular através do comércio sustentável de materiais recicláveis.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-green-400 transition-colors">{t('nav.home')}</a></li>
              <li><a href="/about" className="hover:text-green-400 transition-colors">{t('nav.about')}</a></li>
              <li><a href="/products" className="hover:text-green-400 transition-colors">{t('nav.products')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-green-400 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Sustentabilidade</h3>
            <div className="text-sm text-gray-400">
              <p className="mb-2">🌱 Materiais reciclados</p>
              <p className="mb-2">♻️ Economia circular</p>
              <p>🌍 Impacto ambiental positivo</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 EcoMarket. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
