
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Building, User, Heart, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Mock data - in a real app this would come from an API
const mockProducts = [
  {
    id: '1',
    name: 'Papel Reciclado',
    material: 'Papel',
    type: 'Escritório',
    quantity: 1000,
    unit: 'kg',
    price: 150,
    location: 'São Paulo, SP',
    seller: 'João Silva',
    sellerCompany: 'EcoPaper Ltda',
    description: 'Papel reciclado de alta qualidade, ideal para impressão e embalagens. Produzido com processos sustentáveis e certificado para uso comercial.',
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Plástico PET',
    material: 'Plástico',
    type: 'PET',
    quantity: 500,
    unit: 'kg',
    price: 300,
    location: 'Rio de Janeiro, RJ',
    seller: 'Maria Santos',
    sellerCompany: 'PlasticoVerde',
    description: 'Garrafas PET prensadas, prontas para reciclagem industrial.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    name: 'Alumínio Limpo',
    material: 'Metal',
    type: 'Alumínio',
    quantity: 200,
    unit: 'kg',
    price: 800,
    location: 'Belo Horizonte, MG',
    seller: 'Carlos Oliveira',
    sellerCompany: 'MetalRecicla',
    description: 'Latas de alumínio limpas e prensadas, excelente qualidade.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Vidro Transparente',
    material: 'Vidro',
    type: 'Transparente',
    quantity: 300,
    unit: 'kg',
    price: 100,
    location: 'Curitiba, PR',
    seller: 'Ana Costa',
    sellerCompany: 'VidroEco',
    description: 'Vidro transparente separado e limpo, sem contaminações.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-22'
  }
];

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { saveProduct, unsaveProduct, isProductSaved, isAuthenticated } = useAuth();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const product = mockProducts.find(p => p.id === id);

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
    navigate('/checkout', { 
      state: { 
        product, 
        quantity: selectedQuantity,
        totalPrice: product.price * selectedQuantity
      } 
    });
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
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
                  <span>{product.sellerCompany}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  <span>{product.seller}</span>
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
