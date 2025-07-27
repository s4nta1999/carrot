'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  // 인증 상태 변화 감지
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적

    // 프로필 가져오기 (useEffect 내부에서 정의)
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('프로필 가져오기 오류:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('프로필 가져오기 예외:', error);
        return null;
      }
    };

        // 초기 세션 가져오기 (타임아웃 포함)
    const initializeAuth = async () => {
      let isMounted = true;
      
      // 5초 타임아웃 설정
      const timeout = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 5000); // 5초 타임아웃

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('세션 가져오기 오류:', error);
        }

        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            try {
              let profile = await fetchProfile(session.user.id);
              
              // 프로필이 없으면 자동 생성
              if (!profile) {
                try {
                  const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                      id: session.user.id,
                      username: session.user.email?.split('@')[0] || '사용자',
                      avatar_url: null,
                      location: '위치 정보 없음',
                      temperature: 36.5,
                      is_location_set: false
                    })
                    .select()
                    .single();

                  if (createError) {
                    console.error('❌ 프로필 생성 오류:', createError);
                  } else {
                    profile = newProfile;
                  }
                } catch (error) {
                  console.error('❌ 프로필 생성 예외:', error);
                }
              }
              
              if (isMounted) {
                setProfile(profile);
              }
            } catch (profileError) {
              console.error('프로필 가져오기 실패:', profileError);
              // 프로필 에러가 있어도 로딩은 완료
              if (isMounted) {
                setProfile(null);
              }
            }
          } else {
            setProfile(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        if (isMounted) {
          setLoading(false);
        }
      } finally {
        clearTimeout(timeout);
      }
    };

    initializeAuth();

    // 인증 상태 변화 구독
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          let profile = await fetchProfile(session.user.id);
          
          // 프로필이 없으면 자동 생성
          if (!profile) {
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  username: session.user.email?.split('@')[0] || '사용자',
                  avatar_url: null,
                  location: '위치 정보 없음',
                  temperature: 36.5,
                  is_location_set: false
                })
                .select()
                .single();

              if (createError) {
                console.error('❌ 프로필 생성 오류:', createError);
              } else {
                profile = newProfile;
              }
            } catch (error) {
              console.error('❌ 프로필 생성 예외:', error);
            }
          }
          
          if (isMounted) {
            setProfile(profile);
          }
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false; // 컴포넌트 언마운트시 플래그 설정
      subscription.unsubscribe();
    };
  }, []);

  // 회원가입
  const signUp = async (email: string, password: string, username?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: username || email.split('@')[0],
        }
      }
    });

    return { error };
  };

  // 로그인
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // 로그아웃
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      setUser(null);
      setProfile(null);
      setSession(null);
    }
    
    return { error };
  };

  // 프로필 업데이트
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('로그인이 필요합니다.') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // 로컬 프로필 상태 업데이트
      if (profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다.');
  }
  return context;
} 