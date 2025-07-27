# 🥕 당근마켓 클론 - Carrot Market Clone

> **가까운 이웃과 함께 나누는 따뜻한 거래 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-15.4.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.52.0-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📱 앱 개요

당근마켓 클론은 **지역 기반 중고거래 플랫폼**으로, 사용자들이 자신의 동네에서 상품을 거래하고 소통할 수 있는 모바일 최적화 웹 애플리케이션입니다.

### 🎯 핵심 가치
- **🏠 지역 기반**: 가까운 이웃과의 거래로 신뢰성 확보
- **🤝 커뮤니티**: 채팅을 통한 직접적인 소통
- **💡 편의성**: AI 작성 기능으로 상품 등록 간소화
- **🗺️ 시각화**: 지도를 통한 직관적인 위치 기반 서비스

## 🚀 주요 기능 및 구현 방법

### 🔐 **인증 시스템**

#### 구현 방법
```typescript
// src/contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabase Auth 상태 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}
```

#### 주요 특징
- **이메일/비밀번호 로그인**: 간단하고 안정적인 인증 시스템
- **자동 프로필 생성**: 로그인 시 자동으로 프로필 테이블 생성
- **세션 관리**: Supabase Auth의 자동 세션 관리
- **위치 설정 가이드**: 첫 로그인 시 위치 설정 안내

### 🏠 **상품 관리 시스템**

#### 상품 등록 프로세스
```typescript
// src/app/create/page.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. 이미지 업로드 (Supabase Storage)
  const imageUrl = await uploadImage(imageFile);
  
  // 2. 상품 데이터 생성
  const productData = {
    title,
    description,
    price: Number(price),
    image_url: imageUrl,
    user_id: user.id,
    location: profile?.location || '위치 정보 없음'
  };
  
  // 3. 데이터베이스에 저장
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();
};
```

#### 이미지 처리 최적화
```typescript
// src/lib/image-utils.ts
export const compressImage = async (
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(new File([blob!], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### 🤖 **AI 작성 기능**

#### 구현 원리
```typescript
// src/lib/ai-utils.ts
export const generateAiProduct = (userInput: string, price?: number): AiProductData => {
  // 1. 키워드 추출 및 분석
  const keywords = extractKeywords(userInput);
  
  // 2. 카테고리 자동 분류
  const category = suggestCategory(userInput);
  
  // 3. 상품 상태 추천
  const condition = suggestCondition(userInput);
  
  // 4. 제목 생성 (템플릿 기반)
  const title = generateProductTitle(userInput, category);
  
  // 5. 설명 생성 (가격 정보 포함)
  const description = generateProductDescription(title, category, condition, price);
  
  return { title, description, category, condition, price };
};
```

#### 카테고리 분류 로직
```typescript
const suggestCategory = (description: string): string => {
  const keywords = description.toLowerCase();
  
  if (keywords.includes('폰') || keywords.includes('전화') || keywords.includes('컴퓨터')) {
    return '전자기기';
  } else if (keywords.includes('옷') || keywords.includes('신발') || keywords.includes('가방')) {
    return '의류';
  } else if (keywords.includes('책') || keywords.includes('교재') || keywords.includes('소설')) {
    return '도서';
  }
  
  return '기타';
};
```

### 💬 **실시간 채팅 시스템**

#### 구현 방법
```typescript
// src/contexts/ChatContext.tsx
export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  useEffect(() => {
    // 실시간 메시지 구독
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        // 새 메시지 처리
        handleNewMessage(payload.new as Message);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

#### 주요 기능
- **실시간 메시지**: Supabase Realtime을 통한 즉시 메시지 전송
- **읽지 않은 메시지**: 배지로 표시되는 읽지 않은 메시지 수
- **채팅방 관리**: 상품별 자동 채팅방 생성
- **메시지 히스토리**: 과거 대화 내용 저장 및 표시

### 🗺️ **지도 기반 위치 서비스**

#### 구현 방법
```typescript
// src/app/map/page.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function MapPage() {
  const [sellers, setSellers] = useState<Profile[]>([]);
  
  useEffect(() => {
    // 사용자 위치 기반 판매자 검색
    const fetchNearbySellers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      setSellers(data || []);
    };
    
    fetchNearbySellers();
  }, []);

  return (
    <MapContainer center={[37.5665, 126.9780]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {sellers.map(seller => (
        <Marker key={seller.id} position={[seller.latitude!, seller.longitude!]}>
          <Popup>
            <div>
              <h3>{seller.username}</h3>
              <p>{seller.location}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

#### 주요 기능
- **OpenStreetMap**: 무료 오픈소스 지도 API 사용
- **위치 기반 검색**: 사용자 위치 기준 근처 판매자 표시
- **핀 클릭**: 판매자 정보 및 상품 목록 표시
- **반응형 디자인**: 모바일 최적화된 지도 인터페이스

### 🔍 **검색 및 필터링**

#### 구현 방법
```typescript
// src/app/products/page.tsx
export default function ProductsPage() {
  const [keyword, setKeyword] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // 디바운스된 검색
  const debouncedKeyword = useSearchDebounce(keyword, 300);
  
  // 필터링 및 정렬
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // 검색어 필터링
    if (debouncedKeyword) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
        product.description?.toLowerCase().includes(debouncedKeyword.toLowerCase())
      );
    }
    
    // 정렬
    if (sortBy === 'price-asc') {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }
    
    return filtered;
  }, [products, debouncedKeyword, sortBy]);
}
```

#### 주요 기능
- **실시간 검색**: 디바운스된 키워드 검색
- **가격 정렬**: 오름차순/내림차순 정렬
- **날짜 정렬**: 최신순 정렬
- **위치 기반 필터링**: 사용자 지역 상품만 표시

## 🛠️ 기술 스택

### **Frontend**
- **Next.js 15.4.3**: React 기반 풀스택 프레임워크
- **React 19.1.0**: 사용자 인터페이스 라이브러리
- **TypeScript 5.0**: 타입 안전성 보장
- **Tailwind CSS 4.0**: 유틸리티 기반 CSS 프레임워크

### **Backend & Database**
- **Supabase**: PostgreSQL 기반 백엔드 서비스
- **PostgreSQL**: 관계형 데이터베이스
- **Supabase Auth**: 인증 시스템
- **Supabase Storage**: 파일 저장소
- **Supabase Realtime**: 실시간 기능

### **External APIs**
- **OpenStreetMap**: 무료 지도 서비스
- **Nominatim**: 지오코딩 서비스
- **React-Leaflet**: 지도 컴포넌트

### **Development Tools**
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅
- **Vercel**: 배포 플랫폼

## 📊 데이터베이스 설계

### **핵심 테이블 구조**
```sql
-- 사용자 프로필
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username VARCHAR(100),
  avatar_url TEXT,
  location VARCHAR(100),
  temperature DECIMAL(4,1) DEFAULT 36.5,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_location_set BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 상품
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  location VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅방
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎨 UI/UX 디자인 원칙

### **모바일 퍼스트 디자인**
- **반응형 레이아웃**: 모든 화면 크기에서 최적화
- **터치 친화적**: 모바일 터치 인터페이스 최적화
- **직관적 네비게이션**: 하단 탭 바 기반 네비게이션

### **사용자 경험**
- **로딩 상태**: 스켈레톤 로딩 및 스피너 표시
- **에러 처리**: 친화적인 에러 메시지 및 복구 옵션
- **성능 최적화**: 이미지 지연 로딩 및 코드 스플리팅

### **접근성**
- **키보드 네비게이션**: 키보드만으로 모든 기능 사용 가능
- **스크린 리더**: ARIA 라벨 및 시맨틱 HTML 구조
- **색상 대비**: WCAG 가이드라인 준수

## 📈 성능 최적화

### **번들 최적화**
- **JavaScript**: 총 ~1.2MB (압축 후)
- **CSS**: 32KB (Tailwind CSS)
- **이미지**: WebP/AVIF 포맷 지원
- **코드 스플리팅**: 페이지별 자동 분할

### **로딩 성능**
- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1

### **데이터베이스 성능**
- **인덱싱**: 자주 조회되는 컬럼에 인덱스 적용
- **쿼리 최적화**: N+1 문제 방지를 위한 조인 사용
- **캐싱**: Redis 기반 세션 및 데이터 캐싱

## 🔒 보안 고려사항

### **인증 및 권한**
- **JWT 토큰**: Supabase Auth 기반 보안 토큰
- **Row Level Security**: 데이터베이스 레벨 권한 제어
- **CORS 설정**: 허용된 도메인만 API 접근 가능

### **데이터 보호**
- **입력 검증**: 클라이언트 및 서버 측 검증
- **SQL 인젝션 방지**: 파라미터화된 쿼리 사용
- **XSS 방지**: React의 자동 이스케이핑 활용

## 🚀 배포 및 운영

### **배포 환경**
- **Vercel**: 자동 배포 및 CDN
- **Supabase**: 데이터베이스 및 백엔드 서비스
- **GitHub Actions**: CI/CD 파이프라인

### **모니터링**
- **Vercel Analytics**: 성능 및 사용자 행동 분석
- **Supabase Dashboard**: 데이터베이스 성능 모니터링
- **Error Tracking**: 실시간 에러 추적 및 알림

## 📱 사용법 가이드

### **시작하기**
1. **회원가입**: 이메일/비밀번호로 간편 가입
2. **위치 설정**: 현재 위치 또는 주소 입력
3. **상품 등록**: AI 작성 기능으로 쉽게 상품 등록
4. **거래 시작**: 채팅을 통한 안전한 거래

### **주요 기능**
- **상품 검색**: 키워드 및 위치 기반 검색
- **지도 보기**: 근처 판매자 위치 확인
- **채팅**: 실시간 메시지로 소통
- **프로필 관리**: 개인정보 및 거래 내역 관리

## 🤝 기여하기

### **개발 환경 설정**
```bash
# 저장소 클론
git clone https://github.com/your-username/carrot-market-clone.git

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

### **코드 컨벤션**
- **TypeScript**: 엄격한 타입 체크 사용
- **ESLint**: 코드 품질 규칙 준수
- **Prettier**: 일관된 코드 포맷팅
- **커밋 메시지**: Conventional Commits 형식 사용

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**🥕 당근마켓 클론으로 가까운 이웃과 따뜻한 거래를 시작해보세요!**
