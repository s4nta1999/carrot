// 상품 타입
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  timeAgo: string;
  image: string;
  likes?: number;
  comments?: number;
}

// 댓글 타입
export interface Comment {
  id: number;
  author: string;
  content: string;
  time: string;
}

// 상품 생성 타입 (id, location, timeAgo 등 자동 생성 필드 제외)
export type CreateProductData = Omit<Product, 'id' | 'location' | 'timeAgo' | 'likes' | 'comments'>;

// 검색 관련 타입
export interface SearchState {
  keyword: string;
  isVisible: boolean;
}

// Context 타입
export interface ProductContextType {
  products: Product[];
  addProduct: (product: CreateProductData) => void;
} 