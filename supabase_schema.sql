-- ============================================================
-- TRENCH ARENA: Complete Supabase Schema
-- Tüm tabloları oluşturur, RLS politikalarını ayarlar ve seed data ekler
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- ============================================================

-- ============================================================
-- 1. PROFILES (Kullanıcı Profilleri)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    username TEXT,
    balance NUMERIC DEFAULT 0,
    vip_level TEXT DEFAULT 'BRONZE', -- BRONZE, SILVER, GOLD, DIAMOND
    total_wagered NUMERIC DEFAULT 0,
    total_won NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auth trigger: Yeni kullanıcı kaydolunca otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, balance)
    VALUES (
        NEW.id,
        NEW.email,
        SPLIT_PART(NEW.email, '@', 1),
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. DEPOSITS (Para Yatırma Talepleri)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    coin TEXT NOT NULL, -- BTC, ETH, SOL, TRX, TON
    amount NUMERIC NOT NULL,
    tx_hash TEXT,
    status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits" ON public.deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own deposits" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can view all deposits" ON public.deposits FOR SELECT USING (true);
CREATE POLICY "Admin can update deposits" ON public.deposits FOR UPDATE USING (true);

-- ============================================================
-- 3. TOURNAMENTS (Turnuvalar)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournaments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    prize_pool NUMERIC DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    game_type TEXT DEFAULT 'ALL', -- ALL, SLOT, WEB3, LIVE
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournaments viewable by everyone" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Admin can manage tournaments" ON public.tournaments FOR ALL USING (true);

-- ============================================================
-- 4. TOURNAMENT_ENTRIES (Turnuva Katılımcıları & Sıralama)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tournament_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    username TEXT,
    points NUMERIC DEFAULT 0,
    prize TEXT DEFAULT '$0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(tournament_id, user_id)
);

ALTER TABLE public.tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tournament entries viewable by everyone" ON public.tournament_entries FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update entries" ON public.tournament_entries FOR UPDATE USING (true);

-- ============================================================
-- 5. CASINO_GAMES (Casino Oyun Listesi)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.casino_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    provider TEXT NOT NULL,
    category TEXT NOT NULL, -- SLOT, LIVE, WEB3, CRASH, ROULETTE, BLACKJACK, BACCARAT, GAME SHOWS
    image_url TEXT,
    players_count INTEGER DEFAULT 0,
    min_bet NUMERIC DEFAULT 1.00,
    is_hot BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.casino_games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Casino games viewable by everyone" ON public.casino_games FOR SELECT USING (true);
CREATE POLICY "Admin can manage casino games" ON public.casino_games FOR ALL USING (true);

-- ============================================================
-- 6. TRADING_POSITIONS (Web3 Trading Pozisyonları)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.trading_positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- LONG, SHORT
    asset TEXT NOT NULL DEFAULT 'SOL/USD',
    size NUMERIC NOT NULL,
    entry_price NUMERIC NOT NULL,
    leverage INTEGER NOT NULL DEFAULT 1,
    liquidation_price NUMERIC,
    close_price NUMERIC,
    pnl NUMERIC,
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED, LIQUIDATED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own positions" ON public.trading_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own positions" ON public.trading_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own positions" ON public.trading_positions FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 7. CHAT_MESSAGES (Global Sohbet)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT,
    message TEXT NOT NULL,
    vip_level TEXT DEFAULT 'BRONZE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Chat messages viewable by everyone" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- ============================================================
-- 8. SPORT_BETS (Spor Bahisleri)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sport_bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    match_id TEXT NOT NULL,
    match_title TEXT,
    selection TEXT NOT NULL, -- Team name or "Draw"
    odds NUMERIC NOT NULL,
    stake NUMERIC NOT NULL,
    potential_win NUMERIC,
    status TEXT DEFAULT 'PENDING', -- PENDING, WON, LOST, CANCELLED
    result TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.sport_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sport bets" ON public.sport_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can place sport bets" ON public.sport_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage sport bets" ON public.sport_bets FOR ALL USING (true);

-- ============================================================
-- 9. GAME_HISTORY (Oyun Geçmişi - Canlı Kazançlar Ticker'ı)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.game_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    username TEXT,
    game_title TEXT NOT NULL,
    bet_amount NUMERIC NOT NULL,
    win_amount NUMERIC DEFAULT 0,
    multiplier NUMERIC DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game history viewable by everyone" ON public.game_history FOR SELECT USING (true);
CREATE POLICY "Users can insert own game history" ON public.game_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for game_history (canlı kazançlar ticker)
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_history;

-- ============================================================
-- 10. BETS (Deep Needle limit emirleri - mevcut)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_address TEXT,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    game_type TEXT NOT NULL DEFAULT 'DEEP_NEEDLE',
    amount_sol NUMERIC NOT NULL,
    target_drop_percent NUMERIC,
    entry_price NUMERIC,
    status TEXT DEFAULT 'PENDING', -- PENDING, EXECUTED, CANCELLED, LIQUIDATED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public bets viewable" ON public.bets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bets" ON public.bets FOR INSERT WITH CHECK (true);

-- ============================================================
-- 11. HOUSE_POOL (Kasa Havuzu - mevcut)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.house_pool (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_liquidity_sol NUMERIC DEFAULT 0,
    insurance_fund_sol NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================
-- SEED DATA: Casino Oyunları
-- ============================================================
INSERT INTO public.casino_games (title, slug, provider, category, image_url, players_count, min_bet, is_hot, is_featured, sort_order) VALUES
-- Web3 Originals
('Deep Needle', 'deep-needle', 'TRENCH Originals', 'WEB3', 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?q=80&w=600', 4200, 0.10, true, true, 1),
('Dead Cat Bounce', 'dead-cat-bounce', 'TRENCH Originals', 'WEB3', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600', 2100, 0.10, false, true, 2),
('Trench Crash', 'crash', 'TRENCH Originals', 'CRASH', 'https://images.unsplash.com/photo-1639762681485-074b7f4ec139?q=80&w=600', 9850, 1.00, true, true, 3),
-- Slots
('Sweet Bonanza', 'sweet-bonanza', 'Pragmatic Play', 'SLOT', 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=600', 3400, 0.20, true, true, 10),
('Gates of Olympus', 'gates-of-olympus', 'Pragmatic Play', 'SLOT', 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=600', 4100, 0.20, true, true, 11),
('Sugar Rush', 'sugar-rush', 'Pragmatic Play', 'SLOT', 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600', 1800, 0.20, false, false, 12),
-- Live Casino
('Lightning Roulette', 'lightning-roulette', 'Evolution', 'ROULETTE', 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=600', 1420, 0.20, true, false, 20),
('Crazy Time', 'crazy-time', 'Evolution', 'GAME SHOWS', 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?q=80&w=600', 3850, 0.10, true, true, 21),
('Infinite Blackjack', 'infinite-blackjack', 'Evolution', 'BLACKJACK', 'https://images.unsplash.com/photo-1511516805178-06bbddab960e?q=80&w=600', 850, 1.00, false, false, 22),
('XXXtreme Lightning', 'xxxtreme-lightning', 'Evolution', 'ROULETTE', 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600', 2100, 0.20, true, false, 23),
('Mega Roulette', 'mega-roulette', 'Pragmatic Play', 'ROULETTE', 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=600', 1100, 0.10, true, false, 24),
('Sweet Bonanza Candyland', 'sweet-bonanza-candyland', 'Pragmatic Play', 'GAME SHOWS', 'https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=600', 5200, 0.20, true, false, 25),
('ONE Blackjack', 'one-blackjack', 'Pragmatic Play', 'BLACKJACK', 'https://images.unsplash.com/photo-1563214555-5f50f269a8b6?q=80&w=600', 900, 1.00, false, false, 26),
('Speed Baccarat', 'speed-baccarat', 'Pragmatic Play', 'BACCARAT', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600', 1350, 2.00, false, false, 27),
-- Crash
('Aviator', 'aviator', 'Spribe', 'CRASH', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600', 6200, 0.10, true, true, 30)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Turnuvalar
-- ============================================================
INSERT INTO public.tournaments (title, description, prize_pool, end_date, is_active, game_type) VALUES
('Slot İmparatorluğu', 'Sadece Pragmatic Play oyunlarında geçerlidir. En yüksek çarpanı yakalayan oyuncu kazanır.', 50000, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second'), true, 'SLOT'),
('Web3 Degens', 'Trench Originals (Deep Needle) oyununda en yüksek çarpan. Kripto yerlileri için özel turnuva.', 10000, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second'), true, 'WEB3'),
('Crash Masters', 'Aviator ve Trench Crash oyunlarında en yüksek kümülatif kazanç. Hız ve cesaret gerektirir.', 25000, (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second'), true, 'CRASH')
ON CONFLICT DO NOTHING;
