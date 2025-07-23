'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// 합정동 근처 위치 데이터
const locations = [
  { name: '합정동', lat: 37.548700, lng: 126.913500 },
  { name: '망원동', lat: 37.556300, lng: 126.910400 },
  { name: '연남동', lat: 37.563800, lng: 126.925900 },
  { name: '상암동', lat: 37.578600, lng: 126.889700 },
  { name: '서교동', lat: 37.555100, lng: 126.922500 },
  { name: '홍대입구', lat: 37.557527, lng: 126.925386 },
  { name: '신촌', lat: 37.558422, lng: 126.936893 },
];

// 기본 더미 사용자들 (Supabase 연결 실패 시 사용)
const defaultUsers = [
  {
    id: 'dummy-1',
    email: 'kim.minsu@example.com',
    name: '김민수',
    phone: '010-1234-5678',
    location_name: '합정동',
    latitude: 37.548700,
    longitude: 126.913500,
    temperature: 37.2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dummy-2', 
    email: 'lee.jieun@example.com',
    name: '이지은',
    phone: '010-2345-6789',
    location_name: '망원동',
    latitude: 37.556300,
    longitude: 126.910400,
    temperature: 38.1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dummy-3',
    email: 'park.cheolho@example.com', 
    name: '박철호',
    phone: '010-3456-7890',
    location_name: '연남동',
    latitude: 37.563800,
    longitude: 126.925900,
    temperature: 36.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profile_image_url?: string;
  location_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  created_at: string;
  updated_at: string;
}

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  loading: boolean;
  loginAsUser: (userId: string) => void;
  createNewUser: (name: string, email: string, locationName: string) => Promise<void>;
  logout: () => void;
  locations: typeof locations;
  isSupabaseConnected: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // 사용자 데이터 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Supabase 연결 시도
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setAllUsers(data || []);
      setIsSupabaseConnected(true);
      console.log('✅ Supabase 연결 성공! 사용자:', data?.length || 0, '명');
    } catch (error) {
      console.warn('⚠️ Supabase 연결 실패, 더미 데이터 사용:', error);
      // Supabase 연결 실패 시 더미 데이터 사용
      setAllUsers(defaultUsers);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // 특정 사용자로 로그인
  const loginAsUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      // 로컬 스토리지에 저장
      localStorage.setItem('currentUserId', userId);
    }
  };

  // 새 사용자 생성
  const createNewUser = async (name: string, email: string, locationName: string) => {
    const location = locations.find(loc => loc.name === locationName);
    if (!location) {
      throw new Error('올바른 위치를 선택해주세요.');
    }

    const newUser = {
      email,
      name,
      phone: `010-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      location_name: locationName,
      latitude: location.lat,
      longitude: location.lng,
      temperature: 36.5,
    };

    if (isSupabaseConnected) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();

        if (error) throw error;

        // 새 사용자를 목록에 추가하고 로그인
        const createdUser = data as User;
        setAllUsers(prev => [...prev, createdUser]);
        setCurrentUser(createdUser);
        localStorage.setItem('currentUserId', createdUser.id);
        console.log('✅ 새 사용자 생성 성공:', createdUser.name);
      } catch (error) {
        console.error('❌ 사용자 생성 실패:', error);
        throw error;
      }
    } else {
      // Supabase 연결 없을 때는 로컬에서만 생성
      const localUser: User = {
        ...newUser,
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setAllUsers(prev => [...prev, localUser]);
      setCurrentUser(localUser);
      localStorage.setItem('currentUserId', localUser.id);
      console.log('⚠️ 로컬 사용자 생성:', localUser.name);
    }
  };

  // 로그아웃
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  // 페이지 로드 시 저장된 사용자 복원
  useEffect(() => {
    if (!loading && allUsers.length > 0) {
      const savedUserId = localStorage.getItem('currentUserId');
      if (savedUserId) {
        const user = allUsers.find(u => u.id === savedUserId);
        if (user) {
          setCurrentUser(user);
        }
      }
    }
  }, [loading, allUsers]);

  const value = {
    currentUser,
    allUsers,
    loading,
    loginAsUser,
    createNewUser,
    logout,
    locations,
    isSupabaseConnected,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 