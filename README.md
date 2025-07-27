# 🥕 당근마켓 클론 - Carrot Market Clone

> **가까운 이웃과 함께 나누는 따뜻한 거래 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.52.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📱 프로젝트 개요

당근마켓 클론은 **Next.js 15**, **React 19**, **TypeScript**, **Supabase**를 활용하여 구축된 모던 웹 애플리케이션입니다. 사용자들이 지역 기반으로 상품을 거래하고 소통할 수 있는 플랫폼을 제공합니다.

### ✨ 주요 특징

- 🏠 **지역 기반 상품 거래**
- 🤖 **AI 작성 기능** (제목/설명 자동 생성)
- 💬 **실시간 채팅 시스템**
- 🗺️ **인터랙티브 지도**
- 📱 **모바일 최적화 UI**
- 🔐 **Supabase 인증 시스템**
- ⚡ **실시간 업데이트**

## 🚀 기술 스택

### Frontend
- **Next.js 15.4.3** - React 프레임워크
- **React 19.1.0** - UI 라이브러리
- **TypeScript 5.0** - 타입 안전성
- **Tailwind CSS 4.0** - 스타일링
- **React Leaflet** - 지도 컴포넌트

### Backend & Database
- **Supabase** - 백엔드 서비스
  - PostgreSQL 데이터베이스
  - 실시간 구독
  - 인증 시스템
  - 파일 스토리지
- **Supabase Auth UI** - 로그인/회원가입

### Development Tools
- **ESLint** - 코드 품질
- **Turbopack** - 빠른 개발 서버
- **Vercel** - 배포 플랫폼

## 📋 기능 목록

### 🔐 인증 시스템
- [x] GitHub OAuth 로그인
- [x] 자동 프로필 생성
- [x] 위치 설정 가이드

### 🏠 상품 관리
- [x] 상품 등록/수정/삭제
- [x] 이미지 업로드 (Supabase Storage)
- [x] 가격 설정 및 나눔 기능
- [x] 상품 상태 관리 (판매중/예약중/판매완료)

### 🔍 검색 및 필터링
- [x] 상품명 검색
- [x] 가격순/최신순/인기순 정렬
- [x] 지역 기반 필터링
- [x] 실시간 검색 결과

### 🤖 AI 작성 기능
- [x] AI 제목 자동 생성
- [x] AI 설명 자동 생성
- [x] 자동 카테고리 분류
- [x] 상품 상태 추천

### 💬 채팅 시스템
- [x] 실시간 메시지 송수신
- [x] 읽지 않은 메시지 알림
- [x] 채팅방 목록 관리
- [x] 메시지 읽음 표시

### 🗺️ 지도 기능
- [x] OpenStreetMap 기반 지도
- [x] 상품 위치 핀 표시
- [x] 판매자 위치 기반 필터링
- [x] 지도 클릭 시 상품 목록

### 📱 사용자 경험
- [x] 반응형 모바일 디자인
- [x] 다크모드 지원 (제거됨)
- [x] 로딩 상태 표시
- [x] 에러 처리 및 사용자 피드백
- [x] 사용법 가이드 페이지

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Supabase 프로젝트

### 1. 저장소 클론
```bash
git clone https://github.com/s4nta1999/carrot.git
cd carrot
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub OAuth (선택사항)
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
```

### 4. 데이터베이스 설정
Supabase SQL Editor에서 `supabase-complete-reset.sql` 파일의 내용을 실행하세요.

### 5. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📊 프로젝트 구조

```
carrot/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── chat/              # 채팅 페이지
│   │   ├── create/            # 상품 등록 페이지
│   │   ├── guide/             # 사용법 가이드
│   │   ├── location-setup/    # 위치 설정 페이지
│   │   ├── map/               # 지도 페이지
│   │   ├── notifications/     # 알림 페이지
│   │   ├── products/          # 상품 목록/상세 페이지
│   │   ├── profile/           # 프로필 페이지
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── AuthPage.tsx       # 인증 페이지
│   │   ├── ChatList.tsx       # 채팅 목록
│   │   ├── ChatRoom.tsx       # 채팅방
│   │   ├── MobileLayout.tsx   # 모바일 레이아웃
│   │   ├── OptimizedImage.tsx # 최적화된 이미지
│   │   ├── ProductCard.tsx    # 상품 카드
│   │   ├── ProductList.tsx    # 상품 목록
│   │   └── ...
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx    # 인증 상태 관리
│   │   ├── ChatContext.tsx    # 채팅 상태 관리
│   │   └── ProductContext.tsx # 상품 상태 관리
│   ├── hooks/                 # 커스텀 훅
│   │   ├── useComments.ts     # 댓글 관리
│   │   ├── useDebounce.ts     # 디바운스 훅
│   │   ├── useLikes.ts        # 좋아요 관리
│   │   ├── useLocalStorage.ts # 로컬 스토리지 훅
│   │   └── useNotifications.ts # 알림 관리
│   ├── lib/                   # 유틸리티 함수
│   │   ├── ai-utils.ts        # AI 작성 기능
│   │   ├── image-utils.ts     # 이미지 처리
│   │   ├── supabase.js        # Supabase 클라이언트
│   │   ├── supabase-storage.js # 스토리지 유틸리티
│   │   └── utils.ts           # 공통 유틸리티
│   └── types/                 # TypeScript 타입 정의
│       └── index.ts           # 공통 타입
├── docs/                      # 문서
├── public/                    # 정적 파일
└── ...
```

## 🤖 AI 기능 상세

### AI 작성 기능
- **키워드 기반 분석**: 상품 설명에서 주요 키워드 추출
- **카테고리 자동 분류**: 전자기기, 의류, 가구, 도서 등
- **상태 추천**: 새상품, 거의새상품, 좋음, 보통, 사용감있음
- **템플릿 기반 생성**: 전문적인 상품 설명 자동 생성

### 사용 예시
```
입력: "아이폰 13 새상품 팔아요"
결과: 
- 제목: "📱 좋은 아이폰"
- 카테고리: 전자기기
- 상태: 새상품
- 설명: "안녕하세요! 📱 좋은 아이폰 판매합니다..."
```

## 🗺️ 지도 기능

### OpenStreetMap 통합
- **무료 지도 서비스**: OpenStreetMap 기반
- **실시간 위치 표시**: 판매자 위치 기반 핀 표시
- **인터랙티브 지도**: 클릭 시 상품 목록 표시
- **반응형 디자인**: 모바일 최적화

## 💬 채팅 시스템

### 실시간 통신
- **Supabase Realtime**: 실시간 메시지 송수신
- **읽음 표시**: 메시지 읽음 상태 관리
- **알림 시스템**: 읽지 않은 메시지 카운트
- **채팅방 관리**: 자동 채팅방 생성 및 관리

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 🚀 배포

### Vercel 배포 (권장)
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정
3. 자동 배포 활성화

### 수동 배포
```bash
npm run build
npm start
```

## 📱 모바일 최적화

- **PWA 준비**: 모바일 앱과 유사한 경험
- **터치 친화적**: 모바일 터치 인터페이스
- **반응형 디자인**: 모든 화면 크기 지원
- **성능 최적화**: 빠른 로딩 및 부드러운 애니메이션

## 🔒 보안

- **Supabase RLS**: Row Level Security
- **인증 시스템**: GitHub OAuth
- **입력 검증**: 클라이언트/서버 양쪽 검증
- **보안 헤더**: XSS, CSRF 방지

## 📈 성능 최적화

- **이미지 최적화**: WebP/AVIF 포맷 지원
- **코드 분할**: 동적 임포트
- **캐싱 전략**: 브라우저 캐시 활용
- **번들 최적화**: Tree shaking 및 압축

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

---

**⭐ 이 프로젝트가 도움이 되었다면 스타를 눌러주세요!**
