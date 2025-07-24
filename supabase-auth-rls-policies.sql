-- Supabase Auth 연동 RLS 정책

-- 1. Profiles 테이블 정책
-- 모든 사용자가 프로필을 읽을 수 있음
CREATE POLICY "프로필 조회" ON public.profiles
    FOR SELECT USING (true);

-- 본인 프로필만 수정 가능
CREATE POLICY "본인 프로필 수정" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 2. Products 테이블 정책
-- 모든 사용자가 상품을 읽을 수 있음
CREATE POLICY "상품 조회" ON public.products
    FOR SELECT USING (true);

-- 인증된 사용자만 상품 등록 가능
CREATE POLICY "상품 등록" ON public.products
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 상품만 수정 가능
CREATE POLICY "본인 상품 수정" ON public.products
    FOR UPDATE USING (auth.uid() = user_id);

-- 본인 상품만 삭제 가능
CREATE POLICY "본인 상품 삭제" ON public.products
    FOR DELETE USING (auth.uid() = user_id);

-- 3. Likes 테이블 정책
-- 모든 사용자가 좋아요를 읽을 수 있음
CREATE POLICY "좋아요 조회" ON public.likes
    FOR SELECT USING (true);

-- 인증된 사용자만 좋아요 추가 가능
CREATE POLICY "좋아요 추가" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 좋아요만 삭제 가능
CREATE POLICY "본인 좋아요 삭제" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Comments 테이블 정책
-- 모든 사용자가 댓글을 읽을 수 있음
CREATE POLICY "댓글 조회" ON public.comments
    FOR SELECT USING (true);

-- 인증된 사용자만 댓글 작성 가능
CREATE POLICY "댓글 작성" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 댓글만 수정 가능
CREATE POLICY "본인 댓글 수정" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 본인 댓글만 삭제 가능
CREATE POLICY "본인 댓글 삭제" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Chat Rooms 테이블 정책
-- 참여자만 채팅방 조회 가능
CREATE POLICY "채팅방 조회" ON public.chat_rooms
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- 구매자만 채팅방 생성 가능
CREATE POLICY "채팅방 생성" ON public.chat_rooms
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- 6. Messages 테이블 정책
-- 채팅방 참여자만 메시지 조회 가능
CREATE POLICY "메시지 조회" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE chat_rooms.id = messages.chat_room_id
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

-- 채팅방 참여자만 메시지 전송 가능
CREATE POLICY "메시지 전송" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE chat_rooms.id = messages.chat_room_id
            AND (chat_rooms.buyer_id = auth.uid() OR chat_rooms.seller_id = auth.uid())
        )
    );

-- 본인 메시지만 수정 가능 (읽음 상태 등)
CREATE POLICY "본인 메시지 수정" ON public.messages
    FOR UPDATE USING (auth.uid() = sender_id); 