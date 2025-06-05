
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Header = () => {
  const { user, profile, logout, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-md border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-800">EcoMarket</span>
            </Link>
            <div className="animate-pulse">Carregando...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md border-b border-green-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-800">EcoMarket</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-green-600 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-green-600 transition-colors">
              {t('nav.about')}
            </Link>
            {user && (
              <>
                <Link to="/products" className="text-gray-600 hover:text-green-600 transition-colors">
                  {t('nav.products')}
                </Link>
                
                {profile?.type === 'buyer' && (
                  <Link to="/my-purchases" className="text-gray-600 hover:text-green-600 transition-colors">
                    Minhas Compras
                  </Link>
                )}
                
                {profile?.type === 'seller' && (
                  <>
                    <Link to="/my-products" className="text-gray-600 hover:text-green-600 transition-colors">
                      Meus Produtos
                    </Link>
                    <Link to="/add-product" className="text-gray-600 hover:text-green-600 transition-colors">
                      Adicionar Produto
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  language === 'pt' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-sm rounded transition-colors ${
                  language === 'en' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Olá, {profile?.name || user.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
