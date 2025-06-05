
import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  seller_name: string;
  seller_company: string;
  description: string;
  image_url: string;
  co2_savings: string | number; // Accept both types
  is_active: boolean;
  created_at: string;
  seller_id: string;
}

const Products = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [filters, setFilters] = useState({
    material: '',
    location: '',
    priceRange: [0, 1000] as [number, number]
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched products:', data);
      
      // Convert database format to Product interface
      const formattedProducts = data?.map(product => ({
        ...product,
        co2_savings: product.co2_savings?.toString() || '', // Convert number to string
        quantity: product.quantity || 1,
        unit: product.unit || 'kg',
        seller_name: product.seller_name || '',
        seller_company: product.seller_company || '',
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMaterial = !filters.material || product.material === filters.material;
      const matchesLocation = !filters.location || product.location.includes(filters.location);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      return matchesSearch && matchesMaterial && matchesLocation && matchesPrice;
    });
  }, [products, searchTerm, filters]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
              <p className="text-gray-600">Você precisa estar logado para ver os produtos.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando produtos...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Produtos Disponíveis</h1>
          
          {/* Botões de visualização */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={!showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(false)}
              className="bg-green-600 hover:bg-green-700"
            >
              Todos os Produtos
            </Button>
            <Button
              variant={showFavorites ? "default" : "outline"}
              onClick={() => setShowFavorites(true)}
              className="bg-red-500 hover:bg-red-600"
            >
              <Heart className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
          </div>
          
          {/* Barra de busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar produtos, materiais ou descrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtros */}
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              showFavorites={showFavorites}
              currentUserId={user?.id}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">
                {showFavorites ? 'Nenhum produto favoritado' : 'Nenhum produto encontrado'}
              </h3>
              <p className="text-gray-600">
                {showFavorites 
                  ? 'Você ainda não favoritou nenhum produto.'
                  : 'Tente ajustar os filtros ou termo de busca.'
                }
              </p>
              {products.length === 0 && !showFavorites && (
                <p className="text-sm text-gray-500 mt-2">
                  Total de produtos no banco: {products.length}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
