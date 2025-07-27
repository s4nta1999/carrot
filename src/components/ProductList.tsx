import Link from 'next/link';
import ProductCard from './ProductCard';
import { Product } from '@/types';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  // 상품이 없을 때
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          등록된 상품이 없습니다.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          첫 번째 상품을 등록해보세요!
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 상품 리스트 */}
      {products.map(product => (
        <Link href={`/products/${product.id}`} key={product.id}>
          <ProductCard product={product} />
        </Link>
      ))}
    </>
  );
} 