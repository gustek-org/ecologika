
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Heart } from 'lucide-react';

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
      <header className="bg-white shadow-lg border-b border-ecologika-light backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/lovable-uploads/75c38a0d-fba9-485d-914e-54b13cd3c77e.png" 
                alt="Ecologika" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <div className="animate-pulse text-ecologika-primary">Carregando...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg border-b border-ecologika-light backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group animate-fade-in">
            <img 
              src="/lovable-uploads/75c38a0d-fba9-485d-914e-54b13cd3c77e.png" 
              alt="Ecologika" 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {t('nav.home')}
                </Link>
                <Link 
                  to="/about" 
                  className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {t('nav.about')}
                </Link>
              </>
            )}
            
            {user && (
              <>
                <Link 
                  to="/products" 
                  className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {t('nav.products')}
                </Link>
                
                {profile?.type === 'buyer' && (
                  <>
                    <Link 
                      to="/my-purchases" 
                      className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Minhas Compras
                    </Link>
                    <Link 
                      to="/products?favorites=true" 
                      className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium flex items-center space-x-1 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      <Heart className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                      <span>Favoritos</span>
                    </Link>
                  </>
                )}
                
                {profile?.type === 'seller' && (
                  <>
                    <Link 
                      to="/my-products" 
                      className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Meus Produtos
                    </Link>
                    <Link 
                      to="/add-product" 
                      className="text-gray-700 hover:text-ecologika-primary transition-all duration-300 font-medium relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-ecologika-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Adicionar Produto
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-ecologika-light rounded-lg p-1">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 ${
                  language === 'pt' 
                    ? 'bg-ecologika-primary text-white shadow-md' 
                    : 'text-ecologika-primary hover:bg-white hover:shadow-sm'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm rounded-md transition-all duration-300 ${
                  language === 'en' 
                    ? 'bg-ecologika-primary text-white shadow-md' 
                    : 'text-ecologika-primary hover:bg-white hover:shadow-sm'
                }`}
              >
                EN
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-3 animate-slide-in">
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2 text-gray-700 hover:text-ecologika-primary transition-all duration-300 bg-gray-50 hover:bg-ecologika-light px-3 py-2 rounded-lg"
                >
                  <User size={16} className="transition-transform duration-300 hover:scale-110" />
                  <span className="text-sm font-medium">{profile?.name || user.email}</span>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-ecologika-primary text-ecologika-primary hover:bg-ecologika-primary hover:text-white transition-all duration-300"
                >
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3 animate-slide-in">
                <Link to="/login">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-ecologika-primary text-ecologika-primary hover:bg-ecologika-primary hover:text-white transition-all duration-300"
                  >
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm" 
                    className="bg-ecologika-primary hover:bg-ecologika-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
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
