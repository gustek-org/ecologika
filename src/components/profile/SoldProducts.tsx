import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMinimumLoadingTime } from '@/hooks/useMinimumLoadingTime';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye } from 'lucide-react';

interface SoldProduct {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  purchase_date: string;
  status: string;
  buyer_name: string;
  buyer_email: string;
  buyer_company: string;
  buyer_location: string;
  co2_saved: number;
}

const SoldProductDetailsModal = ({ 
  product, 
  isOpen, 
  onOpenChange 
}: { 
  product: SoldProduct | null; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Venda</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Produto</h4>
              <p className="text-gray-600">{product.product_name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quantidade</h4>
              <p className="text-gray-600">{product.quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Preço Total</h4>
              <p className="text-green-600 font-bold">{formatPrice(product.total_price)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Data da Compra</h4>
              <p className="text-gray-600">{formatDate(product.purchase_date)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Status da Compra</h4>
            <p className="text-gray-600 capitalize">{product.status}</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informações do Comprador</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{product.buyer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{product.buyer_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{product.buyer_company || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium">{product.buyer_location || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {product.co2_saved && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Economia de CO₂</h4>
              <p className="text-green-600 font-medium">{product.co2_saved} kg</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Informações de Entrega</h4>
            <p className="text-gray-600">
              Status: <span className="capitalize font-medium">{product.status}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Para mais detalhes sobre a entrega, entre em contato com o comprador.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SoldProductsTableSkeleton = () => (
  <div className="space-y-4">
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Comprador</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-8 w-20" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);

const SoldProducts = () => {
  const [soldProducts, setSoldProducts] = useState<SoldProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<SoldProduct | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const shouldShowLoading = useMinimumLoadingTime(isLoading, 1200);

  useEffect(() => {
    fetchSoldProducts();
  }, [user]);

  const fetchSoldProducts = async () => {
    if (!user) return;

    try {
      console.log('Fetching sold products for user:', user.id);
      
      // First get the purchases where current user is the seller
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          id,
          quantity,
          total_price,
          purchase_date,
          status,
          co2_saved,
          buyer_id,
          products!inner(name)
        `)
        .eq('seller_id', user.id)
        .order('purchase_date', { ascending: false });

      console.log('Purchases data:', purchasesData);
      console.log('Purchases error:', purchasesError);

      if (purchasesError) {
        throw purchasesError;
      }

      if (!purchasesData || purchasesData.length === 0) {
        console.log('No purchases found');
        setSoldProducts([]);
        return;
      }

      // Get unique buyer IDs
      const buyerIds = [...new Set(purchasesData.map(p => p.buyer_id))];
      console.log('Buyer IDs:', buyerIds);

      // Get buyer profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, company, location')
        .in('id', buyerIds);

      console.log('Profiles data:', profilesData);
      console.log('Profiles error:', profilesError);

      if (profilesError) {
        console.error('Erro ao buscar profiles dos compradores:', profilesError);
      }

      // Combine the data
      const formattedData = purchasesData.map(item => {
        const buyerProfile = profilesData?.find(p => p.id === item.buyer_id);
        console.log('Buyer profile for ID', item.buyer_id, ':', buyerProfile);
        
        return {
          id: item.id,
          product_name: item.products.name,
          quantity: item.quantity,
          total_price: item.total_price,
          purchase_date: item.purchase_date,
          status: item.status,
          buyer_name: buyerProfile?.name || 'Não informado',
          buyer_email: buyerProfile?.email || 'Não informado',
          buyer_company: buyerProfile?.company || 'Não informado',
          buyer_location: buyerProfile?.location || 'Não informado',
          co2_saved: item.co2_saved || 0,
        };
      });

      console.log('Formatted data:', formattedData);
      setSoldProducts(formattedData);
    } catch (error) {
      console.error('Erro ao buscar produtos vendidos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos vendidos.",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleViewDetails = (product: SoldProduct) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  if (shouldShowLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Produtos vendidos</h3>
          <p className="text-gray-600">Acompanhe suas vendas realizadas</p>
        </div>
        <SoldProductsTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Produtos vendidos</h3>
        <p className="text-gray-600">Acompanhe suas vendas realizadas</p>
      </div>

      {soldProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não vendeu nenhum produto.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Comprador</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soldProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.product_name}</TableCell>
                  <TableCell>{product.buyer_name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {formatPrice(product.total_price)}
                  </TableCell>
                  <TableCell>{formatDate(product.purchase_date)}</TableCell>
                  <TableCell>
                    <span className="capitalize">{product.status}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(product)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver mais
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <SoldProductDetailsModal
        product={selectedProduct}
        isOpen={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  );
};

export default SoldProducts;
