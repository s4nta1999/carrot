-- ============================================
-- 🚀 Supabase 완전 초기화 + 캐시 새로고침
-- ============================================
-- 실행 순서: 
-- 1. 기존 데이터 완전 삭제
-- 2. 새로운 스키마 생성 (위치정보 포함)
-- 3. 인덱스 및 트리거 설정
-- 4. RLS 정책 활성화
-- 5. 캐시 강제 새로고침

-- ============================================
-- 🗑️ 1단계: 기존 테이블 및 함수 완전 삭제
-- ============================================

-- 트리거 삭제 (모든 가능한 이름으로 시도)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_products ON public.products;
DROP TRIGGER IF EXISTS set_updated_at_comments ON public.comments;
DROP TRIGGER IF EXISTS update_product_likes_count ON public.likes;

-- 함수 삭제 (CASCADE 옵션 추가)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.update_likes_count() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- 테이블 삭제 (순서 중요: 외래키 관계 고려)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chat_rooms CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- 🏗️ 2단계: 새로운 테이블 생성 (위치정보 포함)
-- ============================================

-- 1. 사용자 프로필 테이블 (위치정보 포함)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    location TEXT DEFAULT '합정동',
    temperature NUMERIC(3,1) DEFAULT 36.5,
    -- 🗺️ 위치 정보 필드 추가
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    address TEXT NULL,
    district TEXT NULL,
    city TEXT NULL,
    is_location_set BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 상품 테이블 (user_id는 나중에 외래키 추가)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    location TEXT DEFAULT '합정동',
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved')),
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 좋아요 테이블 (user_id는 나중에 외래키 추가)
CREATE TABLE public.likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 4. 댓글 테이블 (user_id는 나중에 외래키 추가)
CREATE TABLE public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 채팅방 테이블 (buyer_id, seller_id는 나중에 외래키 추가)
CREATE TABLE public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, buyer_id)
);

-- 6. 채팅 메시지 테이블 (sender_id는 나중에 외래키 추가)
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 📊 3단계: 인덱스 생성 (성능 최적화)
-- ============================================

-- 프로필 인덱스
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_location ON public.profiles(latitude, longitude);
CREATE INDEX idx_profiles_district ON public.profiles(district);

-- 상품 인덱스
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_price ON public.products(price);

-- 좋아요 인덱스
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_product_id ON public.likes(product_id);

-- 댓글 인덱스
CREATE INDEX idx_comments_product_id ON public.comments(product_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at);

-- 채팅 인덱스
CREATE INDEX idx_chat_rooms_product_id ON public.chat_rooms(product_id);
CREATE INDEX idx_chat_rooms_buyer_id ON public.chat_rooms(buyer_id);
CREATE INDEX idx_chat_rooms_seller_id ON public.chat_rooms(seller_id);
CREATE INDEX idx_messages_chat_room_id ON public.messages(chat_room_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_messages_is_read ON public.messages(is_read);

-- ============================================
-- 🔐 4단계: Row Level Security (RLS) 비활성화
-- ============================================

-- RLS 완전 비활성화 (개발 편의성을 위해)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 📡 실시간 채팅을 위한 Realtime 설정
-- ============================================

-- Realtime을 위한 REPLICA IDENTITY 설정
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.products REPLICA IDENTITY FULL;
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- ============================================
-- ⚙️ 5단계: 트리거 함수 생성
-- ============================================

-- 자동 프로필 생성 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 좋아요 수 자동 계산 함수
CREATE OR REPLACE FUNCTION public.update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.products 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.products 
        SET likes_count = GREATEST(likes_count - 1, 0) 
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 🎯 6단계: 트리거 생성
-- ============================================

-- 새 사용자 등록 시 자동으로 프로필 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_comments
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 좋아요 수 자동 업데이트 트리거
CREATE TRIGGER update_product_likes_count
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_likes_count();

-- ============================================
-- 🔗 7단계: 외래키 제약조건 설정 (profiles 연결)
-- ============================================

-- 🗑️ 기존 외래키 제약 조건 삭제 (혹시 남아있다면)
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_user_id_fkey;
ALTER TABLE public.likes DROP CONSTRAINT IF EXISTS likes_user_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_buyer_id_fkey;
ALTER TABLE public.chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_seller_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- ✅ 새로운 외래키 제약 조건 추가 (→ profiles.id)
-- products.user_id → profiles.id
ALTER TABLE public.products
ADD CONSTRAINT fk_products_user_id
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- likes.user_id → profiles.id
ALTER TABLE public.likes
ADD CONSTRAINT fk_likes_user_id
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- comments.user_id → profiles.id
ALTER TABLE public.comments
ADD CONSTRAINT fk_comments_user_id
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- chat_rooms.buyer_id → profiles.id
ALTER TABLE public.chat_rooms
ADD CONSTRAINT fk_chat_rooms_buyer_id
FOREIGN KEY (buyer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- chat_rooms.seller_id → profiles.id
ALTER TABLE public.chat_rooms
ADD CONSTRAINT fk_chat_rooms_seller_id
FOREIGN KEY (seller_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- messages.sender_id → profiles.id
ALTER TABLE public.messages
ADD CONSTRAINT fk_messages_sender_id
FOREIGN KEY (sender_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- ============================================
-- 🚀 8단계: 캐시 강제 새로고침
-- ============================================

-- PostgREST 스키마 캐시 새로고침
SELECT pg_notify('pgrst', 'reload schema');

-- Supabase Realtime 새로고침
NOTIFY pgrst, 'reload schema';

-- ============================================
-- ✅ 9단계: 초기화 완료!
-- ============================================

-- 성공 메시지 출력
SELECT 
    '🎉 데이터베이스 초기화 완료!' as message,
    '📊 테이블: ' || count(*) || '개 생성됨' as tables_created,
    '🔄 캐시 새로고침 완료' as cache_status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- 생성된 테이블 목록 확인
SELECT 
    table_name as "📋 생성된 테이블",
    CASE 
        WHEN table_name = 'profiles' THEN '👤 사용자 프로필 (위치정보 포함)'
        WHEN table_name = 'products' THEN '🛍️ 상품 정보'
        WHEN table_name = 'likes' THEN '❤️ 좋아요'
        WHEN table_name = 'comments' THEN '💬 댓글'
        WHEN table_name = 'chat_rooms' THEN '💭 채팅방'
        WHEN table_name = 'messages' THEN '📝 채팅 메시지'
        ELSE '기타'
    END as "설명"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name; 