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
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);
}
```

#### 주요 특징
- **GitHub OAuth**: 소셜 로그인으로 간편한 가입
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
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('아이폰') || lowerDesc.includes('갤럭시') || 
      lowerDesc.includes('노트북') || lowerDesc.includes('컴퓨터')) {
    return '전자기기';
  }
  
  if (lowerDesc.includes('의자') || lowerDesc.includes('테이블') || 
      lowerDesc.includes('소파') || lowerDesc.includes('가구')) {
    return '가구';
  }
  
  // ... 더 많은 분류 로직
  return '기타';
};
```

### 💬 **실시간 채팅 시스템**

#### Supabase Realtime 구현
```typescript
// src/contexts/ChatContext.tsx
useEffect(() => {
  // 1. 채팅방 목록 실시간 구독
  const channel = supabase
    .channel('chat_rooms')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chat_rooms' },
      (payload) => {
        // 채팅방 목록 업데이트
        handleChatRoomUpdate(payload);
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => {
        // 메시지 실시간 업데이트
        handleMessageUpdate(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

#### 읽지 않은 메시지 관리
```typescript
// src/hooks/useNotifications.ts
export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  const markAsRead = async (chatRoomId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('chat_room_id', chatRoomId)
      .eq('sender_id', '!=', user.id);
      
    // 읽지 않은 메시지 카운트 업데이트
    updateUnreadCount();
  };
  
  return { unreadCount, markAsRead };
};
```

### 🗺️ **지도 기반 서비스**

#### OpenStreetMap + Leaflet 구현
```typescript
// src/app/map/page.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  
  // 1. 사용자 위치 기반 상품 필터링
  const nearbyProducts = useMemo(() => {
    return products.filter(product => {
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        product.profiles?.latitude, product.profiles?.longitude
      );
      return distance <= 5; // 5km 이내
    });
  }, [products, userLocation]);
  
  return (
    <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {nearbyProducts.map(product => (
        <Marker
          key={product.id}
          position={[product.profiles?.latitude!, product.profiles?.longitude!]}
        >
          <Popup>
            <ProductCard product={product} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

#### 거리 계산 알고리즘
```typescript
// src/lib/utils.ts
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // km 단위
};
```

### 🔍 **검색 및 필터링 시스템**

#### 디바운스 검색 구현
```typescript
// src/hooks/useDebounce.ts
export function useSearchDebounce(searchTerm: string, delay: number = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchTerm);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return debouncedValue;
}
```

#### 정렬 및 필터링 로직
```typescript
// src/app/products/page.tsx
const sortedProducts = useMemo(() => {
  let filtered = products.filter(product =>
    product.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(debouncedKeyword.toLowerCase()))
  );

  // 정렬 로직
  switch (sortType) {
    case 'price_asc':
      return filtered.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return filtered.sort((a, b) => b.price - a.price);
    case 'latest':
      return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'popular':
      return filtered.sort((a, b) => b.likes_count - a.likes_count);
    default:
      return filtered;
  }
}, [products, debouncedKeyword, sortType]);
```

### 📱 **모바일 최적화**

#### 반응형 레이아웃
```typescript
// src/components/MobileLayout.tsx
export default function MobileLayout({ children, title, showBackButton }: MobileLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* 고정 헤더 */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {showBackButton && (
              <button onClick={() => router.back()} className="p-2 mr-2">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          </div>
        </div>
      </header>
      
      {/* 스크롤 가능한 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-white">
        {children}
      </main>
      
      {/* 고정 하단 네비게이션 */}
      <nav className="bg-white border-t border-gray-200 flex-shrink-0">
        {/* 네비게이션 아이템들 */}
      </nav>
    </div>
  );
}
```

#### 터치 최적화
```css
/* 터치 영역 최적화 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* 터치 피드백 */
.touch-feedback:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

/* 스크롤 최적화 */
.smooth-scroll {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

## 🗄️ 데이터베이스 설계

### 테이블 구조
```sql
-- 사용자 프로필
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT,
  avatar_url TEXT,
  location TEXT NOT NULL,
  temperature DECIMAL(3,1) DEFAULT 36.5,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  district TEXT,
  city TEXT,
  is_location_set BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 상품
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved')),
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 채팅방
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 인덱스 최적화
```sql
-- 검색 성능 향상
CREATE INDEX idx_products_title ON products USING gin(to_tsvector('korean', title));
CREATE INDEX idx_products_location ON products(location);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- 채팅 성능 향상
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
```

## 🔧 기술적 구현 세부사항

### 상태 관리 아키텍처
```typescript
// Context 기반 상태 관리
const AppState = {
  Auth: AuthContext,      // 사용자 인증 상태
  Product: ProductContext, // 상품 목록 및 필터링
  Chat: ChatContext       // 채팅 상태 및 메시지
};
```

### 성능 최적화 전략
1. **메모이제이션**: React.memo, useMemo, useCallback 활용
2. **이미지 최적화**: WebP/AVIF 포맷, lazy loading
3. **코드 분할**: 동적 임포트로 번들 크기 최적화
4. **캐싱**: 브라우저 캐시 및 Supabase 캐싱 활용

### 보안 구현
1. **Row Level Security (RLS)**: 데이터베이스 레벨 보안
2. **입력 검증**: 클라이언트/서버 양쪽 검증
3. **XSS 방지**: React의 자동 이스케이핑
4. **CSRF 방지**: Supabase Auth의 토큰 기반 인증

## 🎨 UI/UX 설계 원칙

### 모바일 퍼스트 디자인
- **터치 친화적**: 최소 44px 터치 영역
- **스와이프 제스처**: 자연스러운 네비게이션
- **하단 네비게이션**: 엄지손가락 접근성 고려
- **로딩 상태**: 스켈레톤 UI 및 스피너

### 색상 및 타이포그래피
```css
/* 브랜드 컬러 */
:root {
  --primary: #ff6b35;     /* 당근마켓 오렌지 */
  --secondary: #f8f9fa;   /* 배경색 */
  --text-primary: #212529; /* 주요 텍스트 */
  --text-secondary: #6c757d; /* 보조 텍스트 */
}

/* 타이포그래피 */
.font-display { font-family: 'Pretendard', sans-serif; }
.font-body { font-family: 'Pretendard', sans-serif; }
```

## 📊 성능 지표 (실제 측정값)

### 번들 크기 (실제 빌드 결과)
- **JavaScript 총 크기**: ~1.2MB (압축 전)
  - **Framework**: 180KB (Next.js + React)
  - **Main Bundle**: 116KB (앱 메인 로직)
  - **Polyfills**: 112KB (브라우저 호환성)
  - **기타 청크들**: ~800KB (기능별 분할)
- **CSS**: 32KB (Tailwind CSS 최적화)
- **이미지**: WebP/AVIF 자동 변환 지원

### 코드 분할 최적화
- **메인 번들**: 116KB (핵심 기능)
- **기능별 분할**: 12-60KB (페이지별 지연 로딩)
- **공통 라이브러리**: 180KB (React, Next.js)

### 성능 목표 (기준값)
- **First Contentful Paint**: < 1.5초
- **Largest Contentful Paint**: < 2.5초
- **Cumulative Layout Shift**: < 0.1
- **쿼리 응답 시간**: < 100ms
- **실시간 업데이트**: < 50ms

---

**이 프로젝트는 지속적으로 개선되고 있습니다. 새로운 기능이나 개선사항을 제안해주세요!** 🚀
