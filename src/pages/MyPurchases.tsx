
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Package, Leaf } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Purchase {
  id: string;
  buyerId: string;
  productId: string;
  productName: string;
  sellerName: string;
  sellerCompany: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  co2Saved: string;
  date: string;
  status: string;
}

const MyPurchases = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Buscar compras do localStorage
  const purchases = JSON.parse(localStorage.getItem('ecomarket_purchases') || '[]')
    .filter((purchase: Purchase) => purchase.buyerId === user?.id)
    .sort((a: Purchase, b: Purchase) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      total + parseFloat(purchase.co2Saved), 0
    ).toFixed(2);
  };

  const getTotalSpent = () => {
    return purchases.reduce((total: number, purchase: Purchase) => 
      total + purchase.totalPrice, 0
    );
  };

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
                            <p className="font-medium">{purchase.productName}</p>
                            <p className="text-sm text-gray-500">{purchase.sellerCompany}</p>
                          </div>
                        </TableCell>
                        <TableCell>{purchase.sellerName}</TableCell>
                        <TableCell>{purchase.quantity} un</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatPrice(purchase.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            {purchase.co2Saved}kg
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
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
