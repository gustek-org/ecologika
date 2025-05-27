
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  sellerId: string;
  seller: string;
  sellerCompany: string;
  images: string[];
  co2Savings: string;
  createdAt: string;
}

const MyProducts = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  if (!isAuthenticated || user?.type !== 'seller') {
    navigate('/login');
    return null;
  }

  const products = JSON.parse(localStorage.getItem('ecomarket_products') || '[]')
    .filter((product: Product) => product.sellerId === user?.id)
    .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;

    const allProducts = JSON.parse(localStorage.getItem('ecomarket_products') || '[]');
    const updatedProducts = allProducts.map((p: Product) => 
      p.id === editingProduct.id ? editingProduct : p
    );
    
    localStorage.setItem('ecomarket_products', JSON.stringify(updatedProducts));
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    
    toast({
      title: "Produto atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = (productId: string) => {
    const allProducts = JSON.parse(localStorage.getItem('ecomarket_products') || '[]');
    const updatedProducts = allProducts.filter((p: Product) => p.id !== productId);
    localStorage.setItem('ecomarket_products', JSON.stringify(updatedProducts));
    
    toast({
      title: "Produto removido!",
      description: "O produto foi excluído com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Meus Produtos</h1>
            <p className="text-gray-600">Gerencie seus produtos em venda</p>
          </div>
          <Button 
            onClick={() => navigate('/add-product')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total de Produtos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Valor Total em Estoque</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPrice(products.reduce((total: number, p: Product) => total + (p.price * p.quantity), 0))}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-600">Itens em Estoque</p>
                <p className="text-2xl font-bold text-blue-600">
                  {products.reduce((total: number, p: Product) => total + p.quantity, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de produtos */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Nenhum produto cadastrado
              </h3>
              <p className="text-gray-500 mb-6">
                Comece adicionando seu primeiro produto sustentável para venda.
              </p>
              <Button 
                onClick={() => navigate('/add-product')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.location}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMaterialColor(product.material)}>
                          {product.material}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.quantity} {product.unit}</TableCell>
                      <TableCell>{formatPrice(product.price)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatPrice(product.price * product.quantity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Dialog de edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Quantidade</label>
                    <Input
                      type="number"
                      value={editingProduct.quantity}
                      onChange={(e) => setEditingProduct({...editingProduct, quantity: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Preço</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <Button onClick={handleSaveEdit} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
};

export default MyProducts;
