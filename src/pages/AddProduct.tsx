
import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  name: string;
  description: string;
  material: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  imageUrl: string;
}

const AddProduct = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      material: '',
      quantity: 1,
      unit: 'unidade',
      price: 0,
      location: user?.location || '',
      imageUrl: ''
    }
  });

  if (!isAuthenticated || user?.type !== 'seller') {
    navigate('/login');
    return null;
  }

  const onSubmit = (data: ProductFormData) => {
    console.log('Adding product:', data);
    
    const products = JSON.parse(localStorage.getItem('ecomarket_products') || '[]');
    const newProduct = {
      id: Date.now().toString(),
      ...data,
      seller: user.name,
      sellerCompany: user.company || 'Empresa',
      sellerId: user.id,
      images: [data.imageUrl || '/placeholder.svg'],
      co2Savings: (Math.random() * 5 + 1).toFixed(1),
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    localStorage.setItem('ecomarket_products', JSON.stringify(products));
    
    toast({
      title: "Produto adicionado com sucesso!",
      description: "Seu produto foi cadastrado e está disponível para venda.",
    });
    
    navigate('/my-products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/my-products')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos meus produtos
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Adicionar Novo Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: "Nome é obrigatório" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Papel reciclado A4" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: "Descrição é obrigatória" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva seu produto, origem dos materiais, processos sustentáveis..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="material"
                      rules={{ required: "Material é obrigatório" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Papel">Papel</SelectItem>
                              <SelectItem value="Plástico">Plástico</SelectItem>
                              <SelectItem value="Metal">Metal</SelectItem>
                              <SelectItem value="Vidro">Vidro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      rules={{ required: "Localização é obrigatória" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Localização</FormLabel>
                          <FormControl>
                            <Input placeholder="Cidade, Estado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="quantity"
                      rules={{ required: "Quantidade é obrigatória", min: { value: 1, message: "Mínimo 1" } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="unidade">Unidade</SelectItem>
                              <SelectItem value="kg">Kg</SelectItem>
                              <SelectItem value="litro">Litro</SelectItem>
                              <SelectItem value="metro">Metro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      rules={{ required: "Preço é obrigatório", min: { value: 0.01, message: "Preço deve ser maior que 0" } }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0.01"
                              {...field} 
                              onChange={e => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://exemplo.com/imagem.jpg"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Adicionar Produto
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddProduct;
