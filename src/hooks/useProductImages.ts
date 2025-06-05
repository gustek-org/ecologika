import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductImage {
  id?: string;
  image_url: string;
  image_order: number;
  file?: File;
}

export const useProductImages = () => {
  const { toast } = useToast();

  const uploadImage = async (file: File, productId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      return null;
    }
  };

  const saveProductImages = async (productId: string, images: ProductImage[]) => {
    try {
      // First, upload new images that have files
      const uploadPromises = images.map(async (image, index) => {
        if (image.file) {
          const uploadedUrl = await uploadImage(image.file, productId);
          if (uploadedUrl) {
            return {
              product_id: productId,
              image_url: uploadedUrl,
              image_order: index + 1
            };
          }
        } else {
          // Existing image, just update order if needed
          return {
            product_id: productId,
            image_url: image.image_url,
            image_order: index + 1
          };
        }
        return null;
      });

      const imageData = (await Promise.all(uploadPromises)).filter(Boolean);

      if (imageData.length > 0) {
        const { error } = await supabase
          .from('product_images')
          .insert(imageData);

        if (error) {
          throw error;
        }
      }

      return true;
    } catch (error) {
      console.error('Error saving images:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as imagens.",
        variant: "destructive",
      });
      return false;
    }
  };

  const fetchProductImages = async (productId: string): Promise<ProductImage[]> => {
    try {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('image_order');

      if (error) {
        throw error;
      }

      return data?.map(img => ({
        id: img.id,
        image_url: img.image_url,
        image_order: img.image_order
      })) || [];
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  };

  const deleteProductImage = async (imageId: string, imageUrl: string) => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        throw dbError;
      }

      // Extract file path from URL and delete from storage
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // Get productId/filename.ext

      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (storageError) {
        console.warn('Could not delete file from storage:', storageError);
      }

      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a imagem.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadImage,
    saveProductImages,
    fetchProductImages,
    deleteProductImage
  };
};
