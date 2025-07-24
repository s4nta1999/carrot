import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useChat } from '@/contexts/ChatContext';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearchButton?: boolean;
  headerActions?: ReactNode;
  hideBottomNav?: boolean;
}

export default function MobileLayout({ 
  children, 
  title = "당근마켓",
  showBackButton = false,
  showSearchButton = false,
  headerActions,
  hideBottomNav = false
}: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getUnreadMessagesCount } = useChat();

  return (
    <div className="h-screen flex flex-col bg-gray-900 relative overflow-hidden">
      {/* 상단 헤더 - 고정 */}
      <header className="bg-gray-900 border-b border-gray-700 flex-shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {showBackButton ? (
              <button onClick={() => router.back()} className="p-2 mr-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {showSearchButton && (
              <button className="p-2">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            {headerActions}
          </div>
        </div>
      </header>

      {/* 콘텐츠 영역 - 스크롤 가능 */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

            {/* 하단 네비게이션 - 고정 */}
      {!hideBottomNav && (
        <nav className="bg-gray-900 border-t border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-around py-2">
            {/* 홈 */}
            <Link 
              href="/products" 
              className={`flex flex-col items-center py-2 ${
                pathname === '/products' ? 'text-orange-500' : 'text-gray-400'
              }`}
            >
            <svg className="w-6 h-6 mb-1" fill={pathname === '/products' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs">홈</span>
          </Link>
          
          {/* 동네생활 */}
          <button className="flex flex-col items-center py-2 text-gray-400">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="text-xs">동네생활</span>
          </button>
          
          {/* 동네지도 */}
          <Link 
            href="/map" 
            className={`flex flex-col items-center py-2 ${
              pathname === '/map' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <svg 
              className="w-6 h-6 mb-1" 
              fill={pathname === '/map' ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs">동네지도</span>
          </Link>
          
          {/* 채팅 */}
          <Link 
            href="/chat" 
            className={`flex flex-col items-center py-2 relative ${
              pathname === '/chat' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <svg 
              className="w-6 h-6 mb-1" 
              fill={pathname === '/chat' ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {getUnreadMessagesCount() > 0 && (
              <span className="absolute -top-1 right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getUnreadMessagesCount() > 99 ? '99+' : getUnreadMessagesCount()}
              </span>
            )}
            <span className="text-xs">채팅</span>
          </Link>
          
          {/* 나의 당근 */}
          <Link 
            href="/profile" 
            className={`flex flex-col items-center py-2 ${
              pathname === '/profile' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <svg 
              className="w-6 h-6 mb-1" 
              fill={pathname === '/profile' ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">나의 당근</span>
          </Link>
        </div>
        </nav>
      )}

      {/* 글쓰기 플로팅 버튼 - 홈페이지에서만 표시 */}
      {pathname === '/products' && (
        <Link href="/create" className="absolute bottom-20 right-4 bg-orange-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </div>
  );
} 