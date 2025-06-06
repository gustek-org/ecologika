import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountrySelectImproved } from '@/components/ui/country-select-improved';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from '@/components/products/ImageUpload';
import { useProductImages } from '@/hooks/useProductImages';

interface ProductImage {
  id?: string;
  image_url: string;
  image_order: number;
  file?: File;
}

const AddProduct = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveProductImages } = useProductImages();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ProductImage[]>([]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    material: '',
    category: '',
    price: '',
    quantity: '',
    unit: 'kg',
    country: '',
    city: '',
    address: '',
    co2_savings: ''
  });

  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/[^\d]/g, '');
    
    // Se não há números, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const numberValue = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const parsePrice = (formattedPrice: string): number => {
    // Remove símbolos de moeda e converte para número
    const numbers = formattedPrice.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numbers) || 0;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    setFormData(prev => ({ ...prev, price: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert co2_savings to number if it has a numeric value, otherwise store as null
      const co2SavingsValue = formData.co2_savings ? parseFloat(formData.co2_savings.replace(/[^\d.,]/g, '').replace(',', '.')) : null;

      // Combine location fields into a single location string
      const locationParts = [formData.city, formData.country].filter(Boolean);
      const location = locationParts.join(', ');

      const productData = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        category: formData.category,
        price: parsePrice(formData.price),
        quantity: parseInt(formData.quantity) || 1,
        unit: formData.unit,
        location: location,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        image_url: images.length > 0 ? images[0].image_url : null, // Use first image as main image
        co2_savings: co2SavingsValue,
        seller_id: user.id,
        seller_name: profile?.name || '',
        seller_company: profile?.company || '',
        is_active: true
      };

      console.log('Inserting product:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const newProduct = data[0];
      console.log('Product created:', newProduct);

      // Save product images if any
      if (images.length > 0) {
        const imagesSaved = await saveProductImages(newProduct.id, images);
        if (!imagesSaved) {
          console.warn('Some images could not be saved');
        }
      }

      toast({
        title: "Produto adicionado!",
        description: "Seu produto foi cadastrado com sucesso.",
      });

      navigate('/my-products');
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto. Tente novamente.",
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
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Adicionar Novo Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="material">Material *</Label>
                  <Select value={formData.material} onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="Papel">Papel</SelectItem>
                      <SelectItem value="Plástico">Plástico</SelectItem>
                      <SelectItem value="Metal">Metal</SelectItem>
                      <SelectItem value="Vidro">Vidro</SelectItem>
                      <SelectItem value="Madeira">Madeira</SelectItem>
                      <SelectItem value="Textil">Têxtil</SelectItem>
                      <SelectItem value="Eletrônicos">Eletrônicos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Ex: Embalagens, Componentes..."
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="R$ 0,00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unidade</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg">
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="ton">Toneladas (ton)</SelectItem>
                      <SelectItem value="un">Unidades (un)</SelectItem>
                      <SelectItem value="m²">Metros quadrados (m²)</SelectItem>
                      <SelectItem value="m³">Metros cúbicos (m³)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Localização</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CountrySelectImproved
                      label="País"
                      value={formData.country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                      placeholder="Selecione o país"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">Cidade *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Nome da cidade"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Rua, número, bairro (opcional)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="co2_savings">Economia de CO₂ (opcional)</Label>
                <Input
                  id="co2_savings"
                  type="text"
                  value={formData.co2_savings}
                  onChange={(e) => setFormData(prev => ({ ...prev, co2_savings: e.target.value }))}
                  placeholder="Ex: 2.5 kg CO₂ por unidade"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Adicionando...' : 'Adicionar Produto'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default AddProduct;
