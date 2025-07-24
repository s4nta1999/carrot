'use client';

import { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { signInWithProvider } = useAuth();
  const supabase = createClient();

  const handleSocialLogin = async (provider: 'github') => {
    const { error } = await signInWithProvider(provider);
    if (error) {
      console.error('소셜 로그인 오류:', error);
      alert('소셜 로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-orange-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold text-white">🥕</span>
          </div>
          <h2 className="text-3xl font-bold text-white">
            당근마켓에 오신걸 환영해요!
          </h2>
          <p className="mt-2 text-gray-400">
            우리 동네 중고거래의 시작
          </p>
        </div>

        {/* GitHub 로그인 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('github')}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 fill-current" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub로 계속하기
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">또는</span>
          </div>
        </div>

        {/* Supabase Auth UI */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#f97316',
                    brandAccent: '#ea580c',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#374151',
                    defaultButtonBackgroundHover: '#4b5563',
                    defaultButtonBorder: '#6b7280',
                    defaultButtonText: '#f9fafb',
                    dividerBackground: '#4b5563',
                    inputBackground: '#374151',
                    inputBorder: '#6b7280',
                    inputBorderHover: '#9ca3af',
                    inputBorderFocus: '#f97316',
                    inputText: '#f9fafb',
                    inputLabelText: '#d1d5db',
                    inputPlaceholder: '#9ca3af',
                    messageText: '#f87171',
                    messageTextDanger: '#ef4444',
                    anchorTextColor: '#f97316',
                    anchorTextHoverColor: '#ea580c',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                    labelBottomMargin: '8px',
                    anchorBottomMargin: '4px',
                    emailInputSpacing: '4px',
                    socialAuthSpacing: '4px',
                    buttonPadding: '10px 15px',
                    inputPadding: '10px 15px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '14px',
                    baseLabelSize: '14px',
                    baseButtonSize: '14px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '6px',
                    buttonBorderRadius: '6px',
                    inputBorderRadius: '6px',
                  },
                },
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${window.location.origin}/products`}
            onlyThirdPartyProviders={false}
            magicLink={false}
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: '비밀번호를 입력하세요',
                  button_label: '회원가입',
                  loading_button_label: '가입 중...',
                  social_provider_text: '{{provider}}로 가입하기',
                  link_text: '계정이 없으신가요? 회원가입',
                  confirmation_text: '이메일을 확인해주세요',
                },
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  email_input_placeholder: 'your@email.com',
                  password_input_placeholder: '비밀번호를 입력하세요',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
                magic_link: {
                  email_input_label: '이메일',
                  email_input_placeholder: 'your@email.com',
                  button_label: '매직 링크 전송',
                  loading_button_label: '전송 중...',
                  link_text: '매직 링크로 로그인',
                  confirmation_text: '매직 링크를 이메일로 전송했습니다',
                },
                forgotten_password: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  email_input_placeholder: 'your@email.com',
                  button_label: '비밀번호 재설정 링크 전송',
                  loading_button_label: '전송 중...',
                  link_text: '비밀번호를 잊으셨나요?',
                  confirmation_text: '비밀번호 재설정 링크를 전송했습니다',
                },
                update_password: {
                  password_label: '새 비밀번호',
                  password_input_placeholder: '새 비밀번호를 입력하세요',
                  button_label: '비밀번호 업데이트',
                  loading_button_label: '업데이트 중...',
                  confirmation_text: '비밀번호가 업데이트되었습니다',
                },
              },
            }}
          />
        </div>

        {/* 푸터 */}
        <div className="text-center text-sm text-gray-400">
          <p>
            가입하면{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">
              이용약관
            </a>
            {' '}및{' '}
            <a href="#" className="text-orange-400 hover:text-orange-300">
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </div>
    </div>
  );
} 