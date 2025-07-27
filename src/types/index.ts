// 공통 타입
export type UUID = string;
export type Timestamp = string;

// 사용자 프로필 타입
export interface Profile {
  id: UUID;
  username: string | null;
  avatar_url: string | null;
  location: string;
  temperature: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  // 위치 정보
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  district?: string | null;
  city?: string | null;
  is_location_set?: boolean;
}

// 상품 상태 타입
export type ProductStatus = 'active' | 'sold' | 'reserved';

// 상품 타입
export interface Product {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string | null;
  price: number;
  location: string;
  image_url: string | null;
  status: ProductStatus;
  likes_count: number;
  views_count: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  // 조인된 데이터
  profiles?: Profile;
}

// 댓글 타입
export interface Comment {
  id: string; // UUID
  user_id: string; // UUID
  product_id: string; // UUID
  content: string;
  created_at: string;
  updated_at: string;
  // 조인된 데이터
  profiles?: Profile;
}

// 좋아요 타입
export interface Like {
  id: string; // UUID
  user_id: string; // UUID
  product_id: string; // UUID
  created_at: string;
}

// 채팅방 타입
export interface ChatRoom {
  id: string; // UUID
  product_id: string; // UUID
  buyer_id: string; // UUID
  seller_id: string; // UUID
  created_at: string;
  // 조인된 데이터
  products?: Product;
  buyer_profile?: Profile;
  seller_profile?: Profile;
  last_message?: Message;
}

// 메시지 타입
export interface Message {
  id: string; // UUID
  chat_room_id: string; // UUID
  sender_id: string; // UUID
  content: string;
  is_read: boolean;
  created_at: string;
  // 조인된 데이터
  profiles?: Profile;
}

// 상품 생성 타입
export type CreateProductData = {
  title: string;
  description: string;
  price: number;
  image_url?: string;
};

// 검색 관련 타입
export interface SearchState {
  keyword: string;
  isVisible: boolean;
}

// Context 타입들
export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: (userLocation?: string) => Promise<void>;
  addProduct: (product: CreateProductData) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export interface ChatContextType {
  chatRooms: ChatRoom[];
  currentMessages: Message[];
  loading: boolean;
  error: string | null;
  fetchChatRooms: () => Promise<void>;
  fetchMessages: (chatRoomId: string) => Promise<void>;
  createChatRoom: (productId: string) => Promise<{ success: boolean; chatRoom?: ChatRoom; error?: string }>;
  sendMessage: (chatRoomId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  markAsRead: (messageId: string) => Promise<void>;
  getUnreadMessagesCount: () => number;
}

// 유틸리티 타입
export interface TimeAgo {
  timeAgo: string;
} 