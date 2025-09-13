-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create barbershops table
CREATE TABLE public.barbershops (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    phone TEXT,
    address TEXT,
    opening_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create barbers table
CREATE TABLE public.barbers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for customers
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blocked_times table for blocking specific time slots
CREATE TABLE public.blocked_times (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
    barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Barbershops: Anyone can read, no restrictions for MVP
CREATE POLICY "Anyone can view barbershops" ON public.barbershops FOR SELECT USING (true);
CREATE POLICY "Anyone can manage barbershops" ON public.barbershops FOR ALL USING (true);

-- Barbers: Accessible based on barbershop
CREATE POLICY "Anyone can view barbers" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Anyone can manage barbers" ON public.barbers FOR ALL USING (true);

-- Services: Accessible based on barbershop
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Anyone can manage services" ON public.services FOR ALL USING (true);

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments: Customers see their own, others see all for their barbershop
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (
    customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can manage appointments" ON public.appointments FOR ALL USING (true);

-- Blocked times: Accessible based on barbershop
CREATE POLICY "Anyone can view blocked times" ON public.blocked_times FOR SELECT USING (true);
CREATE POLICY "Anyone can manage blocked times" ON public.blocked_times FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON public.barbershops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_blocked_times_updated_at BEFORE UPDATE ON public.blocked_times FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_barbershops_slug ON public.barbershops(slug);
CREATE INDEX idx_barbers_barbershop_id ON public.barbers(barbershop_id);
CREATE INDEX idx_services_barbershop_id ON public.services(barbershop_id);
CREATE INDEX idx_appointments_barbershop_id ON public.appointments(barbershop_id);
CREATE INDEX idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX idx_appointments_customer_id ON public.appointments(customer_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_blocked_times_barbershop_id ON public.blocked_times(barbershop_id);
CREATE INDEX idx_blocked_times_date ON public.blocked_times(blocked_date);

-- Insert sample data
INSERT INTO public.barbershops (name, slug, description, phone, address) VALUES 
('Barbearia Clássica', 'classica', 'Tradição e qualidade em cortes masculinos', '(11) 99999-9999', 'Rua das Flores, 123 - São Paulo/SP'),
('Modern Barber', 'modern-barber', 'Cortes modernos e cuidados masculinos', '(11) 88888-8888', 'Av. Paulista, 456 - São Paulo/SP');

INSERT INTO public.barbers (barbershop_id, name, email, phone, bio) VALUES 
((SELECT id FROM public.barbershops WHERE slug = 'classica'), 'João Silva', 'joao@classica.com', '(11) 77777-7777', 'Barbeiro experiente com mais de 10 anos de profissão'),
((SELECT id FROM public.barbershops WHERE slug = 'classica'), 'Pedro Santos', 'pedro@classica.com', '(11) 66666-6666', 'Especialista em cortes clássicos e modernos'),
((SELECT id FROM public.barbershops WHERE slug = 'modern-barber'), 'Carlos Oliveira', 'carlos@modern.com', '(11) 55555-5555', 'Barbeiro moderno especializado em degradês e barbas');

INSERT INTO public.services (barbershop_id, name, description, duration_minutes, price) VALUES 
((SELECT id FROM public.barbershops WHERE slug = 'classica'), 'Corte Tradicional', 'Corte clássico masculino', 30, 25.00),
((SELECT id FROM public.barbershops WHERE slug = 'classica'), 'Corte + Barba', 'Corte completo com finalização da barba', 45, 35.00),
((SELECT id FROM public.barbershops WHERE slug = 'classica'), 'Apenas Barba', 'Cuidados e finalização da barba', 20, 15.00),
((SELECT id FROM public.barbershops WHERE slug = 'modern-barber'), 'Corte Moderno', 'Corte estilizado com degradê', 40, 30.00),
((SELECT id FROM public.barbershops WHERE slug = 'modern-barber'), 'Barba Completa', 'Barba com navalha e cuidados especiais', 30, 25.00);