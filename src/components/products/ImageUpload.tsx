import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductImage {
  id?: string;
  image_url: string;
  image_order: number;
  file?: File;
}

interface ImageUploadProps {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + images.length > maxImages) {
      toast({
        title: "Limite excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Formato inválido",
          description: "Apenas arquivos de imagem são permitidos.",
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "Arquivo muito grande",
          description: `${file.name} é muito grande. Limite de 5MB.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    const newImages: ProductImage[] = validFiles.map((file, index) => ({
      image_url: URL.createObjectURL(file),
      image_order: images.length + index + 1,
      file,
    }));

    onImagesChange([...images, ...newImages]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      image_order: i + 1,
    }));
    onImagesChange(reorderedImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);

    // Update order
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      image_order: i + 1,
    }));
    onImagesChange(reorderedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Imagens do Produto ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="hover:bg-orbio-primary hover:text-white transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Imagens
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 hover:border-orbiomary transition-colors">
          <CardContent className="p-6 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">Nenhuma imagem adicionada</p>
            <p className="text-sm text-gray-400">
              Clique em "Adicionar Imagens" para fazer upload
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card
              key={index}
              className="relative group hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-2">
                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden relative">
                  <img
                    src={image.image_url}
                    alt={`Produto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-orbiomary text-white text-xs px-2 py-1 rounded">
                      Principal
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                  <div className="flex gap-1">
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveImage(index, index - 1)}
                      >
                        ←
                      </Button>
                    )}
                    {index < images.length - 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveImage(index, index + 1)}
                      >
                        →
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
