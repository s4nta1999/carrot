-- ============================================
-- 🗂️ Supabase Storage RLS 정책 설정
-- ============================================
-- 모든 사용자가 이미지를 업로드/조회/삭제할 수 있도록 설정

-- ============================================
-- 📖 1. 읽기 정책 (모든 사용자가 이미지 조회 가능)
-- ============================================
CREATE POLICY "Public Access - Read" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- ============================================
-- 📤 2. 업로드 정책 (모든 사용자가 업로드 가능)
-- ============================================
CREATE POLICY "Public Access - Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- ============================================
-- 🗑️ 3. 삭제 정책 (모든 사용자가 삭제 가능)
-- ============================================
CREATE POLICY "Public Access - Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images');

-- ============================================
-- 📝 4. 업데이트 정책 (모든 사용자가 수정 가능)
-- ============================================
CREATE POLICY "Public Access - Update" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images');

-- ============================================
-- ✅ 5. 정책 확인 쿼리
-- ============================================
-- 생성된 정책들을 확인하려면 다음 쿼리 실행:
-- SELECT * FROM storage.policies WHERE bucket_id = 'product-images';

-- ============================================
-- 🚨 6. 기존 정책 삭제 (필요시)
-- ============================================
-- 만약 기존 정책이 있다면 먼저 삭제:
-- DROP POLICY IF EXISTS "Public Access - Read" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Access - Upload" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Access - Delete" ON storage.objects;
-- DROP POLICY IF EXISTS "Public Access - Update" ON storage.objects;

-- ============================================
-- 📋 7. Bucket 생성 (필요시)
-- ============================================
-- Storage > Buckets에서 수동으로 생성하거나:
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('product-images', 'product-images', true);

-- ============================================
-- 🔧 8. RLS 활성화 확인
-- ============================================
-- Storage RLS가 활성화되어 있는지 확인:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 📸 9. 사용 예시
-- ============================================
-- 이 정책들이 적용되면:
-- ✅ 로그인하지 않은 사용자도 이미지 업로드 가능
-- ✅ 로그인하지 않은 사용자도 이미지 조회 가능
-- ✅ 로그인하지 않은 사용자도 이미지 삭제 가능
-- ✅ 모든 사용자가 모든 이미지에 접근 가능

-- ============================================
-- ⚠️ 10. 보안 주의사항
-- ============================================
-- 이 설정은 개발/테스트용입니다.
-- 프로덕션에서는 더 엄격한 정책을 사용하세요:
-- - 인증된 사용자만 업로드
-- - 본인이 업로드한 이미지만 삭제
-- - 적절한 권한 검증 