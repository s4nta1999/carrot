# 🚀 Supabase UUID 기반 CSV Import 가이드

## ✅ 올바른 Import 순서 (매우 중요!)

### 1️⃣ users-uuid.csv 먼저 import
- Table Editor → users → Insert → Import CSV
- 매핑: id→id, email→email, name→name 등
- ✅ 성공하면 50개 사용자 생성

### 2️⃣ products-uuid.csv import  
- Table Editor → products → Insert → Import CSV
- 매핑: id→id, user_id→user_id, title→title 등
- ✅ FK 관계 자동 설정됨!

### 3️⃣ comments-uuid.csv import
- Table Editor → comments → Insert → Import CSV  
- 매핑: id→id, product_id→product_id, user_id→user_id 등
- ✅ FK 관계 자동 설정됨!

### 4️⃣ likes-uuid.csv import
- Table Editor → likes → Insert → Import CSV
- 매핑: id→id, product_id→product_id, user_id→user_id 등
- ✅ UNIQUE 제약조건 (product_id, user_id) 포함!

## 📊 생성된 데이터
- 👥 사용자: 50명 (합정동 근처)
- 📦 상품: 100개 (다양한 카테고리)
- 💬 댓글: 249개 (자연스러운 대화)
- ❤️ 좋아요: 977개 (현실적인 분포)

## 🔑 UUID 기반 FK 관계
- users.id ← products.user_id
- products.id ← comments.product_id  
- users.id ← comments.user_id
- products.id ← likes.product_id
- users.id ← likes.user_id

## 🚨 중요한 제약조건
- **likes 테이블**: UNIQUE(product_id, user_id) - 중복 좋아요 방지
- **현실적 데이터**: 본인 상품 좋아요 안함, 상품 생성일 이후 좋아요

이제 FK 매핑 작업 없이 바로 import 가능합니다! 🎉
