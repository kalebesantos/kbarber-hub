import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, User, CalendarDays } from "lucide-react";
import { format, addDays, isSameDay, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: any;
  barbershopId: string;
}

interface Barber {
  id: string;
  name: string;
  avatar_url?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const BookingModal = ({ isOpen, onClose, service, barbershopId }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedBarber, setSelectedBarber] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (isOpen && barbershopId) {
      fetchBarbers();
    }
  }, [isOpen, barbershopId]);

  useEffect(() => {
    if (selectedDate && selectedBarber) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedBarber]);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('id, name, avatar_url')
        .eq('barbershop_id', barbershopId)
        .eq('is_active', true);

      if (error) throw error;
      setBarbers(data || []);
      
      if (data && data.length > 0) {
        setSelectedBarber(data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDate || !selectedBarber) return;

    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      // Buscar agendamentos existentes para o barbeiro na data selecionada
      const { data: existingAppointments, error } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('barber_id', selectedBarber)
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled');

      if (error) throw error;

      // Gerar slots de horário (8h às 18h, de 30 em 30 minutos)
      const slots: TimeSlot[] = [];
      for (let hour = 8; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          // Verificar se o horário está ocupado
          const isOccupied = existingAppointments?.some(apt => {
            const startTime = apt.start_time;
            const endTime = apt.end_time;
            return timeStr >= startTime && timeStr < endTime;
          });

          slots.push({
            time: timeStr,
            available: !isOccupied
          });
        }
      }

      setTimeSlots(slots);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  const handleBooking = async () => {
    if (!user || !selectedDate || !selectedBarber || !selectedTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);
    try {
      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const endTime = calculateEndTime(selectedTime, service.duration_minutes);

      const { error } = await supabase
        .from('appointments')
        .insert({
          barbershop_id: barbershopId,
          customer_id: profile.id,
          service_id: service.id,
          barber_id: selectedBarber,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedTime,
          end_time: endTime,
          status: 'scheduled'
        });

      if (error) throw error;

      toast({
        title: "Agendamento realizado!",
        description: `Seu agendamento foi marcado para ${format(selectedDate, "dd 'de' MMMM", { locale: ptBR })} às ${selectedTime}.`,
      });

      onClose();
      // Resetar estados
      setSelectedTime("");
      setSelectedDate(new Date());
    } catch (error: any) {
      console.error('Erro ao agendar:', error);
      toast({
        title: "Erro ao agendar",
        description: error.message || "Não foi possível realizar o agendamento.",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return date < startOfDay(new Date()) || date > addDays(new Date(), 30);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agendar: {service?.name}</DialogTitle>
          <DialogDescription>
            Selecione a data, barbeiro e horário para seu agendamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendário */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <CalendarDays className="h-5 w-5 mr-2" />
              Escolha a data
            </h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={isDateDisabled}
              locale={ptBR}
              className="rounded-md border"
            />
          </div>

          {/* Barbeiros e Horários */}
          <div className="space-y-4">
            {/* Barbeiros */}
            <div>
              <h3 className="font-semibold flex items-center mb-3">
                <User className="h-5 w-5 mr-2" />
                Escolha o barbeiro
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {barbers.map((barber) => (
                  <Card 
                    key={barber.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedBarber === barber.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBarber(barber.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {barber.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{barber.name}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Horários */}
            {selectedBarber && selectedDate && (
              <div>
                <h3 className="font-semibold flex items-center mb-3">
                  <Clock className="h-5 w-5 mr-2" />
                  Escolha o horário
                </h3>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className="justify-center"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumo e Confirmação */}
        {selectedDate && selectedBarber && selectedTime && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Resumo do Agendamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Serviço:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span className="font-medium">
                    {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Barbeiro:</span>
                  <span className="font-medium">
                    {barbers.find(b => b.id === selectedBarber)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duração:</span>
                  <span className="font-medium">{service.duration_minutes} min</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold text-primary">
                    R$ {service.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleBooking}
            disabled={!selectedDate || !selectedBarber || !selectedTime || bookingLoading}
          >
            {bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};