import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PremiumButton } from "@/components/ui/premium-button";
import { BookingModal } from "@/components/booking/BookingModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useBarbershop } from "@/hooks/use-barbershop";
import { getSubdomain } from "@/utils/subdomain";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Scissors, MapPin, Phone, Clock, User, LogOut, Trash2 } from "lucide-react";

export const BarbershopCustomer = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const { barbershop, getBarbershopBySlug, loading: barbershopLoading } = useBarbershop();
  const { toast } = useToast();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: ""
  });

  useEffect(() => {
    const subdomain = getSubdomain();
    if (subdomain) {
      getBarbershopBySlug(subdomain);
    } else {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (barbershop && !authLoading) {
      if (!user) {
        setShowAuth(true);
      } else {
        setShowAuth(false);
        fetchBarbershopData();
      }
    }
  }, [barbershop, user, authLoading]);

  const fetchBarbershopData = async () => {
    if (!barbershop) return;

    try {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .eq('is_active', true);

      // Fetch barbers
      const { data: barbersData } = await supabase
        .from('barbers')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .eq('is_active', true);

      // Fetch user's appointments
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileData) {
          const { data: appointmentsData } = await supabase
            .from('appointments')
            .select(`
              *,
              services(name),
              barbers(name)
            `)
            .eq('customer_id', profileData.id)
            .order('appointment_date', { ascending: true });

          setAppointments(appointmentsData || []);
        }
      }

      setServices(servicesData || []);
      setBarbers(barbersData || []);
    } catch (error) {
      console.error('Error fetching barbershop data:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const { error } = await signIn(authForm.email, authForm.password);
        if (error) throw error;
      } else {
        const { error } = await signUp(authForm.email, authForm.password, authForm.name);
        if (error) throw error;
        
        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar a conta"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowAuth(true);
    setAuthForm({ email: "", password: "", name: "" });
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    setBookingModalOpen(false);
    setSelectedService(null);
    // Refresh appointments
    fetchBarbershopData();
  };

  const deleteAppointment = async (appointmentId: string, serviceName: string) => {
    if (!confirm(`Tem certeza que deseja cancelar o agendamento do serviço "${serviceName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Agendamento cancelado",
        description: "Seu agendamento foi cancelado com sucesso.",
      });

      // Refresh appointments
      fetchBarbershopData();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    }
  };

  if (barbershopLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
        <Card className="bg-card/50 border-border">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Barbearia não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              A barbearia que você está procurando não existe ou foi desativada.
            </p>
            <PremiumButton variant="premium" onClick={() => navigate('/')}>
              Voltar ao Início
            </PremiumButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-dark">
        <Header barbershopName={barbershop.name} />
        
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md bg-card/50 border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Entre em sua conta para agendar serviços'
                  : 'Crie sua conta para começar a agendar'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={authForm.name}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Sua senha"
                    required
                  />
                </div>

                <PremiumButton type="submit" variant="premium" className="w-full">
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                </PremiumButton>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? 'Não tem conta? Crie uma' : 'Já tem conta? Entre'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header 
        barbershopName={barbershop.name}
        showAuth={false}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* User Info */}
          <Card className="mb-8 bg-card/50 border-border">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-premium">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Bem-vindo de volta!</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <PremiumButton variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </PremiumButton>
            </CardContent>
          </Card>

          {/* Barbershop Info */}
          <Card className="mb-8 bg-card/50 border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-premium">
                  <Scissors className="h-6 w-6 text-primary-foreground" />
                </div>
                {barbershop.name}
              </CardTitle>
              {barbershop.description && (
                <CardDescription>{barbershop.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbershop.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {barbershop.address}
                  </div>
                )}
                {barbershop.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {barbershop.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services & Booking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Nossos Serviços</CardTitle>
                <CardDescription>Escolha o serviço que deseja agendar</CardDescription>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum serviço disponível no momento
                  </p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service: any) => (
                      <div key={service.id} className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {service.duration_minutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            R$ {service.price.toFixed(2)}
                          </p>
                          <PremiumButton 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBookService(service)}
                          >
                            Agendar
                          </PremiumButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
                <CardDescription>Veja seus próximos agendamentos</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Agende seu primeiro serviço acima
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                     {appointments.map((appointment: any) => (
                      <div key={appointment.id} className="p-4 rounded-lg bg-muted/50 border border-border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{appointment.services?.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Com {appointment.barbers?.name}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(appointment.appointment_date).toLocaleDateString()} - {appointment.start_time}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appointment.status === 'scheduled' ? 'bg-primary/20 text-primary' :
                              appointment.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                              appointment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {appointment.status === 'scheduled' ? 'Agendado' :
                               appointment.status === 'confirmed' ? 'Confirmado' :
                               appointment.status === 'completed' ? 'Concluído' :
                               'Cancelado'
                              }
                            </span>
                            {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteAppointment(appointment.id, appointment.services?.name || 'serviço')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                     ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          barbershopId={barbershop?.id || ""}
        />
      )}

      <Footer />
    </div>
  );
};