import { Product } from '@/types';
import Link from 'next/link';
import { getTimeAgo, formatPrice } from '@/lib/utils';
import OptimizedImage from './OptimizedImage';
import { memo } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="block">
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
        {/* 상품 이미지 */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
          <OptimizedImage
            src={product.image_url || '/images/placeholder.svg'}
            alt={product.title}
            width={80}
            height={80}
            className="w-full h-full"
            sizes="80px"
          />
        </div>
        
        {/* 상품 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 dark:text-white font-medium mb-1 truncate">
            {product.title}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{product.profiles?.location || product.location || '위치 정보 없음'}</span>
            <span>•</span>
            <span>{getTimeAgo(product.created_at)}</span>
          </div>
          
          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {formatPrice(product.price)}
          </p>
          
          {/* 좋아요 및 조회수 */}
          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
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
});

export default ProductCard; 