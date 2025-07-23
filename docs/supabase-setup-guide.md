# 🚀 Supabase 실제 설정 가이드

## 📝 1단계: Supabase 프로젝트 생성

### **Supabase Dashboard 접속**
1. https://supabase.com 접속
2. "Start your project" 클릭
3. GitHub/Google 계정으로 로그인
4. "New project" 클릭

### **프로젝트 설정**
```
Organization: 개인 계정 선택
Project name: carrot-market (또는 원하는 이름)
Database password: 강력한 비밀번호 설정 (기억해두세요!)
Region: Northeast Asia (Seoul) - 한국 서비스용
Pricing: Free tier 선택
```

---

## 🛠️ 2단계: 테이블 생성 (Supabase Dashboard)

### **SQL Editor에서 한번에 생성**

1. **Dashboard → SQL Editor** 이동
2. **"New query"** 클릭  
3. **전체 스키마 복사 붙여넣기**:

```sql
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users 테이블 생성
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  profile_image_url TEXT,
  location_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  temperature DECIMAL(4, 1) DEFAULT 36.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. products 테이블 생성
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(50) DEFAULT '중고거래',
  status VARCHAR(20) DEFAULT 'active',
  location_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_urls JSON DEFAULT '[]'::json,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. comments 테이블 생성
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. likes 테이블 생성
CREATE TABLE likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- 성능 최적화 인덱스 생성
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_location ON products(latitude, longitude);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_comments_product_id ON comments(product_id);
CREATE INDEX idx_likes_product_id ON likes(product_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

4. **"RUN"** 버튼 클릭
5. ✅ **Success!** 메시지 확인

---

## 🔐 3단계: Row Level Security (RLS) 설정

### **자동 정책 생성**
```sql
-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 기본 정책들
-- 1. 모든 사용자 프로필 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT USING (true);

-- 2. 사용자는 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE USING (auth.uid() = id);

-- 3. 모든 활성 상품 조회 가능
CREATE POLICY "Active products are publicly readable"
ON products FOR SELECT USING (status = 'active');

-- 4. 로그인한 사용자는 상품 등록 가능
CREATE POLICY "Authenticated users can insert products"
ON products FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 본인 상품만 수정/삭제 가능
CREATE POLICY "Users can update own products"
ON products FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
ON products FOR DELETE USING (auth.uid() = user_id);

-- 6. 댓글 정책
CREATE POLICY "Comments are publicly readable"
ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE USING (auth.uid() = user_id);

-- 7. 좋아요 정책
CREATE POLICY "Likes are publicly readable"
ON likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage likes"
ON likes FOR ALL USING (auth.uid() = user_id);
```

---

## 📊 4단계: CSV 데이터 Import

### **Dashboard에서 Import**

1. **Table Editor** → **users 테이블** 선택
2. **"Insert"** → **"Import data from CSV"** 클릭
3. **users.csv** 파일 업로드
4. **Column mapping** 확인:
   ```
   CSV Column → Database Column
   email      → email
   name       → name
   phone      → phone
   location_name → location_name
   latitude   → latitude
   longitude  → longitude
   temperature → temperature
   created_at → created_at
   updated_at → updated_at
   ```
5. **"Import"** 클릭

### **products 테이블 Import (중요!)**

⚠️ **주의**: CSV의 `user_email`을 실제 `user_id`로 변환 필요

**방법 1: SQL로 변환**
```sql
-- 1. products 테이블에 임시 컬럼 추가
ALTER TABLE products ADD COLUMN temp_user_email VARCHAR(255);

-- 2. CSV import 시 temp_user_email에 이메일 데이터 넣기
-- (Dashboard에서 user_email → temp_user_email로 매핑)

-- 3. user_id 업데이트
UPDATE products 
SET user_id = users.id 
FROM users 
WHERE products.temp_user_email = users.email;

-- 4. 임시 컬럼 삭제
ALTER TABLE products DROP COLUMN temp_user_email;
```

**방법 2: 미리 변환된 CSV 사용** (추천)
- `generate-csv.js` 스크립트를 수정하여 실제 UUID 사용

---

## 🔑 5단계: Authentication 설정

### **Auth Provider 활성화**
1. **Dashboard → Authentication → Providers**
2. **Email** 활성화 (기본)
3. **Google** 활성화 (선택):
   ```
   Client ID: Google Console에서 발급
   Client Secret: Google Console에서 발급
   ```

### **Auth 정책 확인**
```sql
-- 현재 로그인한 사용자 ID 확인
SELECT auth.uid();

-- users 테이블과 auth.users 연동 확인
SELECT auth.email(), users.* FROM users 
WHERE users.id = auth.uid();
```

---

## 🌐 6단계: API 키 및 환경변수

### **프로젝트 설정에서 복사**
1. **Dashboard → Settings → API**
2. **Project URL** 복사: `https://xxx.supabase.co`
3. **API Keys** 복사:
   - `anon` (public key) - 클라이언트용
   - `service_role` (private key) - 서버용 (주의!)

### **.env.local 파일 생성**
```bash
# /Users/santa/Desktop/carrot/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## ✅ 7단계: 연결 테스트

### **Supabase Client 설치**
```bash
npm install @supabase/supabase-js
```

### **연결 테스트 코드**
```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// 테스트
async function testConnection() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);
    
  if (error) {
    console.error('연결 실패:', error);
  } else {
    console.log('연결 성공:', data);
  }
}
```

---

## 🎯 최종 확인 체크리스트

- [ ] **테이블 생성** 완료 (users, products, comments, likes)
- [ ] **FK 관계** 설정 완료  
- [ ] **인덱스** 생성 완료
- [ ] **RLS 정책** 설정 완료
- [ ] **CSV 데이터** import 완료
- [ ] **Auth Provider** 설정 완료
- [ ] **환경변수** 설정 완료
- [ ] **연결 테스트** 성공

모든 체크리스트 완료하면 **Supabase 연동 준비 완료**! 🚀

---

## 🆘 문제 해결

### **자주 발생하는 오류**

**1. FK 제약조건 오류**
```
해결: users 테이블 먼저 생성 후 products 생성
```

**2. RLS 정책 오류**  
```
해결: 테이블 생성 후 RLS 활성화 및 정책 설정
```

**3. CSV Import 실패**
```
해결: 컬럼명 매핑 확인, 데이터 타입 일치 확인
```

이 가이드대로 하면 완벽한 Supabase 설정이 완성됩니다! 🎉 