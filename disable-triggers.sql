-- ============================================
-- 🔧 트리거 비활성화 (프로필 생성 충돌 방지)
-- ============================================

-- auth.users 테이블의 자동 프로필 생성 트리거 비활성화
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS handle_new_user_trigger ON auth.users;

-- 함수도 삭제
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- ============================================
-- ✅ 트리거 비활성화 완료
-- ============================================

-- 확인 메시지
SELECT '🎉 트리거 비활성화 완료!' as message; 