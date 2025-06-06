import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building, User, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductImage {
  id?: string;
  image_url: string;
  image_order: number;
}

// Define the extended Product type with images
interface ProductWithImages {
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
  co2_savings: string | number;
  is_active: boolean;
  created_at: string;
  seller_id: string;
  firstImage?: string;
  totalImages?: number;
  allImages?: ProductImage[];
}

interface ProductCardProps {
  product: ProductWithImages;
  showFavorites?: boolean;
  currentUserId?: string;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, showFavorites = false, currentUserId }) => {
  const { saveProduct, unsaveProduct, isProductSaved } = useAuth();
  const { fetchProductImages } = useProductImages();
  const navigate = useNavigate();
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Memoize computed values to prevent re-renders
  const isSaved = useMemo(() => isProductSaved(product.id), [isProductSaved, product.id]);
  const isOwnProduct = useMemo(() => currentUserId === product.seller_id, [currentUserId, product.seller_id]);
  
  // Use allImages from props if available, otherwise use fetched images
  const displayImages = useMemo(() => {
    if (product.allImages && product.allImages.length > 0) {
      return product.allImages.filter(img => !img.image_url.startsWith('blob:'));
    }
    return images.filter(img => !img.image_url.startsWith('blob:'));
  }, [product.allImages, images]);

  const currentDisplayImage = useMemo(() => {
    if (displayImages.length > 0) {
      return displayImages[currentImageIndex]?.image_url;
    }
    if (product.firstImage && !product.firstImage.startsWith('blob:')) {
      return product.firstImage;
    }
    if (product.image_url && !product.image_url.startsWith('blob:')) {
      return product.image_url;
    }
    return null;
  }, [displayImages, currentImageIndex, product.firstImage, product.image_url]);

  const hasMultipleImages = displayImages.length > 1;

  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      if (!isMounted) return;
      
      // If we already have allImages from props, no need to fetch again
      if (product.allImages && product.allImages.length > 0) {
        setIsLoadingImages(false);
        return;
      }
      
      setIsLoadingImages(true);
      try {
        const productImages = await fetchProductImages(product.id);
        
        if (!isMounted) return;
        
        // Filter out blob URLs
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
  }, [product.id, product.allImages, fetchProductImages]);

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

  const nextImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }
  }, [hasMultipleImages, displayImages.length]);

  const prevImage = useCallback(() => {
    if (hasMultipleImages) {
      setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }
  }, [hasMultipleImages, displayImages.length]);

  // Memoize the badge to prevent unnecessary re-renders
  const materialBadge = useMemo(() => (
    <Badge className={getMaterialColor(product.material)}>
      {product.material}
    </Badge>
  ), [getMaterialColor, product.material]);

  // Se está mostrando favoritos, só mostra produtos favoritados
  if (showFavorites && !isSaved) {
    return null;
  }

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative group">
        {isLoadingImages && !product.allImages && !product.firstImage ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">📷</div>
          </div>
        ) : currentDisplayImage ? (
          <img
            src={currentDisplayImage}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('Image failed to load:', currentDisplayImage);
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
        
        {/* Navigation arrows for multiple images */}
        {hasMultipleImages && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Show image count if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1}/{displayImages.length}
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
