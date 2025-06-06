
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

interface Purchase {
  id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  purchase_date: string;
  status: string;
  seller_name: string;
  seller_email: string;
  seller_company: string;
  seller_location: string;
  co2_saved: number;
}

const PurchaseDetailsModal = ({ 
  purchase, 
  isOpen, 
  onOpenChange 
}: { 
  purchase: Purchase | null; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  if (!purchase) return null;

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
          <DialogTitle>Detalhes da Compra</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Produto</h4>
              <p className="text-gray-600">{purchase.product_name}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quantidade</h4>
              <p className="text-gray-600">{purchase.quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Preço Total</h4>
              <p className="text-green-600 font-bold">{formatPrice(purchase.total_price)}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Data da Compra</h4>
              <p className="text-gray-600">{formatDate(purchase.purchase_date)}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Status da Compra</h4>
            <p className="text-gray-600 capitalize">{purchase.status}</p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Informações do Vendedor</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nome</p>
                <p className="font-medium">{purchase.seller_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{purchase.seller_email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Empresa</p>
                <p className="font-medium">{purchase.seller_company || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Localização</p>
                <p className="font-medium">{purchase.seller_location || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {purchase.co2_saved && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Economia de CO₂</h4>
              <p className="text-green-600 font-medium">{purchase.co2_saved} kg</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Informações de Entrega</h4>
            <p className="text-gray-600">
              Status: <span className="capitalize font-medium">{purchase.status}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Para mais detalhes sobre a entrega, entre em contato com o vendedor.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PurchaseHistoryTableSkeleton = () => (
  <div className="space-y-4">
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Vendedor</TableHead>
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

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const shouldShowLoading = useMinimumLoadingTime(isLoading, 1200);

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;

    try {
      // First get the purchases where current user is the buyer
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          id,
          quantity,
          total_price,
          purchase_date,
          status,
          co2_saved,
          seller_id,
          products!inner(name)
        `)
        .eq('buyer_id', user.id)
        .order('purchase_date', { ascending: false });

      if (purchasesError) {
        throw purchasesError;
      }

      if (!purchasesData || purchasesData.length === 0) {
        setPurchases([]);
        return;
      }

      // Get seller profiles separately
      const sellerIds = purchasesData.map(p => p.seller_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, company, location')
        .in('id', sellerIds);

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        // Continue without seller info if profiles fetch fails
      }

      // Combine the data
      const formattedData = purchasesData.map(item => {
        const sellerProfile = profilesData?.find(p => p.id === item.seller_id);
        
        return {
          id: item.id,
          product_name: item.products.name,
          quantity: item.quantity,
          total_price: item.total_price,
          purchase_date: item.purchase_date,
          status: item.status,
          seller_name: sellerProfile?.name || 'Não informado',
          seller_email: sellerProfile?.email || 'Não informado',
          seller_company: sellerProfile?.company || '',
          seller_location: sellerProfile?.location || '',
          co2_saved: item.co2_saved || 0,
        };
      });

      setPurchases(formattedData);
    } catch (error) {
      console.error('Erro ao buscar histórico de compras:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de compras.",
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

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  if (shouldShowLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Histórico de compras</h3>
          <p className="text-gray-600">Acompanhe suas compras realizadas</p>
        </div>
        <PurchaseHistoryTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Histórico de compras</h3>
        <p className="text-gray-600">Acompanhe suas compras realizadas</p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não fez nenhuma compra.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.product_name}</TableCell>
                  <TableCell>{purchase.seller_name}</TableCell>
                  <TableCell>{purchase.quantity}</TableCell>
                  <TableCell className="text-green-600 font-semibold">
                    {formatPrice(purchase.total_price)}
                  </TableCell>
                  <TableCell>{formatDate(purchase.purchase_date)}</TableCell>
                  <TableCell>
                    <span className="capitalize">{purchase.status}</span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(purchase)}
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

      <PurchaseDetailsModal
        purchase={selectedPurchase}
        isOpen={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />
    </div>
  );
};

export default PurchaseHistory;
