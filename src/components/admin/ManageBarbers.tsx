import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Users, Phone, Mail } from "lucide-react";

interface Barber {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  is_active: boolean;
  barbershop_id: string;
}

interface ManageBarbersProps {
  barbershopId: string;
}

export const ManageBarbers = ({ barbershopId }: ManageBarbersProps) => {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    is_active: true
  });

  useEffect(() => {
    fetchBarbers();
  }, [barbershopId]);

  const fetchBarbers = async () => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('barbershop_id', barbershopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Erro ao buscar barbeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os barbeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBarber) {
        const { error } = await supabase
          .from('barbers')
          .update(formData)
          .eq('id', editingBarber.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Barbeiro atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('barbers')
          .insert({ ...formData, barbershop_id: barbershopId });

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Barbeiro adicionado com sucesso!",
        });
      }

      setIsDialogOpen(false);
      setEditingBarber(null);
      setFormData({ name: "", email: "", phone: "", bio: "", is_active: true });
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao salvar barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o barbeiro.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (barber: Barber) => {
    setEditingBarber(barber);
    setFormData({
      name: barber.name,
      email: barber.email || "",
      phone: barber.phone || "",
      bio: barber.bio || "",
      is_active: barber.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este barbeiro?")) return;

    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Barbeiro removido com sucesso!",
      });
      
      fetchBarbers();
    } catch (error) {
      console.error('Erro ao excluir barbeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o barbeiro.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", bio: "", is_active: true });
    setEditingBarber(null);
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
        <h2 className="text-2xl font-bold">Barbeiros</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Barbeiro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingBarber ? "Editar Barbeiro" : "Adicionar Barbeiro"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre o barbeiro..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBarber ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {barbers.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum barbeiro cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando o primeiro barbeiro da sua equipe
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <Card key={barber.id}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    {barber.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {barber.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {barber.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-4 w-4 mr-2" />
                      {barber.email}
                    </div>
                  )}
                  {barber.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      {barber.phone}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Badge 
                    variant="outline" 
                    className={barber.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                  >
                    {barber.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(barber)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(barber.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};