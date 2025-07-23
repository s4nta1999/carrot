'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';

export default function UserLoginPage() {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { allUsers, loginAsUser, createNewUser, locations, isSupabaseConnected } = useUser();

  // 기존 사용자로 로그인
  const handleUserLogin = (userId: string) => {
    loginAsUser(userId);
  };

  // 새 사용자 생성
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createNewUser(name, email, selectedLocation);
    } catch (err: any) {
      setError(err.message || '사용자 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 로고 영역 */}
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-3xl">🥕</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            당근마켓
          </h2>
          <p className="mt-2 text-gray-300">
            우리 동네 중고 직거래 마켓
          </p>
        </div>

        {/* 사용자 선택/생성 토글 */}
        <div className="flex rounded-lg bg-gray-800 p-1">
          <button
            onClick={() => setIsCreatingNew(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !isCreatingNew 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            기존 사용자
          </button>
          <button
            onClick={() => setIsCreatingNew(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isCreatingNew 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            새 사용자
          </button>
        </div>

        {!isCreatingNew ? (
          /* 기존 사용자 목록 */
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white text-center">
              테스트 사용자 선택
            </h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {allUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserLogin(user.id)}
                  className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors border border-gray-700 hover:border-orange-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        📍 {user.location_name} • 🌡️ {user.temperature}°C
                      </div>
                    </div>
                    <div className="text-orange-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* 새 사용자 생성 폼 */
          <form className="space-y-6" onSubmit={handleCreateUser}>
            <h3 className="text-lg font-medium text-white text-center">
              새 사용자 만들기
            </h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                이름
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="이름을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300">
                동네 선택
              </label>
              <select
                id="location"
                required
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">동네를 선택하세요</option>
                {locations.map((location) => (
                  <option key={location.name} value={location.name}>
                    📍 {location.name}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                '사용자 생성하기 (온도 36.5°C)'
              )}
            </button>
          </form>
        )}

        {/* 안내 메시지 */}
        <div className="text-center text-sm text-gray-400 space-y-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
            isSupabaseConnected 
              ? 'bg-green-900/20 text-green-400' 
              : 'bg-yellow-900/20 text-yellow-400'
          }`}>
            {isSupabaseConnected ? '🟢 Supabase 연결됨' : '🟡 로컬 모드'}
          </div>
          <p>🧪 테스트용 더미 데이터로 당근마켓을 체험해보세요!</p>
          {!isCreatingNew && (
            <p>• 기존 사용자: {allUsers.length}명의 테스트 계정</p>
          )}
          {isCreatingNew && (
            <p>• 새 사용자: {isSupabaseConnected ? 'users 테이블에 직접 추가' : '로컬에서만 생성'}</p>
          )}
        </div>
      </div>
    </div>
  );
} 