
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileSettings = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    company: profile?.company || '',
    location: profile?.location || ''
  });

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
      location: profile?.location || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de perfil</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div>
            <h4 className="font-medium text-gray-800">Status da Conta</h4>
            <p className="text-sm text-gray-600">
              {profile?.is_approved ? 'Conta aprovada' : 'Pendente de aprovação'}
            </p>
          </div>
          <Badge variant={profile?.is_approved ? "default" : "secondary"}>
            {profile?.is_approved ? 'Aprovado' : 'Pendente'}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
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
            <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
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
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
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
    </div>
  );
};

export default ProfileSettings;
