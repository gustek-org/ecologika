import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductImage {
  id: string;
  image_url: string;
  image_order: number;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Card className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <CardContent className="p-0 h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p>Nenhuma imagem disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedImages = [...images].sort(
    (a, b) => a.image_order - b.image_order
  );

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + sortedImages.length) % sortedImages.length
    );
  };

  const currentImage = sortedImages[currentImageIndex];

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Main Image */}
          <div className="aspect-video bg-gray-100 relative group cursor-pointer">
            <img
              src={currentImage.image_url}
              alt={`${productName} - Imagem ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onClick={() => setShowModal(true)}
            />

            {/* Navigation arrows for multiple images */}
            {sortedImages.length > 1 && (
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

            {/* Image counter */}
            {sortedImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {sortedImages.length}
              </div>
            )}
          </div>

          {/* Thumbnail navigation */}
          {sortedImages.length > 1 && (
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                      index === currentImageIndex
                        ? "border-orbio-primary"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal for full-size image */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-12 right-0 text-white hover:bg-white/20"
              onClick={() => setShowModal(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <img
              src={currentImage.image_url}
              alt={`${productName} - Imagem ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation in modal */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
                  {currentImageIndex + 1} / {sortedImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductImageGallery;
