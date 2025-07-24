-- =========================================
-- 🥕 당근마켓 클론 - 완전한 데이터베이스 초기화
-- =========================================

-- 1️⃣ 기존 데이터 완전 삭제
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
DROP TRIGGER IF EXISTS set_updated_at_comments ON public.comments;
DROP TRIGGER IF EXISTS set_updated_at_messages ON public.messages;
DROP TRIGGER IF EXISTS set_updated_at_chat_rooms ON public.chat_rooms;
DROP TRIGGER IF EXISTS set_product_location ON public.products;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_location() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

DROP VIEW IF EXISTS public.nearby_products CASCADE;
DROP VIEW IF EXISTS public.sellers_map CASCADE;
DROP VIEW IF EXISTS public.products_with_profiles CASCADE;

DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2️⃣ 함수 생성
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url, location, temperature)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        '합정동',
        36.5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_product_location()
RETURNS TRIGGER AS $$
BEGIN
    SELECT latitude, longitude, district 
    INTO NEW.latitude, NEW.longitude, NEW.district
    FROM public.profiles 
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3️⃣ 테이블 생성 (올바른 관계 설정)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    location TEXT DEFAULT '합정동',
    temperature DECIMAL(4,1) DEFAULT 36.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    district TEXT,
    city TEXT DEFAULT '서울시',
    is_location_set BOOLEAN DEFAULT FALSE
);

-- 🔑 핵심: products 테이블 올바른 관계 설정
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    location TEXT DEFAULT '합정동',
    image_url TEXT DEFAULT '/images/placeholder.svg',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved')),
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    district TEXT
);

CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4️⃣ 트리거 설정
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_product_location
    BEFORE INSERT ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_product_location();

-- 5️⃣ RLS 정책 (간단한 버전)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "모든 사용자가 프로필 읽기" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "자신의 프로필만 수정" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "모든 사용자가 상품 읽기" ON public.products FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자 상품 등록" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "자신의 상품만 수정" ON public.products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "모든 사용자가 좋아요 읽기" ON public.likes FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자 좋아요" ON public.likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "자신의 좋아요만 삭제" ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "모든 사용자가 댓글 읽기" ON public.comments FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자 댓글 작성" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "자신의 댓글만 수정/삭제" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "자신의 댓글만 삭제" ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "참여한 채팅방만 조회" ON public.chat_rooms FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "로그인한 사용자 채팅방 생성" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "참여한 채팅방 메시지만 조회" ON public.messages 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = chat_room_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);
CREATE POLICY "참여한 채팅방에만 메시지 전송" ON public.messages 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = chat_room_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);

SELECT '🎉 테이블 관계 수정 완료!' as status; 