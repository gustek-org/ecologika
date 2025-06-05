
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Purchase {
  id: string;
  buyer_id: string;
  product_id: string;
  seller_id: string;
  quantity: number;
  total_price: number;
  co2_saved: number | null;
  purchase_date: string;
  status: string;
  products: {
    name: string;
    seller_name: string;
    seller_company: string;
    unit: string;
  };
}

const MyPurchases = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    fetchPurchases();
  }, [user?.id]);

  const fetchPurchases = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching purchases for user:', user.id);
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          products (
            name,
            seller_name,
            seller_company,
            unit
          )
        `)
        .eq('buyer_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
        throw error;
      }

      console.log('Fetched purchases:', data);
      setPurchases(data || []);
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas compras.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalCO2Saved = () => {
    return purchases.reduce((total: number, purchase: Purchase) => 
      total + (purchase.co2_saved || 0), 0
    ).toFixed(2);
  };

  const getTotalSpent = () => {
    return purchases.reduce((total: number, purchase: Purchase) => 
      total + purchase.total_price, 0
    );
  };

  if (isLoading) {
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

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Minhas Compras</h1>
              <p className="text-gray-600">Histórico de todas as suas compras sustentáveis</p>
            </div>

            {/* Resumo - Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabela - Skeleton */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
          onClick={() => navigate('/products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos produtos
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Minhas Compras</h1>
            <p className="text-gray-600">Histórico de todas as suas compras sustentáveis</p>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Compras</p>
                    <p className="text-2xl font-bold">{purchases.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Leaf className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">CO2 Evitado</p>
                    <p className="text-2xl font-bold text-green-600">{getTotalCO2Saved()}kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div>
                  <p className="text-sm text-gray-600">Total Investido</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrice(getTotalSpent())}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de compras */}
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Nenhuma compra realizada
                </h3>
                <p className="text-gray-500 mb-6">
                  Você ainda não fez nenhuma compra. Que tal explorar nossos produtos sustentáveis?
                </p>
                <Button onClick={() => navigate('/products')}>
                  Explorar Produtos
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Compras</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>CO2 Evitado</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase: Purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{purchase.products?.name || 'Produto não encontrado'}</p>
                            <p className="text-sm text-gray-500">{purchase.products?.seller_company || ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.products?.seller_name || 'N/A'}</TableCell>
                        <TableCell>{purchase.quantity} {purchase.products?.unit || 'un'}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(purchase.total_price)}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            {(purchase.co2_saved || 0).toFixed(2)}kg
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            {purchase.status === 'completed' ? 'Concluída' : purchase.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyPurchases;
