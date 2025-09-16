import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Scissors, Filter, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  customer_id: string;
  service_id: string;
  barber_id: string;
  barbershop_id: string;
  customer?: {
    name: string;
    phone?: string;
  };
  service?: {
    name: string;
    price: number;
  };
  barber?: {
    name: string;
  };
}

interface ManageAppointmentsProps {
  barbershopId: string;
}

const statusConfig = {
  scheduled: { label: "Agendado", color: "bg-blue-50 text-blue-700" },
  confirmed: { label: "Confirmado", color: "bg-green-50 text-green-700" },
  in_progress: { label: "Em Andamento", color: "bg-yellow-50 text-yellow-700" },
  completed: { label: "Concluído", color: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700" },
  no_show: { label: "Não Compareceu", color: "bg-gray-50 text-gray-700" }
};

export const ManageAppointments = ({ barbershopId }: ManageAppointmentsProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, [barbershopId]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customer:profiles!appointments_customer_id_fkey(name, phone),
          service:services(name, price),
          barber:barbers(name)
        `)
        .eq('barbershop_id', barbershopId)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      const appointmentsWithCustomer = data?.map(appointment => ({
        ...appointment,
        customer: appointment.customer ? {
          name: appointment.customer.name || 'Nome não disponível',
          phone: appointment.customer.phone
        } : undefined
      })) || [];

      setAppointments(appointmentsWithCustomer);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do agendamento atualizado!",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const deleteAppointment = async (id: string, customerName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o agendamento de ${customerName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento excluído com sucesso!",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive",
      });
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = searchTerm === "" || 
      appointment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.barber?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    const matchesDate = dateFilter === "" || appointment.appointment_date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Agendamentos</h2>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome do cliente, serviço ou barbeiro..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-muted-foreground">
                {appointments.length === 0 
                  ? "Não há agendamentos cadastrados ainda."
                  : "Tente ajustar os filtros para encontrar agendamentos."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.customer?.name || 'Cliente não identificado'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Scissors className="h-4 w-4 mr-1" />
                          {appointment.service?.name}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {appointment.barber?.name}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(appointment.appointment_date)} às {formatTime(appointment.start_time)}
                        </div>
                      </div>
                      {appointment.service?.price && (
                        <div className="text-sm font-medium text-primary mt-1">
                          {formatPrice(appointment.service.price)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Badge 
                      variant="outline" 
                      className={statusConfig[appointment.status as keyof typeof statusConfig]?.color || "bg-gray-50 text-gray-700"}
                    >
                      {statusConfig[appointment.status as keyof typeof statusConfig]?.label || appointment.status}
                    </Badge>

                    <Select
                      value={appointment.status}
                      onValueChange={(status) => updateAppointmentStatus(appointment.id, status)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAppointment(appointment.id, appointment.customer?.name || 'Cliente')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <strong>Observações:</strong> {appointment.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};