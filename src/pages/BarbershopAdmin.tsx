import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBarbershop } from "@/hooks/use-barbershop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Scissors, 
  Calendar, 
  Clock, 
  Settings, 
  BarChart3,
  UserPlus,
  Plus,
  Edit,
  Trash2
} from "lucide-react";

// Admin Components
import { ManageBarbers } from "@/components/admin/ManageBarbers";
import { ManageServices } from "@/components/admin/ManageServices";
import { ManageAppointments } from "@/components/admin/ManageAppointments";
import { ManageCustomers } from "@/components/admin/ManageCustomers";
import { BarbershopSettings } from "@/components/admin/BarbershopSettings";

export const BarbershopAdmin = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { barbershop, getBarbershopBySlug } = useBarbershop();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (slug) {
      getBarbershopBySlug(slug);
    }
    setLoading(false);
    
    // Set active tab based on URL
    const path = location.pathname.split('/').pop();
    if (path && path !== slug && path !== 'admin') {
      setActiveTab(path);
    }
  }, [slug, location.pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Barbearia não encontrada</h1>
          <Button asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Painel Admin - {barbershop.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie sua barbearia de forma completa
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {barbershop.is_active ? "Ativa" : "Inativa"}
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="appointments">Agenda</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Agendamentos Hoje
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    +2 desde ontem
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Barbeiros Ativos
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Todos disponíveis
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Receita do Mês
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 2.450</div>
                  <p className="text-xs text-muted-foreground">
                    +15% desde o mês passado
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes Cadastrados
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87</div>
                  <p className="text-xs text-muted-foreground">
                    +5 esta semana
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>
                  Agendamentos para as próximas horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Scissors className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">João Silva</p>
                        <p className="text-sm text-muted-foreground">Corte + Barba</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">14:30</p>
                        <p className="text-sm text-muted-foreground">Pedro Santos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Barbeiros */}
          <TabsContent value="barbers" className="space-y-6">
            <ManageBarbers barbershopId={barbershop.id} />
          </TabsContent>

          {/* Serviços */}
          <TabsContent value="services" className="space-y-6">
            <ManageServices barbershopId={barbershop.id} />
          </TabsContent>

          {/* Agenda */}
          <TabsContent value="appointments" className="space-y-6">
            <ManageAppointments barbershopId={barbershop.id} />
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="customers" className="space-y-6">
            <ManageCustomers barbershopId={barbershop.id} />
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <BarbershopSettings 
              barbershop={barbershop} 
              onUpdate={() => getBarbershopBySlug(slug!)}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};