import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Building, User, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import { Product } from '@/pages/Products';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductImage {
  id: string;
  image_url: string;
  image_order: number;
}

const ProductDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        disabled
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar aos produtos
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Imagem do produto - Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </div>

        {/* Informações do produto - Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-10 w-10 rounded" />
            </div>
            
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3 mb-6" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-24" />
                </div>
                
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveProduct, unsaveProduct, isProductSaved, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ProductImage[]>([]);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      loadImages(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw error;
      }

      // Convert database format to Product interface
      const formattedProduct = {
        ...data,
        co2_savings: data.co2_savings?.toString() || '',
        quantity: data.quantity || 1,
        unit: data.unit || 'kg',
        seller_name: data.seller_name || '',
        seller_company: data.seller_company || '',
      };

      setProduct(formattedProduct);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadImages = async (productId: string) => {
    try {
      const productImages = await fetchProductImages(productId);
      // Convert to the expected type and ensure we have valid images
      const formattedImages = productImages
        .filter(img => img.image_url && !img.image_url.startsWith('blob:'))
        .map(img => ({
          id: img.id || '',
          image_url: img.image_url,
          image_order: img.image_order
        }));
      setImages(formattedImages);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
    }
  };

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
              <Button onClick={() => navigate('/products')}>
                Voltar aos produtos
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

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

  const handleSaveProduct = () => {
    if (isProductSaved(product.id)) {
      unsaveProduct(product.id);
    } else {
      saveProduct(product.id);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Navigate to checkout with product and quantity as URL parameters
    navigate(`/checkout?product=${product.id}&quantity=${selectedQuantity}`);
  };

  const totalPrice = product.price * selectedQuantity;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagens do produto */}
          <div className="space-y-4">
            <ProductImageGallery 
              images={images}
              productName={product?.name || ''}
            />
          </div>

          {/* Informações do produto */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className={getMaterialColor(product.material)}>
                    {product.material}
                  </Badge>
                </div>
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSaveProduct}
                  >
                    <Heart 
                      className={`h-4 w-4 ${isProductSaved(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </Button>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Vendedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{product.seller_company}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{product.seller_name}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{product.location}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comprar Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Preço por {product.unit}:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(product.price)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disponível:</span>
                  <span className="text-sm">{product.quantity} {product.unit}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade ({product.unit})</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.quantity}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleProceedToCheckout}
                    disabled={selectedQuantity < 1 || selectedQuantity > product.quantity}
                  >
                    {isAuthenticated ? 'Prosseguir para Checkout' : 'Fazer Login para Comprar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;
