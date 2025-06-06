import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductImages } from '@/hooks/useProductImages';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';

export interface Product {
  id: string;
  name: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  country: string;
  city: string;
  address: string;
  seller_name: string;
  seller_company: string;
  description: string;
  image_url: string;
  co2_savings: string | number;
  is_active: boolean;
  created_at: string;
  seller_id: string;
}

interface ProductImage {
  id?: string;
  image_url: string;
  image_order: number;
}

interface ProductWithImages extends Product {
  firstImage?: string;
  totalImages?: number;
  allImages?: ProductImage[];
}

const ProductCardSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-lg">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </Card>
);

const Products = () => {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filters, setFilters] = useState({
    material: '',
    location: '',
    country: '',
    priceRange: [0, 1000] as [number, number]
  });

  // Usar o hook para tempo mínimo de loading
  const shouldShowLoading = useMinimumLoadingTime(isLoading, 1200);

  // Check if showing favorites from URL
  const showFavorites = searchParams.get('favorites') === 'true';

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
      
      // Convert database format to Product interface and load images
      const formattedProducts = await Promise.all(
        data?.map(async (product) => {
          // Load all images for each product
          const images = await fetchProductImages(product.id);
          const validImages = images.filter(img => img.image_url && !img.image_url.startsWith('blob:'));
          const firstImage = validImages.length > 0 ? validImages[0].image_url : product.image_url;
          
          return {
            ...product,
            co2_savings: product.co2_savings?.toString() || '',
            quantity: product.quantity || 1,
            unit: product.unit || 'kg',
            seller_name: product.seller_name || '',
            seller_company: product.seller_company || '',
            country: product.country || '',
            city: product.city || '',
            address: product.address || '',
            firstImage,
            totalImages: validImages.length,
            allImages: validImages.map(img => ({
              id: img.id || '',
              image_url: img.image_url,
              image_order: img.image_order
            })),
          };
        }) || []
      );

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

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    // Check if any filter is different from default values
    const hasActiveFilters = newFilters.material || newFilters.location || newFilters.country ||
      newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000;
    setFiltersApplied(hasActiveFilters);
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    // Only apply filters if they have been changed from defaults OR if there's a search term
    if (filtersApplied || searchTerm) {
      result = products.filter(product => {
        const matchesSearch = searchTerm ? (
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;
        
        const matchesMaterial = !filters.material || product.material === filters.material;
        const matchesLocation = !filters.location || product.location.includes(filters.location);
        const matchesCountry = !filters.country || product.country === filters.country;
        const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

        return matchesSearch && matchesMaterial && matchesLocation && matchesCountry && matchesPrice;
      });
    }

    return result;
  }, [products, searchTerm, filters, filtersApplied]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4 text-ecologika-primary">Acesso Restrito</h2>
              <p className="text-gray-600">Você precisa estar logado para ver os produtos.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ecologika-primary mb-6">
              {showFavorites ? 'Meus Favoritos' : 'Produtos Disponíveis'}
            </h1>
            
            {/* Barra de busca - Skeleton */}
            <div className="relative mb-6">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            
            {/* Filtros - Skeleton */}
            {!showFavorites && (
              <div className="mb-6">
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            )}
          </div>

          {/* Lista de produtos - Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ecologika-primary mb-6">
            {showFavorites ? 'Meus Favoritos' : 'Produtos Disponíveis'}
          </h1>
          
          {/* Barra de busca */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ecologika-primary h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar produtos, materiais ou descrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-2 border-ecologika-light focus:border-ecologika-primary rounded-xl bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 focus:shadow-xl"
            />
          </div>
          
          {/* Filtros - only show if not viewing favorites */}
          {!showFavorites && (
            <div>
              <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          )}
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
          <Card className="text-center py-16 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent>
              <div className="text-6xl mb-6">📦</div>
              <h3 className="text-2xl font-bold mb-4 text-ecologika-primary">
                {showFavorites ? 'Nenhum produto favoritado' : 'Nenhum produto disponível ou encontrado com os filtros'}
              </h3>
              <p className="text-gray-600 text-lg">
                {showFavorites 
                  ? 'Você ainda não favoritou nenhum produto.'
                  : filtersApplied || searchTerm 
                    ? 'Tente ajustar os filtros ou termo de busca.'
                    : 'Não há produtos disponíveis no momento.'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
