
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProductImages } from '@/hooks/useProductImages';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';
import { Plus, MapPin, ChevronLeft, ChevronRight, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  material: string;
  location: string;
  quantity: number;
  unit: string;
  is_active: boolean;
  image_url: string;
  co2_savings: string;
  seller_name: string;
  seller_company: string;
  category: string;
  created_at: string;
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
        <Skeleton className="h-8 flex-1" />
      </div>
    </CardContent>
  </Card>
);

const ProductEditModal = ({ 
  product, 
  isOpen, 
  onOpenChange, 
  onSave 
}: { 
  product: ProductWithImages; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  onSave: (product: ProductWithImages) => void;
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price.toString(),
    material: product.material,
    location: product.location,
    quantity: product.quantity.toString(),
    unit: product.unit,
    co2_savings: product.co2_savings?.toString() || '',
    category: product.category,
  });
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Validate numeric fields
      const price = parseFloat(formData.price);
      const quantity = parseInt(formData.quantity);
      const co2_savings = formData.co2_savings ? parseFloat(formData.co2_savings) : null;

      if (isNaN(price) || price <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira um preço válido.",
          variant: "destructive",
        });
        return;
      }

      if (isNaN(quantity) || quantity <= 0) {
        toast({
          title: "Erro",
          description: "Por favor, insira uma quantidade válida.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: price,
          material: formData.material,
          location: formData.location,
          quantity: quantity,
          unit: formData.unit,
          co2_savings: co2_savings,
          category: formData.category,
        })
        .eq('id', product.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Produto atualizado",
        description: "Produto foi atualizado com sucesso.",
      });
      
      onSave(product);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do produto</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="co2_savings">Economia de CO₂</Label>
              <Input
                id="co2_savings"
                value={formData.co2_savings}
                onChange={(e) => setFormData(prev => ({ ...prev, co2_savings: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ton">tonelada</SelectItem>
                  <SelectItem value="m³">m³</SelectItem>
                  <SelectItem value="unidade">unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="material">Material</Label>
            <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Papel">Papel</SelectItem>
                <SelectItem value="Plástico">Plástico</SelectItem>
                <SelectItem value="Metal">Metal</SelectItem>
                <SelectItem value="Vidro">Vidro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductCard = ({ 
  product, 
  onToggleStatus, 
  onDelete, 
  onEdit 
}: { 
  product: ProductWithImages; 
  onToggleStatus: (id: string, currentStatus: boolean) => void; 
  onDelete: (id: string) => void;
  onEdit: (product: ProductWithImages) => void;
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleEditSave = (updatedProduct: ProductWithImages) => {
    onEdit(updatedProduct);
  };

  return (
    <>
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
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {currentImageIndex + 1}/{product.allImages!.length}
              </div>
            </>
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
          
          <div className="space-y-2">
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
                onClick={() => onDelete(product.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductEditModal
        product={product}
        isOpen={showEditModal}
        onOpenChange={setShowEditModal}
        onSave={handleEditSave}
      />
    </>
  );
};

const MyProducts = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  const navigate = useNavigate();
  
  const shouldShowLoading = useMinimumLoadingTime(isLoading, 1200);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedProducts = await Promise.all(
        data?.map(async (product) => {
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
      console.error('Erro ao buscar produtos:', error);
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

  const deleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        throw error;
      }

      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );

      toast({
        title: "Produto excluído",
        description: "Produto foi excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    }
  };

  const handleProductEdit = (product: ProductWithImages) => {
    fetchProducts(); // Recarregar produtos após edição
  };

  if (shouldShowLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Meus produtos</h3>
            <p className="text-gray-600">Gerencie seus produtos cadastrados</p>
          </div>
          <Button 
            onClick={() => navigate('/add-product')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar produto
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Meus produtos</h3>
          <p className="text-gray-600">Gerencie seus produtos cadastrados</p>
        </div>
        <Button 
          onClick={() => navigate('/add-product')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar produto
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhum produto.</p>
          <Button 
            onClick={() => navigate('/add-product')}
            className="bg-green-600 hover:bg-green-700"
          >
            Cadastrar primeiro produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onToggleStatus={toggleProductStatus}
              onDelete={deleteProduct}
              onEdit={handleProductEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
