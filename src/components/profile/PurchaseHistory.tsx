
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Purchase {
  id: string;
  total_price: number;
  quantity: number;
  purchase_date: string;
  status: string;
  products: {
    name: string;
    category: string;
  };
}

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPurchases();
  }, [user]);

  const fetchPurchases = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          products (
            name,
            category
          )
        `)
        .eq('buyer_id', user.id)
        .order('purchase_date', { ascending: false });

      if (error) {
        console.error('Error fetching purchases:', error);
      } else {
        setPurchases(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de compras</h3>
        <p className="text-gray-600">Visualize todas as suas compras realizadas</p>
      </div>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Você ainda não realizou nenhuma compra.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{purchase.products.name}</CardTitle>
                    <p className="text-sm text-gray-600">{purchase.products.category}</p>
                  </div>
                  <Badge variant="default">{purchase.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Quantidade</p>
                    <p className="font-medium">{purchase.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-medium text-green-600">
                      R$ {purchase.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Data</p>
                    <p className="font-medium">
                      {new Date(purchase.purchase_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
