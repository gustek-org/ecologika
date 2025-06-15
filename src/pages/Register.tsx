
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CountrySelectImproved } from '@/components/ui/country-select-improved';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useInterests } from '@/hooks/useInterests';
import { validateNifCnpj, getInterestLabel, categorizeInterests } from '@/utils/validation';
import Header from '@/components/layout/Header';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyRole: '',
    companyWebsite: '',
    nifCnpj: '',
    address: '',
    country: '',
    phone: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    aboutCompany: '',
    selectedInterests: [] as string[], // Array de IDs dos interesses
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { interests, loading: interestsLoading } = useInterests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (formData.email !== formData.confirmEmail) {
      toast({
        title: t('common.error'),
        description: 'Os emails não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: t('common.error'),
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateNifCnpj(formData.nifCnpj)) {
      toast({
        title: t('common.error'),
        description: 'NIF/CNPJ inválido. Use o formato: 12.345.678/0001-90 (CNPJ) ou 123456789 (NIF).',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.acceptTerms) {
      toast({
        title: t('common.error'),
        description: 'Você deve aceitar os termos e condições.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signup(formData.email, formData.password, {
        name: `${formData.firstName} ${formData.lastName}`,
        company: formData.companyWebsite,
        location: `${formData.address}, ${formData.country}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyRole: formData.companyRole,
        companyWebsite: formData.companyWebsite,
        nifCnpj: formData.nifCnpj,
        address: formData.address,
        country: formData.country,
        city: '',
        phone: formData.phone,
        aboutCompany: formData.aboutCompany,
        interessesIds: formData.selectedInterests.join(',')
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: t('common.error'),
            description: 'Este email já está cadastrado. Tente fazer login.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('common.error'),
            description: error.message || 'Erro ao criar conta.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('common.success'),
          description: 'Conta criada com sucesso! Verifique seu email para confirmar a conta.',
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Erro ao criar conta. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestToggle = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interestId)
        ? prev.selectedInterests.filter(id => id !== interestId)
        : [...prev.selectedInterests, interestId]
    }));
  };

  const selectAllInterests = (categoryInterests: Array<{id: string, key: string}>) => {
    const categoryIds = categoryInterests.map(i => i.id);
    const allSelected = categoryIds.every(id => formData.selectedInterests.includes(id));
    
    if (allSelected) {
      // Deselect all
      setFormData(prev => ({
        ...prev,
        selectedInterests: prev.selectedInterests.filter(id => !categoryIds.includes(id))
      }));
    } else {
      // Select all
      setFormData(prev => ({
        ...prev,
        selectedInterests: [...new Set([...prev.selectedInterests, ...categoryIds])]
      }));
    }
  };

  if (interestsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-lg">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  const { residuos, projetosCertificados, projetosApoiados } = categorizeInterests(interests);

  const renderInterestSection = (
    title: string, 
    categoryInterests: Array<{id: string, key: string}>, 
    sectionKey: string
  ) => (
    <div className="border rounded-lg p-4" key={sectionKey}>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-semibold">{title}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => selectAllInterests(categoryInterests)}
        >
          SELECIONAR TODOS
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryInterests.map((interest) => (
          <div key={interest.id} className="flex items-center space-x-2">
            <Checkbox
              id={`interest-${interest.id}`}
              checked={formData.selectedInterests.includes(interest.id)}
              onCheckedChange={() => handleInterestToggle(interest.id)}
            />
            <Label htmlFor={`interest-${interest.id}`}>
              {getInterestLabel(interest.key)}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Criar Conta
              </CardTitle>
              <p className="text-gray-600">Preencha suas informações para se registrar</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Primeiro Nome *</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Segundo Nome *</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Informações da Empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informações da Empresa</h3>
                  
                  <div>
                    <Label htmlFor="companyRole">Função na Empresa *</Label>
                    <Input
                      id="companyRole"
                      type="text"
                      value={formData.companyRole}
                      onChange={(e) => handleInputChange('companyRole', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyWebsite">Site da Empresa *</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="nifCnpj">NIF/CNPJ *</Label>
                    <Input
                      id="nifCnpj"
                      type="text"
                      value={formData.nifCnpj}
                      onChange={(e) => handleInputChange('nifCnpj', e.target.value)}
                      placeholder="12.345.678/0001-90 ou 123456789"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Localização */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Localização</h3>
                  
                  <div>
                    <Label htmlFor="address">Morada *</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <CountrySelectImproved
                        label="País *"
                        value={formData.country}
                        onValueChange={(value) => handleInputChange('country', value)}
                        placeholder="Selecione seu país"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Acesso */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acesso</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Introduzir Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                      <Input
                        id="confirmEmail"
                        type="email"
                        value={formData.confirmEmail}
                        onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Introduzir Palavra-Passe *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        required
                        className="mt-1"
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Palavra-Passe *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Marketing */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Marketing</h3>
                  
                  <div>
                    <Label htmlFor="aboutCompany">Onde é que ouviu falar de nós?</Label>
                    <Input
                      id="aboutCompany"
                      type="text"
                      value={formData.aboutCompany}
                      onChange={(e) => handleInputChange('aboutCompany', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Materiais de Interesse */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Materiais de Interesse</h3>
                  
                  {renderInterestSection(
                    'Materiais de Interesse - Resíduos',
                    residuos,
                    'residuos'
                  )}

                  {renderInterestSection(
                    'Materiais de Interesse - Resíduos Projetos certificados (créditos de carbono)',
                    projetosCertificados,
                    'projetos-certificados'
                  )}

                  {renderInterestSection(
                    'Projetos apoiados (investimento)',
                    projetosApoiados,
                    'projetos-apoiados'
                  )}
                </div>

                {/* Aceitar Termos */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked)}
                    required
                  />
                  <Label htmlFor="acceptTerms">Aceito os Termos e condições e Política de privacidade *</Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.loading') : 'Criar Conta'}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                    {t('nav.login')}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;
