
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const { product, quantity, totalPrice } = location.state || {};

  if (!product || !isAuthenticated) {
    navigate('/products');
    return null;
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

  const calculateCO2Saved = () => {
    // Simulação simples do CO2 evitado por material
    const co2PerKg = {
      'Papel': 1.2,
      'Plástico': 2.5,
      'Metal': 4.8,
      'Vidro': 0.8
    };
    
    const co2Factor = co2PerKg[product.material as keyof typeof co2PerKg] || 1;
    return (quantity * co2Factor).toFixed(2);
  };

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular registro da compra
    const purchases = JSON.parse(localStorage.getItem('ecomarket_purchases') || '[]');
    const newPurchase = {
      id: Date.now().toString(),
      buyerId: user?.id,
      productId: product.id,
      productName: product.name,
      sellerName: product.seller,
      sellerCompany: product.sellerCompany,
      quantity,
      unitPrice: product.price,
      totalPrice,
      co2Saved: calculateCO2Saved(),
      date: new Date().toISOString(),
      status: 'completed'
    };
    
    purchases.push(newPurchase);
    localStorage.setItem('ecomarket_purchases', JSON.stringify(purchases));
    
    setIsProcessing(false);
    setOrderComplete(true);
    
    toast({
      title: "Compra realizada com sucesso!",
      description: `Você salvou ${calculateCO2Saved()}kg de CO2`,
    });
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Compra Realizada com Sucesso!
              </h1>
              <p className="text-gray-600 mb-6">
                Sua compra foi registrada e você contribuiu para um mundo mais sustentável!
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">
                  🌱 Você evitou a emissão de {calculateCO2Saved()}kg de CO2!
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/products')}
                  className="w-full"
                >
                  Continuar Comprando
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/my-purchases')}
                  className="w-full"
                >
                  Ver Minhas Compras
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <Badge className={getMaterialColor(product.material)}>
                    {product.material}
                  </Badge>
                  <h3 className="font-semibold mt-1">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.sellerCompany}</p>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Quantidade:</span>
                  <span>{quantity} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span>Preço unitário:</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm">
                  🌱 Esta compra evitará a emissão de <strong>{calculateCO2Saved()}kg de CO2</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  defaultValue={user?.name}
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  defaultValue={user?.email}
                  placeholder="seu@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço de Entrega</Label>
                <Input 
                  id="address" 
                  placeholder="Rua, número, complemento"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" placeholder="Cidade" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" placeholder="00000-000" />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ℹ️ Esta é uma compra fictícia para demonstração. Nenhum pagamento real será processado.
                </p>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={handleConfirmOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processando...' : 'Confirmar Compra'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
