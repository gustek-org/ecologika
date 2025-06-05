
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, Truck, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  seller_id: string;
  seller_name: string;
  seller_company: string;
  image_url: string;
  co2_savings: string | number;
  created_at: string;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const productId = searchParams.get('product');
  const requestedQuantity = Number(searchParams.get('quantity')) || 1;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(requestedQuantity);
  const [shippingInfo, setShippingInfo] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      navigate('/products');
    }
  }, [productId, navigate]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      if (data) {
        setProduct({
          ...data,
          co2_savings: data.co2_savings?.toString() || '',
        });
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: "Erro",
        description: "Produto não encontrado.",
        variant: "destructive",
      });
      navigate('/products');
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Carregando produto...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = product.price * quantity;
  const shipping = 15.00;
  const total = subtotal + shipping;
  
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

  const handlePurchase = async () => {
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todas as informações de entrega.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create purchase record in Supabase
      const purchaseData = {
        buyer_id: user.id,
        product_id: product.id,
        seller_id: product.seller_id,
        quantity,
        total_price: total,
        co2_saved: product.co2_savings ? parseFloat(product.co2_savings.toString()) * quantity : null,
        status: 'completed'
      };

      const { data, error } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Purchase created:', data);

      toast({
        title: "Compra realizada!",
        description: "Sua compra foi confirmada com sucesso.",
      });

      navigate('/my-purchases');
    } catch (error) {
      console.error('Erro ao realizar compra:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a compra. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Finalizar Compra</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações do Produto */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.seller_name}</p>
                      <Badge className={`mt-1 ${getMaterialColor(product.material)}`}>
                        {product.material}
                      </Badge>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm">Quantidade:</span>
                        <Input
                          type="number"
                          min="1"
                          max={product.quantity}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600">
                          (máx: {product.quantity} {product.unit})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({quantity}x {formatPrice(product.price)})</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Frete
                      </span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {product.co2_savings && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <Leaf className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Impacto Ambiental</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {quantity}x {product.co2_savings}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informações de Entrega e Pagamento */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Informações de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço *
                    </label>
                    <Input
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, bairro"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <Input
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Cidade"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <Input
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Estado"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <Input
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="00000-000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <Input
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💳 <strong>Pagamento via PIX</strong><br />
                      Após confirmar a compra, você receberá as instruções de pagamento por email.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={handlePurchase}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                Confirmar Compra - {formatPrice(total)}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
