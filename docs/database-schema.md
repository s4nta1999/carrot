# 🗄️ Supabase 데이터베이스 테이블 명세서

## 📊 전체 테이블 구조 및 관계도

```
┌─────────────┐    1:N     ┌─────────────┐    1:N     ┌─────────────┐
│   users     │────────────│  products   │────────────│  comments   │
│             │            │             │            │             │
│ PK: id(UUID)│            │ PK: id(UUID)│            │ PK: id(UUID)│
│             │            │ FK: user_id │            │ FK: product_id│
└─────────────┘            │             │            │ FK: user_id │
       │                   └─────────────┘            └─────────────┘
       │ 1:N                       │ 1:N
       │                           │
       │                   ┌─────────────┐
       └───────────────────│    likes    │
                           │             │
                           │ PK: id(UUID)│
                           │ FK: product_id│
                           │ FK: user_id │
                           └─────────────┘
```

---

## 📋 테이블별 상세 명세

### 1️⃣ **users** 테이블 (사용자)

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|-------------|----------|------|
| **id** | `UUID` | **PK**, `DEFAULT uuid_generate_v4()` | 사용자 고유 ID |
| **email** | `VARCHAR(255)` | **UNIQUE**, **NOT NULL** | 이메일 (로그인용) |
| **name** | `VARCHAR(100)` | **NOT NULL** | 사용자 이름 |
| **phone** | `VARCHAR(20)` | `NULL` | 전화번호 |
| **profile_image_url** | `TEXT` | `NULL` | 프로필 이미지 URL |
| **location_name** | `VARCHAR(100)` | **NOT NULL** | 동네명 (합정동, 망원동 등) |
| **latitude** | `DECIMAL(10,8)` | `NULL` | 위도 (37.548700) |
| **longitude** | `DECIMAL(11,8)` | `NULL` | 경도 (126.913500) |
| **temperature** | `DECIMAL(4,1)` | `DEFAULT 36.5` | 매너온도 (36.0~99.9) |
| **created_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 가입일시 |
| **updated_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 수정일시 |

**인덱스**:
- `users_pkey` ON (id) - Primary Key
- `users_email_key` ON (email) - Unique

---

### 2️⃣ **products** 테이블 (상품)

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|-------------|----------|------|
| **id** | `UUID` | **PK**, `DEFAULT uuid_generate_v4()` | 상품 고유 ID |
| **user_id** | `UUID` | **FK → users(id)**, **NOT NULL** | 판매자 ID |
| **title** | `VARCHAR(200)` | **NOT NULL** | 상품 제목 |
| **description** | `TEXT` | `NULL` | 상품 설명 |
| **price** | `INTEGER` | **NOT NULL**, `DEFAULT 0` | 가격 (0=나눔) |
| **category** | `VARCHAR(50)` | `DEFAULT '중고거래'` | 카테고리 |
| **status** | `VARCHAR(20)` | `DEFAULT 'active'` | 상태 (active/sold/reserved/deleted) |
| **location_name** | `VARCHAR(100)` | **NOT NULL** | 거래 동네 |
| **latitude** | `DECIMAL(10,8)` | `NULL` | 상품 위치 위도 |
| **longitude** | `DECIMAL(11,8)` | `NULL` | 상품 위치 경도 |
| **image_urls** | `JSON` | `DEFAULT '[]'::json` | 이미지 URL 배열 |
| **view_count** | `INTEGER` | `DEFAULT 0` | 조회수 |
| **like_count** | `INTEGER` | `DEFAULT 0` | 좋아요 수 |
| **comment_count** | `INTEGER` | `DEFAULT 0` | 댓글 수 |
| **created_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 등록일시 |
| **updated_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 수정일시 |

**인덱스**:
- `products_pkey` ON (id) - Primary Key
- `idx_products_user_id` ON (user_id) - FK 성능
- `idx_products_location` ON (latitude, longitude) - 위치 검색
- `idx_products_created_at` ON (created_at DESC) - 최신순 정렬
- `idx_products_status` ON (status) - 상태별 필터링

**외래키**:
- `products_user_id_fkey` FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

### 3️⃣ **comments** 테이블 (댓글)

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|-------------|----------|------|
| **id** | `UUID` | **PK**, `DEFAULT uuid_generate_v4()` | 댓글 고유 ID |
| **product_id** | `UUID` | **FK → products(id)**, **NOT NULL** | 상품 ID |
| **user_id** | `UUID` | **FK → users(id)**, **NOT NULL** | 댓글 작성자 ID |
| **content** | `TEXT` | **NOT NULL** | 댓글 내용 |
| **created_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 작성일시 |

**인덱스**:
- `comments_pkey` ON (id) - Primary Key  
- `idx_comments_product_id` ON (product_id) - 상품별 댓글 조회

**외래키**:
- `comments_product_id_fkey` FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
- `comments_user_id_fkey` FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

### 4️⃣ **likes** 테이블 (좋아요)

| 컬럼명 | 데이터 타입 | 제약조건 | 설명 |
|--------|-------------|----------|------|
| **id** | `UUID` | **PK**, `DEFAULT uuid_generate_v4()` | 좋아요 고유 ID |
| **product_id** | `UUID` | **FK → products(id)**, **NOT NULL** | 상품 ID |
| **user_id** | `UUID` | **FK → users(id)**, **NOT NULL** | 사용자 ID |
| **created_at** | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | 좋아요 일시 |

**제약조건**:
- `likes_product_id_user_id_key` UNIQUE (product_id, user_id) - 중복 좋아요 방지

**인덱스**:
- `likes_pkey` ON (id) - Primary Key
- `idx_likes_product_id` ON (product_id) - 상품별 좋아요 조회  
- `idx_likes_user_id` ON (user_id) - 사용자별 좋아요 조회

**외래키**:
- `likes_product_id_fkey` FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
- `likes_user_id_fkey` FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

---

## 🔧 Supabase 설정 순서

### **1단계: 테이블 생성**
```sql
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 테이블 생성 순서 (FK 의존성 고려)
-- 1. users (부모 테이블)
-- 2. products (users 참조)  
-- 3. comments (products, users 참조)
-- 4. likes (products, users 참조)
```

### **2단계: Row Level Security (RLS) 설정**
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
```

### **3단계: 정책(Policy) 설정**
```sql
-- 예시: 상품은 누구나 조회 가능, 본인만 수정 가능
CREATE POLICY "Products are publicly readable"
ON products FOR SELECT USING (true);

CREATE POLICY "Users can update own products"
ON products FOR UPDATE USING (auth.uid() = user_id);
```

### **4단계: 트리거 설정**
```sql
-- 좋아요/댓글 수 자동 업데이트
CREATE TRIGGER update_like_count
AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION update_product_counters();
```

---

## 📈 성능 최적화

### **인덱스 전략**
- **PK/FK**: 자동 인덱스 생성
- **검색 필드**: location, category, status
- **정렬 필드**: created_at, price
- **복합 인덱스**: (latitude, longitude) 위치 검색용

### **쿼리 최적화 예시**
```sql
-- ✅ 좋은 쿼리 (인덱스 활용)
SELECT * FROM products 
WHERE status = 'active' 
ORDER BY created_at DESC 
LIMIT 20;

-- ✅ 위치 기반 검색 (복합 인덱스 활용)  
SELECT * FROM products
WHERE latitude BETWEEN 37.54 AND 37.56
AND longitude BETWEEN 126.90 AND 126.92;
```

---

## 🎯 CSV Import 시 주의사항

### **Import 순서 (FK 제약조건 때문에 순서 중요!)**
1. **users.csv** 먼저 import
2. **products.csv** import (user_id 매핑 필요)
3. **comments.csv** import (product_id, user_id 매핑 필요)
4. **likes.csv** import (있다면)

### **FK 매핑 SQL**
```sql
-- products.csv import 후 user_id 연결
UPDATE products 
SET user_id = users.id 
FROM users 
WHERE products.temp_user_email = users.email;
```

이 명세서대로 설정하면 완벽한 관계형 데이터베이스가 구축됩니다! 🎉 