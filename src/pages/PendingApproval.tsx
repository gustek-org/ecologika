
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PendingApproval = () => {
  const { logout, profile } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ecologika-light to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-yellow-100 rounded-full w-fit">
                <Clock className="h-12 w-12 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cadastro em Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-gray-700">
                  Obrigado por se cadastrar na Ecologika!
                </p>
                <p className="text-gray-600">
                  Seus dados estão sendo analisados pela nossa equipe. Você receberá um e-mail 
                  de confirmação assim que seu cadastro for aprovado.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Mail className="h-5 w-5" />
                    <span className="font-medium">E-mail cadastrado:</span>
                  </div>
                  <p className="text-blue-600 font-semibold mt-1">
                    {profile?.email}
                  </p>
                </div>
                
                <div className="text-sm text-gray-500 space-y-2">
                  <p>• O processo de análise pode levar até 24 horas</p>
                  <p>• Verifique sua caixa de entrada e spam regularmente</p>
                  <p>• Em caso de dúvidas, entre em contato conosco</p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full"
                >
                  Fazer Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PendingApproval;
