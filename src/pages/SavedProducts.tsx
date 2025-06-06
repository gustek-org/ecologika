
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Heart, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/products/ProductCard';
import { Product } from '@/pages/Products';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductWithImages extends Product {
  firstImage?: string;
  totalImages?: number;
  allImages?: Array<{ id: string; image_url: string; image_order: number }>;
}

const SavedProductCardSkeleton = () => (
  <Card className="h-full flex flex-col">
    <Skeleton className="aspect-video rounded-t-lg" />
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

const SavedProducts = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  const [savedProducts, setSavedProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchSavedProducts();
  }, [profile?.saved_products]);

  const fetchSavedProducts = async () => {
    if (!profile?.saved_products || profile.saved_products.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', profile.saved_products)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      // Load images for each saved product
      const formattedProducts = await Promise.all(
        (data || []).map(async (product) => {
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
            firstImage,
            totalImages: validImages.length,
            allImages: validImages,
          };
        })
      );

      setSavedProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos salvos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus produtos salvos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos produtos
        </Button>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Produtos Salvos</h1>
              <p className="text-gray-600">Seus produtos favoritos para consulta futura</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <SavedProductCardSkeleton key={index} />
              ))}
            </div>
          ) : savedProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhum produto salvo
                </h3>
                <p className="text-gray-500 mb-6">
                  Você ainda não salvou nenhum produto. Explore nosso marketplace e salve seus favoritos!
                </p>
                <Button onClick={() => navigate('/products')}>
                  Explorar Produtos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SavedProducts;
