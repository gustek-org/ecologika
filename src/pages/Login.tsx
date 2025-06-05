
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { login, resetPassword } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: t('common.error'),
            description: 'Por favor, confirme seu email antes de fazer login.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            title: t('common.error'),
            description: 'Email ou senha incorretos.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('common.error'),
            description: error.message || 'Erro ao fazer login.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('common.success'),
          description: 'Login realizado com sucesso!',
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Erro ao fazer login. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    try {
      const { error } = await resetPassword(resetEmail);
      if (error) {
        toast({
          title: t('common.error'),
          description: error.message || 'Erro ao enviar email de recuperação.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('common.success'),
          description: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
        });
        setShowForgotPassword(false);
        setResetEmail('');
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Erro ao enviar email de recuperação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {showForgotPassword ? 'Recuperar Senha' : t('nav.login')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail">{t('auth.email')}</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="seu@email.com"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isResetting}
                  >
                    {isResetting ? t('common.loading') : 'Enviar Email de Recuperação'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="mt-1"
                      placeholder="••••••••"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? t('common.loading') : t('auth.login')}
                  </Button>
                </form>
              )}
              
              {!showForgotPassword && (
                <div className="mt-6 text-center space-y-2">
                  <button 
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    {t('auth.forgot_password')}
                  </button>
                  <div className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                      {t('nav.register')}
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
