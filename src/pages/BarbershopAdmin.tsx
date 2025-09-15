import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useBarbershop } from "@/hooks/use-barbershop";
import { supabase } from "@/integrations/supabase/client";
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
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Admin Components
import { ManageBarbers } from "@/components/admin/ManageBarbers";
import { ManageServices } from "@/components/admin/ManageServices";
import { ManageAppointments } from "@/components/admin/ManageAppointments";
import { ManageCustomers } from "@/components/admin/ManageCustomers";
import { BarbershopSettings } from "@/components/admin/BarbershopSettings";

interface DashboardStats {
  appointmentsToday: number;
  activeBarbers: number;
  monthlyRevenue: number;
  totalCustomers: number;
  upcomingAppointments: any[];
}

export const BarbershopAdmin = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { barbershop, getBarbershopBySlug } = useBarbershop();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    appointmentsToday: 0,
    activeBarbers: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    upcomingAppointments: []
  });

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

  useEffect(() => {
    if (barbershop?.id) {
      fetchDashboardStats();
    }
  }, [barbershop?.id]);

  const fetchDashboardStats = async () => {
    if (!barbershop?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

      // Agendamentos de hoje
      const { data: todayAppointments } = await supabase
        .from('appointments')
        .select('id')
        .eq('barbershop_id', barbershop.id)
        .eq('appointment_date', today);

      // Barbeiros ativos
      const { data: activeBarbers } = await supabase
        .from('barbers')
        .select('id')
        .eq('barbershop_id', barbershop.id)
        .eq('is_active', true);

      // Receita do mês
      const { data: monthlyAppointments } = await supabase
        .from('appointments')
        .select('service:services(price)')
        .eq('barbershop_id', barbershop.id)
        .gte('appointment_date', startOfMonth)
        .lte('appointment_date', endOfMonth)
        .eq('status', 'completed');

      const monthlyRevenue = monthlyAppointments?.reduce((sum, appointment) => {
        return sum + (appointment.service?.price || 0);
      }, 0) || 0;

      // Total de clientes únicos
      const { data: uniqueCustomers } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('barbershop_id', barbershop.id);

      const totalCustomers = uniqueCustomers ? new Set(uniqueCustomers.map(a => a.customer_id)).size : 0;

      // Próximos agendamentos
      const { data: upcomingAppointments } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          customer:profiles!customer_id(name),
          service:services(name),
          barber:barbers(name)
        `)
        .eq('barbershop_id', barbershop.id)
        .gte('appointment_date', today)
        .order('appointment_date')
        .order('start_time')
        .limit(3);

      setDashboardStats({
        appointmentsToday: todayAppointments?.length || 0,
        activeBarbers: activeBarbers?.length || 0,
        monthlyRevenue,
        totalCustomers,
        upcomingAppointments: upcomingAppointments || []
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

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
                  <div className="text-2xl font-bold">{dashboardStats.appointmentsToday}</div>
                  <p className="text-xs text-muted-foreground">
                    Para o dia de hoje
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
                  <div className="text-2xl font-bold">{dashboardStats.activeBarbers}</div>
                  <p className="text-xs text-muted-foreground">
                    Disponíveis para agendamento
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
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(dashboardStats.monthlyRevenue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Serviços completados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clientes Únicos
                  </CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.totalCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Total de clientes
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
                  {dashboardStats.upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Nenhum agendamento próximo</p>
                    </div>
                  ) : (
                    dashboardStats.upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Scissors className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{appointment.customer?.name || 'Cliente'}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service?.name || 'Serviço'}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {appointment.start_time ? format(new Date(`2000-01-01T${appointment.start_time}`), 'HH:mm') : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">{appointment.barber?.name || 'Barbeiro'}</p>
                        </div>
                      </div>
                    ))
                  )}
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