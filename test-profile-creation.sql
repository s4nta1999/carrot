-- ============================================
-- 🧪 프로필 생성 테스트
-- ============================================

-- 1. 현재 auth.users 확인
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. 현재 profiles 확인
SELECT 
    id,
    username,
    location,
    is_location_set,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. 수동 프로필 생성 테스트 (실제 사용자 ID로 교체 필요)
-- INSERT INTO public.profiles (
--     id,
--     username,
--     location,
--     temperature,
--     is_location_set
-- ) VALUES (
--     '실제-사용자-ID-여기에-입력',
--     '테스트 사용자',
--     '위치 정보 없음',
--     36.5,
--     false
-- );

-- ============================================
-- ✅ 테스트 완료
-- ============================================ 