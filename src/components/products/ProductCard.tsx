
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, User, Heart } from 'lucide-react';
import { Product } from '@/pages/Products';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductCardProps {
  product: Product;
  showFavorites?: boolean;
  currentUserId?: string;
}

interface ProductImageType {
  id: string;
  image_url: string;
  image_order: number;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, showFavorites = false, currentUserId }) => {
  const { saveProduct, unsaveProduct, isProductSaved } = useAuth();
  const { fetchProductImages } = useProductImages();
  const navigate = useNavigate();
  const [images, setImages] = useState<ProductImageType[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  // Memoize computed values to prevent re-renders
  const isSaved = useMemo(() => isProductSaved(product.id), [isProductSaved, product.id]);
  const isOwnProduct = useMemo(() => currentUserId === product.seller_id, [currentUserId, product.seller_id]);
  
  // Fix image display logic - use firstImage from props if available, otherwise use images from fetch
  const displayImage = useMemo(() => {
    // First try to use firstImage from props (already loaded in Products page)
    if (product.firstImage && !product.firstImage.startsWith('blob:')) {
      return product.firstImage;
    }
    // Then try images from fetch
    if (images.length > 0 && !images[0].image_url.startsWith('blob:')) {
      return images[0].image_url;
    }
    // Finally try original image_url
    if (product.image_url && !product.image_url.startsWith('blob:')) {
      return product.image_url;
    }
    return null;
  }, [product.firstImage, product.image_url, images]);

  const totalImages = useMemo(() => {
    return product.totalImages || images.length;
  }, [product.totalImages, images.length]);

  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      if (!isMounted) return;
      
      // If we already have firstImage from props, no need to fetch again
      if (product.firstImage) {
        setIsLoadingImages(false);
        return;
      }
      
      setIsLoadingImages(true);
      try {
        const productImages = await fetchProductImages(product.id);
        
        if (!isMounted) return;
        
        // Convert to the expected type and filter out blob URLs
        const formattedImages = productImages
          .filter(img => img.image_url && !img.image_url.startsWith('blob:'))
          .map(img => ({
            id: img.id || '',
            image_url: img.image_url,
            image_order: img.image_order
          }));
        
        setImages(formattedImages);
      } catch (error) {
        console.error('Error loading images:', error);
      } finally {
        if (isMounted) {
          setIsLoadingImages(false);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [product.id, product.firstImage, fetchProductImages]);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }, []);

  const getMaterialColor = useCallback((material: string) => {
    const colors = {
      'Papel': 'bg-green-100 text-green-800',
      'Plástico': 'bg-blue-100 text-blue-800',
      'Metal': 'bg-gray-100 text-gray-800',
      'Vidro': 'bg-purple-100 text-purple-800'
    };
    return colors[material as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }, []);

  const handleSaveProduct = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveProduct(product.id);
    } else {
      saveProduct(product.id);
    }
  }, [isSaved, unsaveProduct, saveProduct, product.id]);

  const handleViewDetails = useCallback(() => {
    navigate(`/product/${product.id}`);
  }, [navigate, product.id]);

  // Memoize the badge to prevent unnecessary re-renders
  const materialBadge = useMemo(() => (
    <Badge className={getMaterialColor(product.material)}>
      {product.material}
    </Badge>
  ), [getMaterialColor, product.material]);

  // Se está mostrando favoritos, só mostra produtos favoritados
  // Move this check AFTER all hooks to avoid Rules of Hooks violation
  if (showFavorites && !isSaved) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
        {isLoadingImages && !product.firstImage ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">📷</div>
          </div>
        ) : displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', displayImage);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-1">📷</div>
              <p className="text-xs">Sem imagem</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={handleSaveProduct}
        >
          <Heart 
            className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </Button>
        
        {/* Show image count if multiple images */}
        {totalImages > 1 && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            +{totalImages} fotos
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <div className="mb-2">
          {materialBadge}
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{product.location}</span>
          </div>
          
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1" />
            <span>{product.seller_company}</span>
          </div>
          
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{product.seller_name}</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-bold text-green-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                / {product.quantity} {product.unit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {isOwnProduct ? (
          <Button 
            className="w-full bg-gray-400 cursor-not-allowed"
            disabled
          >
            Seu Produto
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={handleViewDetails}
          >
            Ver Detalhes
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
