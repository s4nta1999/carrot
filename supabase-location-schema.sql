-- 기존 profiles 테이블에 위치 정보 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS district TEXT, -- 동네 (예: 합정동)
ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '서울시', -- 시/도
ADD COLUMN IF NOT EXISTS is_location_set BOOLEAN DEFAULT FALSE; -- 위치 설정 완료 여부

-- 위치 기반 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_location_set ON public.profiles(is_location_set);

-- products 테이블에도 위치 정보 추가 (판매자 위치 기반)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS district TEXT; -- 동네

-- products 위치 인덱스
CREATE INDEX IF NOT EXISTS idx_products_location ON public.products(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_products_district ON public.products(district);

-- 위치 정보 자동 업데이트 함수 (상품 등록시 사용자 위치 복사)
CREATE OR REPLACE FUNCTION public.update_product_location()
RETURNS TRIGGER AS $$
BEGIN
    -- 상품 등록시 사용자의 위치 정보를 자동으로 복사
    SELECT latitude, longitude, district 
    INTO NEW.latitude, NEW.longitude, NEW.district
    FROM public.profiles 
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 상품 등록시 위치 자동 업데이트 트리거
DROP TRIGGER IF EXISTS set_product_location ON public.products;
CREATE TRIGGER set_product_location
    BEFORE INSERT ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_product_location();

-- 거리 계산 함수 (두 지점 간의 거리를 km로 계산)
CREATE OR REPLACE FUNCTION public.calculate_distance(
    lat1 DECIMAL, lon1 DECIMAL, 
    lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    distance DECIMAL;
BEGIN
    -- Haversine 공식을 사용한 거리 계산
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

-- 주변 상품 조회 뷰 (거리순 정렬)
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

-- 판매자별 상품 수 및 위치 정보 뷰
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
    array_agg(p.id) as product_ids,
    array_agg(p.title) as product_titles,
    array_agg(p.price) as product_prices,
    array_agg(p.image_url) as product_images
FROM public.profiles pr
LEFT JOIN public.products p ON pr.id = p.user_id AND p.status = 'active'
WHERE pr.latitude IS NOT NULL 
  AND pr.longitude IS NOT NULL
  AND pr.is_location_set = TRUE
GROUP BY pr.id, pr.username, pr.avatar_url, pr.temperature, 
         pr.latitude, pr.longitude, pr.district, pr.address;

-- 샘플 동네 데이터 (서울 주요 동네들)
INSERT INTO public.profiles (id, district, city, latitude, longitude) 
VALUES 
-- 이 데이터는 실제 사용자 등록시 덮어씌워질 예시 데이터입니다
-- 실제로는 사용자가 위치를 설정할 때 입력됩니다
ON CONFLICT (id) DO NOTHING;

SELECT '위치 정보 스키마 확장 완료! 🗺️' as status; 