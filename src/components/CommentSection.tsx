import { useState } from 'react';
import { Comment } from '@/types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  onRemoveComment: (commentId: number) => void;
}

export default function CommentSection({ comments, onAddComment, onRemoveComment }: CommentSectionProps) {
  const [comment, setComment] = useState('');

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
                  <span className="font-medium text-white text-sm">{c.author}</span>
                  <span className="text-xs text-gray-400">{c.time}</span>
                </div>
                <p className="text-gray-300 text-sm">{c.content}</p>
              </div>
              {c.author === '나' && (
                <button
                  onClick={() => onRemoveComment(c.id)}
                  className="text-red-500 text-xs ml-3 hover:text-red-700 transition-colors"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 mb-6">
          <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-400 text-sm">
            첫 번째 댓글을 남겨보세요!
          </p>
        </div>
      )}

      {/* 댓글 입력창 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="댓글을 입력하세요..."
          className="flex-1 px-4 py-3 bg-gray-800 rounded-full outline-none text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 transition-all"
        />
        <button 
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
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