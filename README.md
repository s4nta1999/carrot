# 🥕 당근마켓 클론 프로젝트

Next.js + Supabase로 구현한 당근마켓 클론 앱

## 📁 프로젝트 구조

```
carrot/
├── 📚 docs/                     # 문서
│   └── supabase-storage-setup.md # Supabase Storage 설정 가이드
│
├── 🗄️ supabase-complete-reset.sql # 완전한 데이터베이스 초기화
├── 🗂️ supabase-storage-policies.sql # Storage RLS 정책
│
└── 📱 src/                     # Next.js 앱 소스코드
    ├── app/                    # 앱 라우터
    ├── components/             # React 컴포넌트
    ├── contexts/               # React Context
    ├── hooks/                  # 커스텀 훅
    ├── lib/                    # 유틸리티 함수
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
3. **SQL Editor**에서 `supabase-complete-reset.sql` 실행
   - ✅ **모든 테이블 자동 생성** (위치 기능 포함)
   - ✅ **인덱스, 트리거, RLS 정책** 모두 설정
   - ✅ **한 번에 완전한 데이터베이스 구조 완성**

### 3️⃣ Supabase Storage 설정 (이미지 업로드용)
1. **Storage** → **New Bucket** → `product-images` 생성
2. **SQL Editor**에서 `supabase-storage-policies.sql` 실행
   - ✅ **모든 사용자 업로드/조회/삭제 가능**
   - ✅ **이미지 최적화 및 CDN 지원**

### 4️⃣ 환경 변수 설정
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

### 5️⃣ 개발 서버 실행
```bash
npm run dev
```

## 📊 데이터베이스 구조

### 테이블 관계
```
profiles (사용자 프로필)
  ↓ 1:N
products (상품)
  ↓ 1:N
comments (댓글) + likes (좋아요)
  ↓ 1:N
chat_rooms (채팅방)
  ↓ 1:N
messages (메시지)
```

### 주요 기능
- ✅ **사용자 인증** (Supabase Auth + GitHub OAuth)
- ✅ **상품 CRUD** (등록/수정/삭제)
- ✅ **이미지 업로드** (Supabase Storage)
- ✅ **댓글 시스템** (실시간 업데이트)
- ✅ **좋아요 기능** (실시간 카운트)
- ✅ **실시간 채팅** (읽지 않은 메시지 표시)
- ✅ **위치 기반 서비스** (OpenStreetMap)
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

**🚀 이제 `supabase-complete-reset.sql` 한 파일로 모든 설정이 완료됩니다!**

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
