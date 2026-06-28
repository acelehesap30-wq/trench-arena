-- TRENCH ARENA: Supabase Schema

-- 1. Bahislerin (Deep Needle limit emirlerinin) tutulduğu tablo
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    game_type TEXT NOT NULL, -- e.g., 'DEEP_NEEDLE'
    amount_sol NUMERIC NOT NULL,
    target_drop_percent NUMERIC,
    entry_price NUMERIC,
    status TEXT DEFAULT 'PENDING', -- PENDING, EXECUTED, CANCELLED, LIQUIDATED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Kasa Havuzu (The House) verileri
CREATE TABLE IF NOT EXISTS public.house_pool (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_liquidity_sol NUMERIC DEFAULT 0,
    insurance_fund_sol NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- İlk kasa kaydını oluşturalım
INSERT INTO public.house_pool (total_liquidity_sol, insurance_fund_sol) VALUES (100.0, 5.0);

-- Row Level Security (RLS) Policies (Opsiyonel ama önerilir)
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Public profiles are viewable by everyone."
ON public.bets FOR SELECT
USING ( true );

-- Anonim key ile ekleme yapılabilir (Test aşaması için açık)
CREATE POLICY "Anyone can insert bets."
ON public.bets FOR INSERT
WITH CHECK ( true );
