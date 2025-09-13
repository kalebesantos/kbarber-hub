import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Clock, MapPin, Phone, Save } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface BarbershopData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  opening_hours: Json;
  is_active: boolean;
}

interface BarbershopSettingsProps {
  barbershop: BarbershopData;
  onUpdate: () => void;
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda-feira' },
  { key: 'tuesday', label: 'Terça-feira' },
  { key: 'wednesday', label: 'Quarta-feira' },
  { key: 'thursday', label: 'Quinta-feira' },
  { key: 'friday', label: 'Sexta-feira' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

export const BarbershopSettings = ({ barbershop, onUpdate }: BarbershopSettingsProps) => {
  const [formData, setFormData] = useState({
    name: barbershop.name,
    description: barbershop.description || "",
    phone: barbershop.phone || "",
    address: barbershop.address || "",
    is_active: barbershop.is_active
  });

  const [openingHours, setOpeningHours] = useState<Record<string, any>>(
    (typeof barbershop.opening_hours === 'object' && barbershop.opening_hours !== null) 
      ? barbershop.opening_hours as Record<string, any>
      : {}
  );

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      name: barbershop.name,
      description: barbershop.description || "",
      phone: barbershop.phone || "",
      address: barbershop.address || "",
      is_active: barbershop.is_active
    });
    setOpeningHours(
      (typeof barbershop.opening_hours === 'object' && barbershop.opening_hours !== null) 
        ? barbershop.opening_hours as Record<string, any>
        : {}
    );
  }, [barbershop]);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('barbershops')
        .update({
          name: formData.name,
          description: formData.description,
          phone: formData.phone,
          address: formData.address,
          opening_hours: openingHours,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', barbershop.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!",
      });

      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (day: string, field: 'open' | 'close' | 'isOpen', value: string | boolean) => {
    setOpeningHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const getTimeValue = (day: string, field: 'open' | 'close') => {
    return openingHours[day]?.[field] || "";
  };

  const getIsOpen = (day: string) => {
    return openingHours[day]?.isOpen || false;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações da Barbearia</h2>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Barbearia *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Conte um pouco sobre sua barbearia..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Barbearia Ativa</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <div className="relative">
              <MapPin className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="pl-10"
                placeholder="Rua, número, bairro, cidade..."
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Horários de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map((day, index) => (
            <div key={day.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <Switch
                    checked={getIsOpen(day.key)}
                    onCheckedChange={(checked) => handleTimeChange(day.key, 'isOpen', checked)}
                  />
                  <Label className="min-w-[120px]">{day.label}</Label>
                  
                  {getIsOpen(day.key) && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={getTimeValue(day.key, 'open')}
                        onChange={(e) => handleTimeChange(day.key, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-muted-foreground">às</span>
                      <Input
                        type="time"
                        value={getTimeValue(day.key, 'close')}
                        onChange={(e) => handleTimeChange(day.key, 'close', e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                  
                  {!getIsOpen(day.key) && (
                    <span className="text-muted-foreground">Fechado</span>
                  )}
                </div>
              </div>
              {index < daysOfWeek.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug:</span>
            <span className="font-medium">{barbershop.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">URL da Barbearia:</span>
            <span className="font-medium text-primary">
              /{barbershop.slug}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">URL do Admin:</span>
            <span className="font-medium text-primary">
              /{barbershop.slug}/admin
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};