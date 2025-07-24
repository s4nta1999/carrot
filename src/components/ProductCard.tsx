import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // 시간 경과 계산
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}달 전`;
  };

  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="flex gap-4 p-4 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
        {/* 상품 이미지 */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
          <Image
            src={product.image_url || '/images/placeholder.svg'}
            alt={product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
        
        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-medium mb-1 truncate">
            {product.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{product.location}</span>
            <span>•</span>
            <span>{getTimeAgo(product.created_at)}</span>
          </div>
          
          <p className="text-lg font-bold text-gray-900 mb-2">
            {product.price === 0 ? '나눔' : `${product.price.toLocaleString()}원`}
          </p>
          
          {/* 좋아요 및 조회수 */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{product.likes_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{product.views_count || 0}</span>
            </div>
          </div>
        </div>

        {/* 상품 상태 표시 */}
        {product.status !== 'active' && (
          <div className="flex-shrink-0">
            <span className={`px-2 py-1 text-xs rounded-full ${
              product.status === 'sold' 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-orange-100 text-orange-600'
            }`}>
              {product.status === 'sold' ? '판매완료' : '예약중'}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
} 