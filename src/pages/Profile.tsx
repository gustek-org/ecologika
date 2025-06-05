
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Profile = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    company: profile?.company || '',
    location: profile?.location || '',
    type: profile?.type || 'buyer'
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleSave = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          company: formData.company,
          location: formData.location,
          type: formData.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
          variant: "default",
        });
        setIsEditing(false);
        // Refresh the page to get updated profile data
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      company: profile?.company || '',
      location: profile?.location || '',
      type: profile?.type || 'buyer'
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800">Meu Perfil</CardTitle>
              <CardDescription>
                Gerencie suas informações pessoais e preferências da conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Account Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-800">Status da Conta</h3>
                  <p className="text-sm text-gray-600">
                    {profile?.is_approved ? 'Conta aprovada' : 'Pendente de aprovação'}
                  </p>
                </div>
                <Badge variant={profile?.is_approved ? "default" : "secondary"}>
                  {profile?.is_approved ? 'Aprovado' : 'Pendente'}
                </Badge>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Tipo de Conta</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: 'buyer' | 'seller') => 
                        setFormData({ ...formData, type: value })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Comprador</SelectItem>
                        <SelectItem value="seller">Vendedor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {/* Profile Statistics */}
              {profile?.type === 'buyer' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Estatísticas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800">Produtos Salvos</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {profile?.saved_products?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                    Editar Perfil
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleSave} 
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
