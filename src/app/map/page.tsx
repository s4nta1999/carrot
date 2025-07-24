'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

declare global {
  interface Window {
    kakao: any;
  }
}

interface Seller {
  id: string;
  username: string;
  avatar_url: string | null;
  temperature: number;
  latitude: number;
  longitude: number;
  district: string;
  address: string;
  product_count?: number;
  product_ids?: string[];
  product_titles?: string[];
  product_prices?: number[];
  product_images?: string[];
  products?: any[]; // fallback 쿼리용
}

export default function MapPage() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  // 카카오맵 API 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
      script.onload = () => {
        window.kakao.maps.load(() => {
          setMapLoaded(true);
        });
      };
      document.head.appendChild(script);
    }
  }, []);

  // 지도 초기화 및 판매자 정보 표시
  useEffect(() => {
    if (mapLoaded && mapContainer.current && profile?.latitude && profile?.longitude) {
      initializeMap();
    }
  }, [mapLoaded, profile]);

  // 지도 초기화
  const initializeMap = () => {
    if (!profile?.latitude || !profile?.longitude) return;

    const options = {
      center: new window.kakao.maps.LatLng(profile.latitude, profile.longitude),
      level: 5
    };

    const kakaoMap = new window.kakao.maps.Map(mapContainer.current, options);
    setMap(kakaoMap);

    // 내 위치 마커
    const myPosition = new window.kakao.maps.LatLng(profile.latitude, profile.longitude);
    const myMarker = new window.kakao.maps.Marker({
      position: myPosition,
      title: '내 위치'
    });
    myMarker.setMap(kakaoMap);

    // 내 위치 인포윈도우
    const myInfoWindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:10px; text-align:center; min-width:120px;">
        <div style="font-weight:bold; color:#333;">🏠 내 위치</div>
        <div style="font-size:12px; color:#666; margin-top:4px;">${profile.district || '내 동네'}</div>
      </div>`
    });
    myInfoWindow.open(kakaoMap, myMarker);

    fetchSellers(kakaoMap);
  };

  // 판매자 정보 가져오기
  const fetchSellers = async (mapInstance?: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .rpc('get_sellers_with_products')
        .neq('id', user.id);

      if (error) {
        console.error('판매자 정보 가져오기 실패:', error);
        // 뷰가 없으면 기본 쿼리 사용
        const { data: fallbackData } = await supabase
          .from('profiles')
          .select(`
            id, username, avatar_url, temperature, latitude, longitude, district, address,
            products!inner(id, title, price, image_url, status)
          `)
          .neq('id', user.id)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null)
          .eq('products.status', 'active');

        const processedData = fallbackData?.map(profile => ({
          ...profile,
          product_count: profile.products?.length || 0,
          product_ids: profile.products?.map(p => p.id) || [],
          product_titles: profile.products?.map(p => p.title) || [],
          product_prices: profile.products?.map(p => p.price) || [],
          product_images: profile.products?.map(p => p.image_url) || []
        })) || [];

        setSellers(processedData);
        displaySellersOnMap(processedData, mapInstance || map);
        return;
      }

      setSellers(data || []);
      displaySellersOnMap(data || [], mapInstance || map);

    } catch (error) {
      console.error('판매자 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 지도에 판매자 마커 표시
  const displaySellersOnMap = (sellersData: any[], mapInstance: any) => {
    if (!mapInstance) return;

    sellersData.forEach((seller) => {
      if (!seller.latitude || !seller.longitude) return;

      const position = new window.kakao.maps.LatLng(seller.latitude, seller.longitude);
      
      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: position,
        title: seller.username
      });
      marker.setMap(mapInstance);

      // 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedSeller(seller);
      });
    });
  };

  if (!profile?.is_location_set) {
    return (
      <MobileLayout title="동네지도">
        <div className="flex flex-col items-center justify-center h-96 p-6">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-lg font-medium text-white mb-2">위치 설정이 필요해요</h3>
          <p className="text-gray-400 text-center mb-6">
            동네지도를 사용하려면<br />
            먼저 위치를 설정해주세요
          </p>
          <Link
            href="/location-setup"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            위치 설정하기
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`📍 ${profile?.district || '동네지도'}`}>
      <div className="relative h-full">
        {/* 지도 컨테이너 */}
        <div ref={mapContainer} className="w-full h-96 bg-gray-800"></div>

        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p>주변 판매자를 찾는 중...</p>
            </div>
          </div>
        )}

        {/* 내 위치 버튼 */}
        <button
          onClick={() => {
            if (map && profile?.latitude && profile?.longitude) {
              const myPosition = new window.kakao.maps.LatLng(profile.latitude, profile.longitude);
              map.setCenter(myPosition);
              map.setLevel(3);
            }
          }}
          className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
        >
          <span className="text-xl">🎯</span>
        </button>

        {/* 판매자 상품 목록 모달 */}
        {selectedSeller && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-end z-20">
            <div className="w-full bg-gray-900 rounded-t-xl max-h-96 overflow-hidden">
              {/* 모달 헤더 */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center">
                      {selectedSeller.avatar_url ? (
                        <img
                          src={selectedSeller.avatar_url}
                          alt={selectedSeller.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{selectedSeller.username}</h3>
                      <p className="text-sm text-gray-400">{selectedSeller.district}</p>
                      <p className="text-xs text-orange-500">
                        🌡️ {selectedSeller.temperature}°C
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSeller(null)}
                    className="text-gray-400 hover:text-white text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 상품 목록 */}
              <div className="p-4 overflow-y-auto max-h-80">
                <h4 className="text-white font-medium mb-3">
                  판매 상품 ({(selectedSeller.product_count || selectedSeller.products?.length) || 0}개)
                </h4>
                <div className="space-y-3">
                  {(selectedSeller.products || []).map((product: any, index: number) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <img
                        src={product.image_url || '/images/placeholder.svg'}
                        alt={product.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h5 className="text-white font-medium text-sm">
                          {product.title}
                        </h5>
                        <p className="text-orange-500 font-bold text-sm">
                          {product.price.toLocaleString()}원
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">›</span>
                    </Link>
                  ))}
                  
                  {(!selectedSeller.products || selectedSeller.products.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-gray-400">등록된 상품이 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하단 정보 패널 */}
        <div className="bg-gray-900 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">📍 {profile?.district} 근처</h3>
            <span className="text-sm text-gray-400">
              {sellers.length}명의 판매자
            </span>
          </div>
          <p className="text-gray-400 text-xs">
            지도에서 📍 마커를 클릭하면 판매자의 상품을 볼 수 있어요
          </p>
        </div>
      </div>
    </MobileLayout>
  );
} 