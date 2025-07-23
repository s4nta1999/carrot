-- 더미 사용자 로그인 시스템을 위한 RLS 정책들
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- 1. users 테이블 정책
-- 모든 사용자 정보 읽기 허용 (로그인 목록을 위해)
CREATE POLICY "Allow public read access for users" ON users
    FOR SELECT USING (true);

-- 새 사용자 생성 허용 (회원가입을 위해)
CREATE POLICY "Allow public insert for users" ON users
    FOR INSERT WITH CHECK (true);

-- 2. products 테이블 정책  
-- 모든 상품 읽기 허용
CREATE POLICY "Allow public read access for products" ON products
    FOR SELECT USING (true);

-- 상품 생성 허용
CREATE POLICY "Allow public insert for products" ON products
    FOR INSERT WITH CHECK (true);

-- 상품 수정 허용 (나중에 필요할 수 있음)
CREATE POLICY "Allow public update for products" ON products
    FOR UPDATE USING (true);

-- 3. comments 테이블 정책
-- 모든 댓글 읽기 허용
CREATE POLICY "Allow public read access for comments" ON comments
    FOR SELECT USING (true);

-- 댓글 생성 허용
CREATE POLICY "Allow public insert for comments" ON comments
    FOR INSERT WITH CHECK (true);

-- 4. likes 테이블 정책
-- 모든 좋아요 읽기 허용  
CREATE POLICY "Allow public read access for likes" ON likes
    FOR SELECT USING (true);

-- 좋아요 생성/삭제 허용
CREATE POLICY "Allow public insert for likes" ON likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete for likes" ON likes
    FOR DELETE USING (true); 