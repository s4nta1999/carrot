'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SocialLoginRedirect from './SocialLoginRedirect';

interface SocialLoginButtonProps {
  provider: 'github';
  className?: string;
}

export default function SocialLoginButton({ provider, className = '' }: SocialLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  const { signInWithProvider } = useAuth();

  const handleSocialLogin = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        console.error('소셜 로그인 오류:', error);
        alert('소셜 로그인에 실패했습니다.');
        setIsLoading(false);
      } else {
        // 성공 시 리다이렉트 페이지 표시
        console.log('GitHub 로그인 성공 - 리다이렉트 페이지 표시');
        setShowRedirect(true);
      }
    } catch (error) {
      console.error('소셜 로그인 예외:', error);
      alert('소셜 로그인 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case 'github':
        return {
          name: 'GitHub',
          icon: (
            <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          ),
          loadingText: 'GitHub로 로그인 중...',
          buttonText: 'GitHub로 계속하기'
        };
      default:
        return {
          name: 'Unknown',
          icon: null,
          loadingText: '로그인 중...',
          buttonText: '로그인'
        };
    }
  };

  const { name, icon, loadingText, buttonText } = getProviderInfo();

  // 리다이렉트 페이지 표시
  if (showRedirect) {
    return <SocialLoginRedirect provider={provider} />;
  }

  return (
    <button
      onClick={handleSocialLogin}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center px-4 py-3 
        border border-gray-600 dark:border-gray-600 border-gray-300 
        rounded-lg 
        bg-gray-800 dark:bg-gray-800 bg-white 
        text-white dark:text-white text-gray-900 
        hover:bg-gray-700 dark:hover:bg-gray-700 hover:bg-gray-50 
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-white border-gray-900 mr-3"></div>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
} 