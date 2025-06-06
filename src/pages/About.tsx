
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const { t } = useLanguage();

  const team = [
    {
      name: 'Ana Silva',
      role: 'CEO & Fundadora',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1f3?w=400&h=400&fit=crop&crop=face',
      description: 'Especialista em sustentabilidade com 15 anos de experiência'
    },
    {
      name: 'Carlos Santos',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      description: 'Desenvolvedor com foco em tecnologias verdes'
    },
    {
      name: 'Marina Costa',
      role: 'Diretora de Operações',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      description: 'Especialista em logística e economia circular'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('about.title')}
          </h1>
          <div className="max-w-3xl mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&h=400&fit=crop" 
              alt="Nossa equipe" 
              className="w-full h-64 object-cover rounded-lg shadow-lg mb-8"
            />
          </div>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('about.mission')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('about.mission.text')}
              </p>
              <p className="text-gray-600 mb-6">
                Acreditamos que a tecnologia pode ser uma força poderosa para o bem, conectando pessoas 
                e empresas que compartilham valores sustentáveis. Nossa plataforma não é apenas um 
                marketplace, mas uma comunidade dedicada à preservação do meio ambiente.
              </p>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2020</div>
                  <div className="text-sm text-gray-600">Fundação</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Suporte</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=600&h=400&fit=crop" 
                alt="Sustentabilidade" 
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold mb-4">Sustentabilidade</h3>
                <p className="text-gray-600">
                  Comprometidos com práticas que preservam o meio ambiente para as futuras gerações.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-4">Transparência</h3>
                <p className="text-gray-600">
                  Operamos com total transparência em todas as nossas transações e processos.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-semibold mb-4">Inovação</h3>
                <p className="text-gray-600">
                  Utilizamos tecnologia de ponta para criar soluções sustentáveis e eficientes.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Nossa Equipe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-green-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
