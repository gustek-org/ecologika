
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/pages/Products';
import { useProductImages } from '@/hooks/useProductImages';

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
  <Card className="h-full flex flex-col">
    <Skeleton className="aspect-video rounded-t-lg" />
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="flex-1 pt-0">
      <Skeleton className="h-10 w-full mb-4" />
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

const MyProductCard = ({ product, onToggleStatus }: { 
  product: ProductWithImages; 
  onToggleStatus: (id: string, currentStatus: boolean) => void; 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getMaterialColor = (material: string) => {
    const colors = {
      'Papel': 'bg-green-100 text-green-800',
      'Plástico': 'bg-blue-100 text-blue-800',
      'Metal': 'bg-gray-100 text-gray-800',
      'Vidro': 'bg-purple-100 text-purple-800'
    };
    return colors[material as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const nextImage = () => {
    if (product.allImages && product.allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.allImages!.length);
    }
  };

  const prevImage = () => {
    if (product.allImages && product.allImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.allImages!.length) % product.allImages!.length);
    }
  };

  const currentImage = product.allImages && product.allImages.length > 0 
    ? product.allImages[currentImageIndex]?.image_url 
    : product.firstImage || product.image_url;

  const hasMultipleImages = product.allImages && product.allImages.length > 1;

  return (
    <Card className="h-full flex flex-col">
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative group">
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-1">📷</div>
              <p className="text-xs">Sem imagem</p>
            </div>
          </div>
        )}
        
        {/* Navigation arrows for multiple images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Show image count if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1}/{product.allImages!.length}
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            <Badge className={getMaterialColor(product.material)}>
              {product.material}
            </Badge>
            <Badge variant={product.is_active ? "default" : "secondary"}>
              {product.is_active ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{product.location}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              / {product.quantity} {product.unit}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(product.id, product.is_active)}
            className="flex-1"
          >
            {product.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/product/${product.id}`)}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const MyProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchMyProducts();
  }, [user?.id]);

  const fetchMyProducts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert database format to Product interface and load images
      const formattedProducts = await Promise.all(
        data?.map(async (product) => {
          // Load images for each product
          const images = await fetchProductImages(product.id);
          const firstImage = images.length > 0 ? images[0].image_url : product.image_url;
          
          return {
            ...product,
            co2_savings: product.co2_savings?.toString() || '',
            quantity: product.quantity || 1,
            unit: product.unit || 'kg',
            seller_name: product.seller_name || '',
            seller_company: product.seller_company || '',
            firstImage,
            totalImages: images.length,
            allImages: images.map(img => ({
              id: img.id || '',
              image_url: img.image_url,
              image_order: img.image_order
            })),
          };
        }) || []
      );

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Erro ao buscar meus produtos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId
            ? { ...product, is_active: !currentStatus }
            : product
        )
      );

      toast({
        title: "Produto atualizado",
        description: `Produto ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do produto.",
        variant: "destructive",
      });
    }
  };
   
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Produtos</h1>
          <Button 
            onClick={() => navigate('/add-product')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
              <p className="text-gray-600 mb-6">Comece adicionando seu primeiro produto sustentável.</p>
              <Button 
                onClick={() => navigate('/add-product')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <MyProductCard 
                key={product.id} 
                product={product} 
                onToggleStatus={toggleProductStatus}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyProducts;
