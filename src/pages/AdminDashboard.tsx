
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Eye, Users, Package } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  company: string;
  location: string;
  created_at: string;
}

interface PendingProduct {
  id: string;
  name: string;
  material: string;
  price: number;
  seller_name: string;
  seller_company: string;
  description: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isMaster } = useAuth();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isMaster) {
      fetchPendingData();
    }
  }, [isMaster]);

  const fetchPendingData = async () => {
    try {
      // Fetch pending users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch pending products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setPendingUsers(usersData || []);
      setPendingProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching pending data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados pendentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserApproval = async (userId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const updateData = {
        approval_status: approved ? 'approved' : 'rejected',
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: user?.id,
        rejection_reason: rejectionReason || null,
        is_approved: approved
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Usuário ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`,
      });

      fetchPendingData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleProductApproval = async (productId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const updateData = {
        approval_status: approved ? 'approved' : 'rejected',
        approved_at: approved ? new Date().toISOString() : null,
        approved_by: user?.id,
        rejection_reason: rejectionReason || null
      };

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Produto ${approved ? 'aprovado' : 'rejeitado'} com sucesso!`,
      });

      fetchPendingData();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      });
    }
  };

  if (!isMaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4 text-ecologika-primary">Acesso Negado</h2>
              <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ecologika-primary mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">Gerencie aprovações de usuários e produtos</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Novos Usuários ({pendingUsers.length})</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Novos Produtos ({pendingProducts.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">
                      Nenhum usuário pendente
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                pendingUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <Badge variant="secondary">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Empresa:</strong> {user.company || 'Não informado'}</p>
                        <p><strong>Localização:</strong> {user.location || 'Não informado'}</p>
                        <p><strong>Data:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleUserApproval(user.id, true)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                        <Button
                          onClick={() => handleUserApproval(user.id, false, 'Dados incompletos')}
                          variant="destructive"
                          className="flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="space-y-4">
              {pendingProducts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600">
                      Nenhum produto pendente
                    </h3>
                  </CardContent>
                </Card>
              ) : (
                pendingProducts.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">Pendente</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p><strong>Material:</strong> {product.material}</p>
                        <p><strong>Preço:</strong> R$ {product.price.toFixed(2)}</p>
                        <p><strong>Vendedor:</strong> {product.seller_name}</p>
                        <p><strong>Empresa:</strong> {product.seller_company || 'Não informado'}</p>
                        <p><strong>Descrição:</strong> {product.description}</p>
                        <p><strong>Data:</strong> {new Date(product.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleProductApproval(product.id, true)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span>Aprovar</span>
                        </Button>
                        <Button
                          onClick={() => handleProductApproval(product.id, false, 'Produto inadequado')}
                          variant="destructive"
                          className="flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Rejeitar</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
