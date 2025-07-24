# 🥕 당근마켓 클론 프로젝트

Next.js + Supabase로 구현한 당근마켓 클론 앱

## 📁 프로젝트 구조

```
carrot/
├── 📊 data/                     # 데이터베이스 데이터
│   ├── users-uuid.csv           # 사용자 데이터 (50명)
│   ├── products-uuid.csv        # 상품 데이터 (100개)
│   ├── comments-uuid.csv        # 댓글 데이터 (249개)
│   └── likes-uuid.csv           # 좋아요 데이터 (977개)
│
├── 📚 docs/                     # 문서
│   ├── database-schema.md       # 데이터베이스 테이블 명세서
│   ├── supabase-setup-guide.md  # Supabase 설정 가이드
│   └── uuid-import-guide.md     # CSV Import 가이드
│
├── 🛠️ scripts/                 # 유틸리티 스크립트
│   └── generate-csv-with-uuid.js # 토이 데이터 생성 스크립트
│
├── 🗄️ supabase-schema.sql      # 데이터베이스 스키마
│
└── 📱 src/                     # Next.js 앱 소스코드
    ├── app/                    # 앱 라우터
    ├── components/             # React 컴포넌트
    ├── contexts/               # React Context
    └── types/                  # TypeScript 타입
```

## 🚀 빠른 시작

### 1️⃣ 프로젝트 설치
```bash
npm install
```

### 2️⃣ Supabase 설정
1. [Supabase Dashboard](https://supabase.com) 접속
2. 새 프로젝트 생성
3. **SQL Editor**에서 `supabase-schema.sql` 실행
4. **Table Editor**에서 CSV 파일들 순서대로 import:
   ```
   data/users-uuid.csv      → users 테이블
   data/products-uuid.csv   → products 테이블  
   data/comments-uuid.csv   → comments 테이블
   data/likes-uuid.csv      → likes 테이블
   ```

### 3️⃣ 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**✨ 지도 기능은 완전 무료 오픈소스(OpenStreetMap + Leaflet)를 사용합니다!**
- ✅ API 키 불필요
- ✅ 사용량 제한 없음  
- ✅ 완전 무료

### 4️⃣ 개발 서버 실행
```bash
npm run dev
```

## 📊 데이터베이스 구조

### 테이블 관계
```
users (50명)
  ↓ 1:N
products (100개)
  ↓ 1:N
comments (249개) + likes (977개)
```

### 주요 기능
- ✅ **사용자 인증** (Supabase Auth)
- ✅ **상품 CRUD** (등록/수정/삭제)
- ✅ **댓글 시스템**
- ✅ **좋아요 기능**
- ✅ **위치 기반 필터링**
- ✅ **반응형 디자인** (모바일 최적화)
- ✅ **다크 테마**

## 🎯 핵심 특징

### 📱 **모바일 퍼스트 디자인**
- 당근마켓과 동일한 UX/UI
- 고정 헤더/푸터 네비게이션
- 터치 친화적 인터페이스

### 🔗 **완벽한 데이터 관계**
- UUID 기반 PK/FK 구조
- 데이터 무결성 보장
- Row Level Security (RLS) 적용

### 🎨 **현대적 기술 스택**
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## 📋 상세 가이드

자세한 설정 및 사용법은 `docs/` 폴더의 문서들을 참고하세요:

- **[데이터베이스 명세서](docs/database-schema.md)** - 테이블 구조 및 관계
- **[Supabase 설정 가이드](docs/supabase-setup-guide.md)** - 단계별 설정 방법
- **[CSV Import 가이드](docs/uuid-import-guide.md)** - 데이터 import 순서

## 🛠️ 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린팅
npm run lint

# 새 토이 데이터 생성
node scripts/generate-csv-with-uuid.js
```

## 📝 라이센스

MIT License

---

**🎯 완벽한 당근마켓 클론을 경험해보세요!** 🥕
