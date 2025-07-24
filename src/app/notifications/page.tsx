'use client';

import { useRouter } from 'next/navigation';
import MobileLayout from '@/components/MobileLayout';
import { useNotifications, Notification } from '@/hooks/useNotifications';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    getTimeAgo
  } = useNotifications();

  const handleNotificationClick = (notification: Notification) => {
    // 읽음 처리
    markAsRead(notification.id);

    // 관련 페이지로 이동
    if (notification.type === 'like' || notification.type === 'comment') {
      router.push(`/products/${notification.related_id}`);
    } else if (notification.type === 'chat') {
      router.push('/chat');
    }
  };

  const headerActions = (
    <button
      onClick={markAllAsRead}
      className="text-sm text-orange-500 font-medium"
      disabled={loading}
    >
      모두 읽음
    </button>
  );

  return (
    <MobileLayout
      title="알림"
      showBackButton={true}
      headerActions={headerActions}
    >
      <div className="bg-gray-900 min-h-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 cursor-pointer transition-colors ${
                  notification.is_read 
                    ? 'bg-gray-900 hover:bg-gray-800' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* 알림 아이콘 */}
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === 'like' && (
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">❤️</span>
                      </div>
                    )}
                    {notification.type === 'comment' && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">💬</span>
                      </div>
                    )}
                    {notification.type === 'chat' && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">💬</span>
                      </div>
                    )}
                    {notification.type === 'system' && (
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🔔</span>
                      </div>
                    )}
                  </div>

                  {/* 알림 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-white truncate">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* 화살표 아이콘 */}
                  <div className="flex-shrink-0 ml-2">
                    <svg 
                      className="w-4 h-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-white mb-2">
              알림이 없습니다
            </h3>
            <p className="text-gray-400 text-center">
              새로운 좋아요, 댓글, 채팅이 오면<br />
              여기에 알림이 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
} 