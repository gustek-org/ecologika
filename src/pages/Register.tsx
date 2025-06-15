
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
    materialsOfInterest: {
      residuos: {
        metal: false,
        borracha: false,
        texteis: false,
        plastico: false,
        oleo: false
      },
      residuosProjetosCertificados: {
        florestalUsoSolo: false,
        energiaRenovavel: false,
        eficienciaEnergetica: false,
        residuosBiomassa: false,
        industriaProcessos: false
      },
      projetosApoiados: {
        florestalUsoSolo: false,
        energiaRenovavel: false,
        eficienciaEnergetica: false,
        residuosBiomassa: false,
        industriaProcessos: false
      }
    },
    acceptTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        country: formData.country,
        city: '',
        address: formData.address,
        // Additional metadata
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyRole: formData.companyRole,
        companyWebsite: formData.companyWebsite,
        nifCnpj: formData.nifCnpj,
        phone: formData.phone,
        aboutCompany: formData.aboutCompany,
        materialsOfInterest: formData.materialsOfInterest
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
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev.materialsOfInterest],
          [child]: subchild ? {
            ...prev[parent as keyof typeof prev.materialsOfInterest][child],
            [subchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const selectAllMaterials = (category: string) => {
    const allSelected = Object.values(formData.materialsOfInterest[category as keyof typeof formData.materialsOfInterest]).every(Boolean);
    const newValue = !allSelected;
    
    const updatedCategory = Object.keys(formData.materialsOfInterest[category as keyof typeof formData.materialsOfInterest]).reduce((acc, key) => {
      acc[key] = newValue;
      return acc;
    }, {} as any);

    setFormData(prev => ({
      ...prev,
      materialsOfInterest: {
        ...prev.materialsOfInterest,
        [category]: updatedCategory
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Título
              </CardTitle>
              <p className="text-gray-600">#subtítulo</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
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

                {/* Função na Empresa */}
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

                {/* Site da Empresa */}
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

                {/* NIF/CNPJ */}
                <div>
                  <Label htmlFor="nifCnpj">NIF/CNPJ *</Label>
                  <Input
                    id="nifCnpj"
                    type="text"
                    value={formData.nifCnpj}
                    onChange={(e) => handleInputChange('nifCnpj', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                {/* Morada */}
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

                {/* País e Telefone */}
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

                {/* Email */}
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

                {/* Senha */}
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

                {/* Onde é que ouviu falar de nós? */}
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

                {/* Materiais de Interesse - Resíduos */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Materiais de Interesse - Resíduos</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllMaterials('residuos')}
                    >
                      SELECIONAR TODOS
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metal"
                        checked={formData.materialsOfInterest.residuos.metal}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuos.metal', checked)}
                      />
                      <Label htmlFor="metal">Metal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="borracha"
                        checked={formData.materialsOfInterest.residuos.borracha}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuos.borracha', checked)}
                      />
                      <Label htmlFor="borracha">Borracha</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="texteis"
                        checked={formData.materialsOfInterest.residuos.texteis}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuos.texteis', checked)}
                      />
                      <Label htmlFor="texteis">Têxteis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="plastico"
                        checked={formData.materialsOfInterest.residuos.plastico}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuos.plastico', checked)}
                      />
                      <Label htmlFor="plastico">Plástico</Label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="oleo"
                        checked={formData.materialsOfInterest.residuos.oleo}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuos.oleo', checked)}
                      />
                      <Label htmlFor="oleo">Óleo (OAU)</Label>
                    </div>
                  </div>
                </div>

                {/* Materiais de Interesse - Resíduos Projetos certificados */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Materiais de Interesse - Resíduos Projetos certificados (créditos de carbono)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllMaterials('residuosProjetosCertificados')}
                    >
                      SELECIONAR TODOS
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="florestalUsoSolo1"
                        checked={formData.materialsOfInterest.residuosProjetosCertificados.florestalUsoSolo}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuosProjetosCertificados.florestalUsoSolo', checked)}
                      />
                      <Label htmlFor="florestalUsoSolo1">Florestal e Uso do Solo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="energiaRenovavel1"
                        checked={formData.materialsOfInterest.residuosProjetosCertificados.energiaRenovavel}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuosProjetosCertificados.energiaRenovavel', checked)}
                      />
                      <Label htmlFor="energiaRenovavel1">Energia Renovável</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eficienciaEnergetica1"
                        checked={formData.materialsOfInterest.residuosProjetosCertificados.eficienciaEnergetica}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuosProjetosCertificados.eficienciaEnergetica', checked)}
                      />
                      <Label htmlFor="eficienciaEnergetica1">Eficiência Energética e Substituição de Combustíveis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="residuosBiomassa1"
                        checked={formData.materialsOfInterest.residuosProjetosCertificados.residuosBiomassa}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuosProjetosCertificados.residuosBiomassa', checked)}
                      />
                      <Label htmlFor="residuosBiomassa1">Resíduos e Biomassa</Label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="industriaProcessos1"
                        checked={formData.materialsOfInterest.residuosProjetosCertificados.industriaProcessos}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.residuosProjetosCertificados.industriaProcessos', checked)}
                      />
                      <Label htmlFor="industriaProcessos1">Indústria e Processos</Label>
                    </div>
                  </div>
                </div>

                {/* Projetos apoiados (investimento) */}
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-base font-semibold">Projetos apoiados (investimento)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => selectAllMaterials('projetosApoiados')}
                    >
                      SELECIONAR TODOS
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="florestalUsoSolo2"
                        checked={formData.materialsOfInterest.projetosApoiados.florestalUsoSolo}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.projetosApoiados.florestalUsoSolo', checked)}
                      />
                      <Label htmlFor="florestalUsoSolo2">Florestal e Uso do Solo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="energiaRenovavel2"
                        checked={formData.materialsOfInterest.projetosApoiados.energiaRenovavel}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.projetosApoiados.energiaRenovavel', checked)}
                      />
                      <Label htmlFor="energiaRenovavel2">Energia Renovável</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eficienciaEnergetica2"
                        checked={formData.materialsOfInterest.projetosApoiados.eficienciaEnergetica}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.projetosApoiados.eficienciaEnergetica', checked)}
                      />
                      <Label htmlFor="eficienciaEnergetica2">Eficiência Energética e Substituição de Combustíveis</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="residuosBiomassa2"
                        checked={formData.materialsOfInterest.projetosApoiados.residuosBiomassa}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.projetosApoiados.residuosBiomassa', checked)}
                      />
                      <Label htmlFor="residuosBiomassa2">Resíduos e Biomassa</Label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="industriaProcessos2"
                        checked={formData.materialsOfInterest.projetosApoiados.industriaProcessos}
                        onCheckedChange={(checked) => handleInputChange('materialsOfInterest.projetosApoiados.industriaProcessos', checked)}
                      />
                      <Label htmlFor="industriaProcessos2">Indústria e Processos</Label>
                    </div>
                  </div>
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
