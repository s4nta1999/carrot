'use client';

import { useEffect, useState } from 'react';

interface SocialLoginRedirectProps {
  provider: 'github';
}

export default function SocialLoginRedirect({ provider }: SocialLoginRedirectProps) {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const steps = [
      { message: 'GitHub로 인증 중...', delay: 1000 },
      { message: '사용자 정보 확인 중...', delay: 1500 },
      { message: '프로필 생성 중...', delay: 2000 },
      { message: '로그인 완료! 리다이렉트 중...', delay: 2500 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStep(currentStep + 1);
        setMessage(steps[currentStep].message);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getProviderInfo = () => {
    switch (provider) {
      case 'github':
        return {
          name: 'GitHub',
          icon: (
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )
        };
      default:
        return {
          name: 'Unknown',
          icon: null
        };
    }
  };

  const { name, icon } = getProviderInfo();

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-900 bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 로고 */}
        <div className="mx-auto h-16 w-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl font-bold text-white">🥕</span>
        </div>

        {/* 제목 */}
        <div>
          <h2 className="text-2xl font-bold text-white dark:text-white text-gray-900 mb-2">
            {name}로 로그인 중
          </h2>
          <p className="text-gray-400 dark:text-gray-400 text-gray-600">
            잠시만 기다려주세요...
          </p>
        </div>

        {/* 진행 상태 */}
        <div className="space-y-4">
          {/* 스피너 */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>

          {/* 메시지 */}
          <div className="text-white dark:text-white text-gray-900">
            <p className="text-lg font-medium">{message}</p>
          </div>

          {/* 진행 단계 */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  stepNumber <= step 
                    ? 'bg-orange-500' 
                    : 'bg-gray-600 dark:bg-gray-600 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* GitHub 아이콘 */}
        <div className="flex justify-center">
          <div className="text-gray-400 dark:text-gray-400 text-gray-600">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
} 