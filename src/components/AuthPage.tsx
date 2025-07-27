'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';

export default function AuthPage() {
  const supabase = createClient();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            당근마켓에 오신 것을 환영합니다! 🥕
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            가까운 이웃과 함께 나누는 따뜻한 거래를 시작해보세요
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ff6b35',
                    brandAccent: '#e55a2b',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/products`}
          />
        </div>
      </div>
    </div>
  );
} 