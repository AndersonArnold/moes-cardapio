-- Habilitar a extensão para geração de UUIDs (necessário se ainda não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

----------------------------------------------------------------------------------
-- 1. TABELA DE CATEGORIAS
----------------------------------------------------------------------------------
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler as categorias (Público)
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.categories FOR SELECT USING (true);

-- Política: Insert/Update/Delete liberados para qualquer pessoa (Pois não teremos login de admin nesta versão)
CREATE POLICY "Permitir Insert em categories para todos." ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Update em categories para todos." ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Permitir Delete em categories para todos." ON public.categories FOR DELETE USING (true);


----------------------------------------------------------------------------------
-- 2. TABELA DE PRODUTOS
----------------------------------------------------------------------------------
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler os produtos (Público)
CREATE POLICY "Produtos são visíveis por todos." 
ON public.products FOR SELECT USING (true);

-- Política: Insert/Update/Delete (Sem Auth)
CREATE POLICY "Permitir Insert em products para todos." ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir Update em products para todos." ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permitir Delete em products para todos." ON public.products FOR DELETE USING (true);


----------------------------------------------------------------------------------
-- 3. TABELA DE CONFIGURAÇÕES DA LOJA
----------------------------------------------------------------------------------
CREATE TABLE public.store_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_name TEXT NOT NULL DEFAULT 'Moe''s Lancheria',
    logo_url TEXT,
    whatsapp_number TEXT NOT NULL DEFAULT '5500000000000',
    address TEXT,
    is_open BOOLEAN DEFAULT true,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    operating_days TEXT DEFAULT 'Terça a Domingo',
    opening_time TEXT DEFAULT '18:30',
    closing_time TEXT DEFAULT '23:30',
    google_maps_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir a configuração inicial vazia (apenas 1 linha na tabela é necessária)
INSERT INTO public.store_config (store_name) VALUES ('Lancheria Moe''s');

-- Habilitar RLS
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;

-- Política: Leitura (Público)
CREATE POLICY "Configurações da loja são visíveis por todos." 
ON public.store_config FOR SELECT USING (true);

-- Política: Update (Sem Auth)
CREATE POLICY "Permitir Update nas configurações para todos." ON public.store_config FOR UPDATE USING (true);
