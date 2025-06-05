
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, CreditCard, Truck, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProductImages } from '@/hooks/useProductImages';

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

const CheckoutSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Skeleton className="w-20 h-20 rounded" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forms Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
);

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { fetchProductImages } = useProductImages();
  
  const productId = searchParams.get('product');
  const requestedQuantity = Number(searchParams.get('quantity')) || 1;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(requestedQuantity);
  const [isLoading, setIsLoading] = useState(true);
  const [productImage, setProductImage] = useState<string>('');
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
        const formattedProduct = {
          ...data,
          co2_savings: data.co2_savings?.toString() || '',
        };
        setProduct(formattedProduct);
        
        // Load product images
        const images = await fetchProductImages(data.id);
        if (images.length > 0) {
          setProductImage(images[0].image_url);
        } else {
          setProductImage(data.image_url || '');
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  // Input masks and validation functions
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{0,5})(\d{0,4})/, (match, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1) return `(${p1}`;
        return match;
      });
    }
    return value.slice(0, 15); // Limit length
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{0,3})/, (match, p1, p2) => {
        if (p2) return `${p1}-${p2}`;
        return p1;
      });
    }
    return value.slice(0, 9); // Limit length
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setShippingInfo(prev => ({ ...prev, phone: formatted }));
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value);
    setShippingInfo(prev => ({ ...prev, zipCode: formatted }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) > 0)) {
      setQuantity(value === '' ? 1 : parseInt(value));
    }
  };

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Produto não encontrado</h2>
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
                      src={productImage || '/placeholder.svg'} 
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
                          type="text"
                          value={quantity}
                          onChange={handleQuantityChange}
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
                        {quantity}x {product.co2_savings}kg CO2 evitado
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
                        onChange={handleZipCodeChange}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <Input
                        value={shippingInfo.phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
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
                disabled={quantity < 1 || quantity > product.quantity}
              >
                Confirmar Compra
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
