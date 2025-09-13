import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PremiumButton } from "@/components/ui/premium-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Users, Calendar, BarChart3, Clock, Shield } from "lucide-react";

export const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamento com controle de horários e disponibilidade"
    },
    {
      icon: Users,
      title: "Gestão de Barbeiros",
      description: "Gerencie sua equipe, horários e especialidades de cada profissional"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Acompanhe o desempenho da sua barbearia com relatórios completos"
    },
    {
      icon: Clock,
      title: "Controle de Horários",
      description: "Defina horários de funcionamento e bloqueie períodos específicos"
    },
    {
      icon: Shield,
      title: "Seguro e Confiável",
      description: "Seus dados protegidos com a mais alta tecnologia de segurança"
    },
    {
      icon: Scissors,
      title: "Especializado",
      description: "Criado especialmente para barbearias modernas e tradicionais"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header showAuth />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-premium opacity-5"></div>
          <div className={`container mx-auto text-center relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="gradient-premium">BarberHub</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                O sistema completo de gestão para sua barbearia
              </p>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Gerencie agendamentos, barbeiros, serviços e clientes com facilidade. 
                Uma solução moderna para barbearias que querem crescer.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PremiumButton 
                  variant="premium" 
                  size="xl"
                  onClick={() => window.location.href = '/super-admin'}
                >
                  Começar Agora
                </PremiumButton>
                <PremiumButton 
                  variant="luxury" 
                  size="xl"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Funcionalidades
                </PremiumButton>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Tudo que sua barbearia precisa
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Funcionalidades completas para modernizar e otimizar a gestão da sua barbearia
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className={`bg-card/50 border-border hover:bg-card/80 transition-all duration-300 hover:shadow-premium transform hover:-translate-y-2 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: isVisible ? 'slideUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 rounded-lg bg-gradient-premium w-fit mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-3xl mx-auto p-8 rounded-xl bg-gradient-dark border border-primary/20">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto para revolucionar sua barbearia?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Junte-se a centenas de barbearias que já modernizaram sua gestão com o BarberHub
              </p>
              <PremiumButton 
                variant="premium" 
                size="xl"
                onClick={() => window.location.href = '/super-admin'}
              >
                Criar Minha Barbearia
              </PremiumButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};