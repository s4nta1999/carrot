-- =========================================
-- 🥕 당근마켓 클론 - 완전한 데이터베이스 초기화
-- =========================================
-- 이 파일은 모든 테이블을 삭제하고 최신 구조로 재생성합니다.
-- 위치 기능, Auth, RLS 정책 모두 포함된 완전한 스키마입니다.

-- =========================================
-- 1️⃣ 기존 데이터 완전 삭제 (순서 중요!)
-- =========================================

-- 트리거 삭제
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
DROP TRIGGER IF EXISTS set_updated_at_comments ON public.comments;
DROP TRIGGER IF EXISTS set_updated_at_messages ON public.messages;
DROP TRIGGER IF EXISTS set_updated_at_chat_rooms ON public.chat_rooms;
DROP TRIGGER IF EXISTS set_product_location ON public.products;

-- 함수 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_product_location() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) CASCADE;

-- 뷰 삭제
DROP VIEW IF EXISTS public.nearby_products CASCADE;
DROP VIEW IF EXISTS public.sellers_map CASCADE;
DROP VIEW IF EXISTS public.products_with_profiles CASCADE;

-- 테이블 삭제 (외래키 순서에 맞춰)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 인덱스 삭제 (혹시 남아있을 경우)
DROP INDEX IF EXISTS idx_profiles_location;
DROP INDEX IF EXISTS idx_profiles_district;
DROP INDEX IF EXISTS idx_profiles_location_set;
DROP INDEX IF EXISTS idx_products_location;
DROP INDEX IF EXISTS idx_products_district;
DROP INDEX IF EXISTS idx_products_likes_count;
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_likes_product_id;
DROP INDEX IF EXISTS idx_likes_user_id;
DROP INDEX IF EXISTS idx_comments_product_id;
DROP INDEX IF EXISTS idx_chat_rooms_participants;
DROP INDEX IF EXISTS idx_messages_chat_room_id;

SELECT '🗑️  기존 데이터 완전 삭제 완료!' as status;

-- =========================================
-- 2️⃣ 유틸리티 함수 생성
-- =========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 새 사용자 프로필 자동 생성 함수
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

-- 상품 등록시 사용자 위치 자동 복사 함수
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

-- 거리 계산 함수 (Haversine 공식)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    distance DECIMAL;
BEGIN
    distance := (
        6371 * acos(
            cos(radians(lat1)) * cos(radians(lat2)) * 
            cos(radians(lon2) - radians(lon1)) + 
            sin(radians(lat1)) * sin(radians(lat2))
        )
    );
    RETURN distance;
END;
$$ LANGUAGE plpgsql;

SELECT '⚙️  유틸리티 함수 생성 완료!' as status;

-- =========================================
-- 3️⃣ 테이블 생성 (최신 구조)
-- =========================================

-- 사용자 프로필 테이블 (위치 정보 포함)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    location TEXT DEFAULT '합정동',
    temperature DECIMAL(4,1) DEFAULT 36.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 🗺️ 위치 정보 (새로 추가)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    district TEXT,
    city TEXT DEFAULT '서울시',
    is_location_set BOOLEAN DEFAULT FALSE
);

-- 상품 테이블 (위치 정보 포함)
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
    -- 🗺️ 위치 정보 (새로 추가)
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    district TEXT
);

-- 좋아요 테이블
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 댓글 테이블
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅방 테이블
CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- 메시지 테이블
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT '📋 테이블 생성 완료!' as status;

-- =========================================
-- 4️⃣ 인덱스 생성 (성능 최적화)
-- =========================================

-- 위치 기반 인덱스
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude);
CREATE INDEX idx_profiles_district ON public.profiles(district);
CREATE INDEX idx_profiles_location_set ON public.profiles(is_location_set);
CREATE INDEX idx_products_location ON public.products(latitude, longitude);
CREATE INDEX idx_products_district ON public.products(district);

-- 기본 성능 인덱스
CREATE INDEX idx_products_likes_count ON public.products(likes_count DESC);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_likes_product_id ON public.likes(product_id);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_comments_product_id ON public.comments(product_id);
CREATE INDEX idx_chat_rooms_participants ON public.chat_rooms(buyer_id, seller_id);
CREATE INDEX idx_messages_chat_room_id ON public.messages(chat_room_id);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

SELECT '📈 인덱스 생성 완료!' as status;

-- =========================================
-- 5️⃣ 트리거 설정
-- =========================================

-- Auth 사용자 생성시 프로필 자동 생성
CREATE TRIGGER handle_new_user_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at 자동 업데이트 트리거들
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_comments
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_messages
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_chat_rooms
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 상품 등록시 위치 자동 복사 트리거
CREATE TRIGGER set_product_location
    BEFORE INSERT ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_product_location();

SELECT '🔄 트리거 설정 완료!' as status;

-- =========================================
-- 6️⃣ 뷰(View) 생성
-- =========================================

-- 주변 상품 조회 뷰
CREATE OR REPLACE VIEW public.nearby_products AS
SELECT 
    p.*,
    pr.username,
    pr.avatar_url,
    pr.temperature,
    pr.district as seller_district,
    pr.latitude as seller_latitude,
    pr.longitude as seller_longitude
FROM public.products p
LEFT JOIN public.profiles pr ON p.user_id = pr.id
WHERE p.latitude IS NOT NULL 
  AND p.longitude IS NOT NULL
  AND p.status = 'active';

-- 판매자별 상품 정보 뷰 (지도용)
CREATE OR REPLACE VIEW public.sellers_map AS
SELECT 
    pr.id,
    pr.username,
    pr.avatar_url,
    pr.temperature,
    pr.latitude,
    pr.longitude,
    pr.district,
    pr.address,
    COUNT(p.id) as product_count,
    array_agg(p.id) FILTER (WHERE p.id IS NOT NULL) as product_ids,
    array_agg(p.title) FILTER (WHERE p.title IS NOT NULL) as product_titles,
    array_agg(p.price) FILTER (WHERE p.price IS NOT NULL) as product_prices,
    array_agg(p.image_url) FILTER (WHERE p.image_url IS NOT NULL) as product_images
FROM public.profiles pr
LEFT JOIN public.products p ON pr.id = p.user_id AND p.status = 'active'
WHERE pr.latitude IS NOT NULL 
  AND pr.longitude IS NOT NULL
  AND pr.is_location_set = TRUE
GROUP BY pr.id, pr.username, pr.avatar_url, pr.temperature, 
         pr.latitude, pr.longitude, pr.district, pr.address;

-- 상품과 프로필 조인 뷰 (데이터 확인용)
CREATE OR REPLACE VIEW public.products_with_profiles AS
SELECT 
    p.*,
    pr.username,
    pr.avatar_url,
    pr.temperature
FROM public.products p
LEFT JOIN public.profiles pr ON p.user_id = pr.id;

SELECT '📊 뷰(View) 생성 완료!' as status;

-- =========================================
-- 7️⃣ RLS (Row Level Security) 정책 설정
-- =========================================

-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "프로필은 모든 사용자가 읽기 가능" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "사용자는 자신의 프로필만 수정 가능" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "사용자는 자신의 프로필만 삭제 가능" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 상품 정책
CREATE POLICY "상품은 모든 사용자가 읽기 가능" ON public.products FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자는 상품 등록 가능" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "사용자는 자신의 상품만 수정 가능" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 상품만 삭제 가능" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- 좋아요 정책
CREATE POLICY "좋아요는 모든 사용자가 읽기 가능" ON public.likes FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자는 좋아요 가능" ON public.likes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "사용자는 자신의 좋아요만 삭제 가능" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- 댓글 정책
CREATE POLICY "댓글은 모든 사용자가 읽기 가능" ON public.comments FOR SELECT USING (true);
CREATE POLICY "로그인한 사용자는 댓글 작성 가능" ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "사용자는 자신의 댓글만 수정 가능" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "사용자는 자신의 댓글만 삭제 가능" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 채팅방 정책
CREATE POLICY "사용자는 자신이 참여한 채팅방만 조회 가능" ON public.chat_rooms FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "로그인한 사용자는 채팅방 생성 가능" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 메시지 정책
CREATE POLICY "사용자는 자신이 참여한 채팅방의 메시지만 조회 가능" ON public.messages 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = chat_room_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);
CREATE POLICY "사용자는 자신이 참여한 채팅방에만 메시지 전송 가능" ON public.messages 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_rooms 
        WHERE id = chat_room_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);
CREATE POLICY "사용자는 자신의 메시지만 수정 가능" ON public.messages FOR UPDATE USING (auth.uid() = sender_id);

SELECT '🔒 RLS 정책 설정 완료!' as status;

-- =========================================
-- 8️⃣ 완료 메시지
-- =========================================

SELECT '🎉 당근마켓 데이터베이스 완전 초기화 완료!' as final_status;
SELECT '✅ 위치 기능 포함된 최신 구조로 생성됨' as location_feature;
SELECT '✅ 모든 테이블, 인덱스, 트리거, RLS 정책 설정됨' as completeness;
SELECT '🚀 이제 애플리케이션을 실행할 수 있습니다!' as ready_to_use;

-- =========================================
-- 📊 생성된 구조 확인
-- =========================================

SELECT 
    '테이블' as type,
    table_name as name,
    'public' as schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name; 