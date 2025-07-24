import { useState } from 'react';
import { Comment } from '@/types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onRemoveComment: (commentId: string) => void;
}

export default function CommentSection({ comments, onAddComment, onRemoveComment }: CommentSectionProps) {
  const [comment, setComment] = useState('');

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

  const handleSubmit = () => {
    if (comment.trim()) {
      onAddComment(comment.trim());
      setComment('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-gray-900">
      <h3 className="text-lg font-semibold text-white mb-4">
        댓글 {comments.length}
      </h3>
      
      {/* 댓글 리스트 */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-6">
          {comments.map(c => (
            <div key={c.id} className="flex justify-between items-start p-3 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">
                    {c.profiles?.username || '사용자'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getTimeAgo(c.created_at)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">{c.content}</p>
              </div>
              <button
                onClick={() => onRemoveComment(c.id)}
                className="text-red-500 text-xs ml-3 hover:text-red-700 transition-colors"
              >
                삭제
              </button>
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
      <div className="flex gap-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            comment.trim()
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          등록
        </button>
      </div>
    </div>
  );
} 