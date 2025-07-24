import { useState } from 'react';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';

interface CommentSectionProps {
  productId: string;
}

export default function CommentSection({ productId }: CommentSectionProps) {
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const {
    comments,
    loading,
    submitting,
    addComment,
    deleteComment
  } = useComments(productId);

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

  const handleSubmit = async () => {
    if (!comment.trim() || submitting) return;

    const { success, error } = await addComment(comment.trim());
    
    if (success) {
      setComment('');
    } else {
      alert(error || '댓글 작성에 실패했습니다.');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    const { success, error } = await deleteComment(commentId);
    
    if (!success) {
      alert(error || '댓글 삭제에 실패했습니다.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-gray-900">
      <h3 className="text-lg font-semibold text-white mb-4">
        댓글 {comments.length}
      </h3>
      
      {/* 댓글 리스트 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map(c => (
            <div key={c.id} className="flex justify-between items-start p-3 bg-gray-800 rounded-lg">
              <div className="flex items-start space-x-3 flex-1">
                {/* 사용자 아바타 */}
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                  {c.profiles?.avatar_url ? (
                    <img
                      src={c.profiles.avatar_url}
                      alt={c.profiles.username || '사용자'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-white">
                      {c.profiles?.username?.[0] || '?'}
                    </span>
                  )}
                </div>

                {/* 댓글 내용 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-white text-sm">
                      {c.profiles?.username || '사용자'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {getTimeAgo(c.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap break-words">
                    {c.content}
                  </p>
                </div>
              </div>

              {/* 삭제 버튼 (본인 댓글만) */}
              {c.user_id === user?.id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-red-500 text-xs ml-3 hover:text-red-700 transition-colors flex-shrink-0"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-400 text-sm">첫 댓글을 남겨보세요!</p>
        </div>
      )}

      {/* 댓글 입력 */}
      {user ? (
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="댓글을 입력하세요..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!comment.trim() || submitting}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
              comment.trim() && !submitting
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                등록
              </div>
            ) : (
              '등록'
            )}
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">
            댓글을 작성하려면 로그인이 필요합니다.
          </p>
        </div>
      )}
    </div>
  );
} 