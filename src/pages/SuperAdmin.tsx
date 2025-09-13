import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PremiumButton } from "@/components/ui/premium-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Store, Edit2, Trash2, ExternalLink } from "lucide-react";
import { buildBarbershopUrl } from "@/utils/subdomain";

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  is_active: boolean;
}

export const SuperAdmin = () => {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBarbershop, setEditingBarbershop] = useState<Barbershop | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarbershops(data || []);
    } catch (error) {
      console.error('Error fetching barbershops:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar barbearias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingBarbershop ? prev.slug : generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast({
        title: "Erro",
        description: "Nome e slug são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingBarbershop) {
        const { error } = await supabase
          .from('barbershops')
          .update(formData)
          .eq('id', editingBarbershop.id);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Barbearia atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('barbershops')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Sucesso",
          description: "Barbearia criada com sucesso"
        });
      }

      resetForm();
      fetchBarbershops();
    } catch (error: any) {
      console.error('Error saving barbershop:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar barbearia",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      phone: "",
      address: ""
    });
    setShowForm(false);
    setEditingBarbershop(null);
  };

  const handleEdit = (barbershop: Barbershop) => {
    setFormData({
      name: barbershop.name,
      slug: barbershop.slug,
      description: barbershop.description || "",
      phone: barbershop.phone || "",
      address: barbershop.address || ""
    });
    setEditingBarbershop(barbershop);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta barbearia?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('barbershops')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Barbearia removida com sucesso"
      });
      fetchBarbershops();
    } catch (error: any) {
      console.error('Error deleting barbershop:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover barbearia",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header barbershopName="Painel Super Admin" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold gradient-premium">
                Gestão de Barbearias
              </h1>
              <p className="text-muted-foreground mt-2">
                Gerencie todas as barbearias do sistema
              </p>
            </div>
            
            <PremiumButton
              variant="premium"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Barbearia
            </PremiumButton>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="mb-8 bg-card/50 border-border">
              <CardHeader>
                <CardTitle>
                  {editingBarbershop ? 'Editar Barbearia' : 'Nova Barbearia'}
                </CardTitle>
                <CardDescription>
                  {editingBarbershop ? 'Atualize os dados da barbearia' : 'Preencha os dados para criar uma nova barbearia'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Barbearia</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Digite o nome da barbearia"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="exemplo-barbearia"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da barbearia..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Rua, número, bairro..."
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-4 pt-4">
                    <PremiumButton type="submit" variant="premium">
                      {editingBarbershop ? 'Atualizar' : 'Criar Barbearia'}
                    </PremiumButton>
                    <PremiumButton type="button" variant="ghost" onClick={resetForm}>
                      Cancelar
                    </PremiumButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Barbershops List */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando barbearias...</p>
            </div>
          ) : barbershops.length === 0 ? (
            <Card className="bg-card/50 border-border">
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma barbearia encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira barbearia para começar
                </p>
                <PremiumButton variant="premium" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Barbearia
                </PremiumButton>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {barbershops.map((barbershop) => (
                <Card key={barbershop.id} className="bg-card/50 border-border hover:bg-card/80 transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{barbershop.name}</CardTitle>
                        <CardDescription className="text-primary font-mono">
                          {barbershop.slug}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <PremiumButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(barbershop)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </PremiumButton>
                        <PremiumButton
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(barbershop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </PremiumButton>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {barbershop.description && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {barbershop.description}
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-3">
                      <PremiumButton
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(buildBarbershopUrl(barbershop.slug), '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver Site
                      </PremiumButton>
                      
                      <PremiumButton
                        variant="premium"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(buildBarbershopUrl(barbershop.slug, '/admin'), '_blank')}
                      >
                        Painel Admin
                      </PremiumButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};