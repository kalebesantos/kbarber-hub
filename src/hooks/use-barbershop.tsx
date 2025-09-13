import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface Barbershop {
  id: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  address: string;
  opening_hours: Json;
  is_active: boolean;
}

interface BarbershopContextType {
  barbershop: Barbershop | null;
  loading: boolean;
  getBarbershopBySlug: (slug: string) => Promise<Barbershop | null>;
}

const BarbershopContext = createContext<BarbershopContextType | undefined>(undefined);

export const BarbershopProvider = ({ children }: { children: React.ReactNode }) => {
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(false);

  const getBarbershopBySlug = async (slug: string): Promise<Barbershop | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setBarbershop(null);
        return null;
      }

      setBarbershop(data);
      return data;
    } catch (error) {
      console.error('Error fetching barbershop:', error);
      setBarbershop(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BarbershopContext.Provider value={{ barbershop, loading, getBarbershopBySlug }}>
      {children}
    </BarbershopContext.Provider>
  );
};

export const useBarbershop = () => {
  const context = useContext(BarbershopContext);
  if (context === undefined) {
    throw new Error("useBarbershop must be used within a BarbershopProvider");
  }
  return context;
};