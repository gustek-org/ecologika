
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Heart, Shield } from 'lucide-react';

const Header = () => {
  const { user, profile, logout, isLoading, isMaster, isApproved } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg border-b border-ecologika-light backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div 
              className="h-10 w-32 bg-no-repeat bg-contain bg-center"
              style={{
                backgroundImage: "url('/lovable-uploads/75c38a0d-fba9-485d-914e-54b13cd3c77e.png')"
              }}
              aria-label="Ecologika"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  {t('nav.about')}
                </Link>
              </>
            )}
            
            {user && isMaster && (
              <>
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium flex items-center space-x-1"
                >
                  <Shield className="h-4 w-4" />
                  <span>Painel Admin</span>
                </Link>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  {t('nav.products')}
                </Link>
              </>
            )}
            
            {user && isApproved && !isMaster && (
              <>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  {t('nav.products')}
                </Link>
                
                <Link 
                  to="/my-purchases" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  Minhas Compras
                </Link>
                
                <Link 
                  to="/my-products" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  Meus Produtos
                </Link>
                
                <Link 
                  to="/add-product" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium"
                >
                  Adicionar Produto
                </Link>
                
                <Link 
                  to="/saved-products" 
                  className="text-gray-700 hover:text-ecologika-primary transition-colors duration-300 font-medium flex items-center space-x-1"
                >
                  <Heart className="h-4 w-4" />
                  <span>Favoritos</span>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-ecologika-light rounded-lg p-1">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-300 ${
                  language === 'pt' 
                    ? 'bg-ecologika-primary text-white' 
                    : 'text-ecologika-primary hover:bg-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm rounded-md transition-colors duration-300 ${
                  language === 'en' 
                    ? 'bg-ecologika-primary text-white' 
                    : 'text-ecologika-primary hover:bg-white'
                }`}
              >
                EN
              </button>
            </div>

            {isLoading ? (
              <div className="text-ecologika-primary">Carregando...</div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                {(isApproved || isMaster) && (
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 text-gray-700 hover:text-ecologika-primary transition-colors duration-300 bg-gray-50 hover:bg-ecologika-light px-3 py-2 rounded-lg"
                  >
                    <User size={16} />
                    <span className="text-sm font-medium">{profile?.name || user.email}</span>
                  </Link>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-ecologika-primary text-ecologika-primary hover:bg-ecologika-primary hover:text-white transition-colors duration-300"
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-ecologika-primary text-ecologika-primary hover:bg-ecologika-primary hover:text-white transition-colors duration-300"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-ecologika-primary hover:bg-ecologika-primary/90 text-white transition-colors duration-300"
                  >
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
