
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AddProduct = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if not authenticated or not a seller
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  if (profile?.type !== 'seller') {
    navigate('/');
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
    location: '',
    image_url: '',
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

      const productData = {
        name: formData.name,
        description: formData.description,
        material: formData.material,
        category: formData.category,
        price: parsePrice(formData.price),
        quantity: parseInt(formData.quantity) || 1,
        unit: formData.unit,
        location: formData.location,
        image_url: formData.image_url,
        co2_savings: co2SavingsValue, // Now storing as number or null
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

      console.log('Product created:', data);

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
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Adicionar Novo Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <SelectContent>
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
                    <SelectContent>
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

              <div>
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Cidade, Estado"
                  required
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
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
                className="w-full bg-green-600 hover:bg-green-700"
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
