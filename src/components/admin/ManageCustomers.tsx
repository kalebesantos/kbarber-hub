import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Phone, Mail, Calendar, Scissors } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  appointmentCount?: number;
  lastAppointment?: string;
  totalSpent?: number;
}

interface ManageCustomersProps {
  barbershopId: string;
}

export const ManageCustomers = ({ barbershopId }: ManageCustomersProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [barbershopId]);

  const fetchCustomers = async () => {
    try {
      // Buscar clientes que fizeram agendamentos nesta barbearia
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          customer_id,
          appointment_date,
          service:services(price),
          customer:profiles!appointments_customer_id_fkey(id, user_id, name, phone, avatar_url, created_at)
        `)
        .eq('barbershop_id', barbershopId);

      if (appointmentsError) throw appointmentsError;

      // Agrupar dados por cliente
      const customerMap = new Map();

      appointments?.forEach(appointment => {
        const customer = appointment.customer;
        if (!customer) return;

        const customerId = customer.id;
        
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customer.id,
            user_id: customer.user_id,
            name: customer.name || 'Nome não disponível',
            phone: customer.phone,
            avatar_url: customer.avatar_url,
            created_at: customer.created_at,
            appointmentCount: 0,
            lastAppointment: null,
            totalSpent: 0
          });
        }

        const customerData = customerMap.get(customerId);
        customerData.appointmentCount++;
        
        // Verificar data mais recente
        if (!customerData.lastAppointment || appointment.appointment_date > customerData.lastAppointment) {
          customerData.lastAppointment = appointment.appointment_date;
        }
        
        // Somar valor total gasto
        if (appointment.service?.price) {
          customerData.totalSpent += appointment.service.price;
        }
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
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
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-muted-foreground">
            {customers.length} cliente{customers.length !== 1 ? 's' : ''} cadastrado{customers.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Buscar Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              placeholder="Nome do cliente ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, customer) => sum + (customer.appointmentCount || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total de Agendamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {formatPrice(customers.reduce((sum, customer) => sum + (customer.totalSpent || 0), 0))}
                </p>
                <p className="text-sm text-muted-foreground">Receita Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {customers.length === 0 
                  ? "Nenhum cliente encontrado" 
                  : "Nenhum cliente encontrado para os filtros aplicados"
                }
              </h3>
              <p className="text-muted-foreground">
                {customers.length === 0 
                  ? "Os clientes aparecerão aqui quando fizerem agendamentos na sua barbearia."
                  : "Tente ajustar o termo de busca."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Cliente desde {formatDate(customer.created_at)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.phone && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{customer.appointmentCount}</p>
                    <p className="text-xs text-muted-foreground">Agendamentos</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <p className="text-lg font-bold">{formatPrice(customer.totalSpent || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Gasto</p>
                  </div>
                </div>
                
                {customer.lastAppointment && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Último agendamento: {formatDate(customer.lastAppointment)}
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