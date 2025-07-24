'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';

export default function LocationSetupPage() {
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const supabase = createClient();

  const [currentStep, setCurrentStep] = useState(1); // 1: 위치 선택, 2: 확인
  const [locationMethod, setLocationMethod] = useState<'auto' | 'manual'>('auto');
  const [loading, setLoading] = useState(false);

  // 위치 정보 상태
  const [locationData, setLocationData] = useState({
    latitude: 37.5665, // 서울 시청 기본값
    longitude: 126.9780,
    address: '',
    district: '',
    city: '서울시'
  });

  // 검색 관련 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationData(prev => ({ ...prev, latitude, longitude }));
          await getAddressFromCoords(latitude, longitude);
        },
        (error) => {
          console.error('위치 가져오기 실패:', error);
          alert('위치 정보를 가져올 수 없습니다. 수동으로 설정해주세요.');
          setLocationMethod('manual');
          setLoading(false);
        }
      );
    } else {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setLocationMethod('manual');
      setLoading(false);
    }
  };

  // 좌표로 주소 가져오기 (Nominatim API 사용)
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ko`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        // 한국 주소 파싱
        const addressParts = data.display_name.split(', ');
        const district = data.address?.neighbourhood || data.address?.suburb || 
                        data.address?.village || addressParts[0] || '알 수 없음';
        const city = data.address?.city || data.address?.county || 
                    data.address?.state || '서울시';
        
        setLocationData(prev => ({
          ...prev,
          address: data.display_name,
          district: district.replace(/\d+(-\d+)?$/, '').trim(), // 번지수 제거
          city: city
        }));
      }
    } catch (error) {
      console.error('주소 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 주소 검색 (Nominatim API 사용)
  const searchAddress = async (keyword: string) => {
    if (!keyword.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(keyword + ' 대한민국')}&limit=5&accept-language=ko`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const results = data.map((item: any) => ({
          place_name: item.name || item.display_name.split(',')[0],
          address_name: item.display_name,
          y: item.lat,
          x: item.lon
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
        alert('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
      alert('주소 검색 중 오류가 발생했습니다.');
    }
  };

  // 검색 결과 선택
  const selectSearchResult = (place: any) => {
    const latitude = parseFloat(place.y);
    const longitude = parseFloat(place.x);
    
    setLocationData({
      latitude,
      longitude,
      address: place.address_name,
      district: place.address_name.split(' ').slice(-1)[0], // 마지막 동네명
      city: place.address_name.split(' ')[0] // 첫 번째 시/도명
    });
    
    setSearchResults([]);
    setSearchKeyword('');
    setCurrentStep(2);
  };

  // 위치 정보 저장
  const saveLocation = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          district: locationData.district,
          city: locationData.city,
          location: locationData.district, // 기존 location 필드도 업데이트
          is_location_set: true
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // 프로필 새로고침
      if (updateProfile) {
        await updateProfile({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          address: locationData.address,
          district: locationData.district,
          city: locationData.city,
          location: locationData.district,
          is_location_set: true
        });
      }
      
      alert('위치가 성공적으로 설정되었습니다! 🎉');
      router.push('/products');
      
    } catch (error) {
      console.error('위치 저장 실패:', error);
      alert('위치 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 건너뛰기 (기본 위치로 설정)
  const skipLocationSetting = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          district: '합정동',
          city: '서울시',
          location: '합정동',
          is_location_set: true
        })
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      router.push('/products');
    } catch (error) {
      console.error('기본 위치 설정 실패:', error);
    }
  };

  // 리다이렉트 처리 (useEffect로 이동)
  useEffect(() => {
    if (!user || profile?.is_location_set) {
      router.push('/products');
    }
  }, [user, profile?.is_location_set, router]);

  // 로그인하지 않은 사용자나 이미 위치 설정 완료한 사용자는 바로 리다이렉트
  if (!user || profile?.is_location_set) {
    return null; // 로딩창 없이 즉시 리다이렉트
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <header className="bg-gray-900 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">위치 설정</h1>
          <button
            onClick={skipLocationSetting}
            className="text-gray-400 text-sm hover:text-white"
          >
            건너뛰기
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* 진행 상황 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Step 1: 위치 선택 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">📍</div>
              <h2 className="text-2xl font-bold mb-2">위치를 설정해주세요</h2>
              <p className="text-gray-400">
                내 동네를 설정하면 근처의 상품을 쉽게 찾을 수 있어요
              </p>
            </div>

            {/* 위치 설정 방법 선택 */}
            <div className="space-y-4">
              {/* 현재 위치 사용 */}
              <button
                onClick={() => {
                  setLocationMethod('auto');
                  getCurrentLocation();
                }}
                disabled={loading}
                className="w-full p-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading && locationMethod === 'auto' ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    현재 위치 가져오는 중...
                  </div>
                ) : (
                  '📱 현재 위치 사용하기'
                )}
              </button>

              {/* 수동 설정 */}
              <div className="space-y-3">
                <button
                  onClick={() => setLocationMethod('manual')}
                  className={`w-full p-4 border-2 rounded-lg font-medium transition-colors ${
                    locationMethod === 'manual'
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500'
                      : 'border-gray-600 bg-gray-800 text-white hover:border-gray-500'
                  }`}
                >
                  🔍 직접 검색하기
                </button>

                {locationMethod === 'manual' && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="동네, 도로명, 건물명 검색"
                        className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                        onKeyPress={(e) => e.key === 'Enter' && searchAddress(searchKeyword)}
                      />
                      <button
                        onClick={() => searchAddress(searchKeyword)}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        검색
                      </button>
                    </div>

                    {/* 검색 결과 */}
                    {searchResults.length > 0 && (
                      <div className="bg-gray-800 border border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                        {searchResults.map((place, index) => (
                          <button
                            key={index}
                            onClick={() => selectSearchResult(place)}
                            className="w-full p-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium text-white">{place.place_name}</div>
                            <div className="text-sm text-gray-400">{place.address_name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 위치 확인 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2">위치를 확인해주세요</h2>
              <p className="text-gray-400">
                설정된 위치가 맞는지 확인해주세요
              </p>
            </div>

            {/* 위치 정보 표시 */}
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">📍</div>
                <div>
                  <div className="font-medium text-white">{locationData.district}</div>
                  <div className="text-sm text-gray-400">{locationData.address}</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                위도: {locationData.latitude.toFixed(6)}<br/>
                경도: {locationData.longitude.toFixed(6)}
              </div>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={saveLocation}
                disabled={loading}
                className="w-full py-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </div>
                ) : (
                  '이 위치로 설정하기'
                )}
              </button>

              <button
                onClick={() => setCurrentStep(1)}
                className="w-full py-4 border border-gray-600 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                다시 선택하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 