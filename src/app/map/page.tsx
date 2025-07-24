'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Leaflet을 dynamic import로 로드 (SSR 방지)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

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
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  // Leaflet CSS 및 아이콘 설정
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Leaflet CSS를 동적으로 로드
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      // Leaflet 아이콘 설정
      import('leaflet').then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        setMapLoaded(true);
      });
    }
  }, []);

  // 판매자 정보 가져오기
  const fetchSellers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // 기본 쿼리 사용
      const { data: sellersData, error } = await supabase
        .from('profiles')
        .select(`
          id, username, avatar_url, temperature, latitude, longitude, district, address,
          products!inner(id, title, price, image_url, status)
        `)
        .neq('id', user.id)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .eq('is_location_set', true)
        .eq('products.status', 'active');

      if (error) {
        console.error('판매자 정보 가져오기 실패:', error);
        return;
      }

      const processedData = sellersData?.map(profile => ({
        ...profile,
        product_count: profile.products?.length || 0,
        product_ids: profile.products?.map(p => p.id) || [],
        product_titles: profile.products?.map(p => p.title) || [],
        product_prices: profile.products?.map(p => p.price) || [],
        product_images: profile.products?.map(p => p.image_url) || []
      })) || [];

      setSellers(processedData);

    } catch (error) {
      console.error('판매자 정보 가져오기 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mapLoaded && profile?.latitude && profile?.longitude) {
      fetchSellers();
    }
  }, [mapLoaded, profile, user]);

  // 거리 계산 (km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

  if (!mapLoaded || !profile?.latitude || !profile?.longitude) {
    return (
      <MobileLayout title="동네지도">
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p>지도를 불러오는 중...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title={`📍 ${profile?.district || '동네지도'}`}>
      <div className="relative h-full">
        {/* 지도 컨테이너 */}
        <div className="w-full h-96">
          <MapContainer
            center={[profile.latitude, profile.longitude]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* 내 위치 마커 */}
            <Marker position={[profile.latitude, profile.longitude]}>
              <Popup>
                <div className="text-center">
                  <div className="font-bold">🏠 내 위치</div>
                  <div className="text-sm text-gray-600">{profile.district || '내 동네'}</div>
                </div>
              </Popup>
            </Marker>

            {/* 판매자 마커들 */}
            {sellers.map((seller) => (
              <Marker 
                key={seller.id} 
                position={[seller.latitude, seller.longitude]}
                eventHandlers={{
                  click: () => setSelectedSeller(seller)
                }}
              >
                <Popup>
                  <div className="min-w-48">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                        {seller.avatar_url ? (
                          <img
                            src={seller.avatar_url}
                            alt={seller.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold">{seller.username}</div>
                        <div className="text-sm text-gray-600">{seller.district}</div>
                        <div className="text-xs text-orange-600">🌡️ {seller.temperature}°C</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      📦 판매 상품 {seller.products?.length || 0}개
                    </div>
                    <button
                      onClick={() => setSelectedSeller(seller)}
                      className="w-full px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                    >
                      상품 보기
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* 로딩 오버레이 */}
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p>주변 판매자를 찾는 중...</p>
            </div>
          </div>
        )}

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
                        {profile?.latitude && profile?.longitude && (
                          <> • 📍 {calculateDistance(
                            profile.latitude, 
                            profile.longitude, 
                            selectedSeller.latitude, 
                            selectedSeller.longitude
                          ).toFixed(1)}km</>
                        )}
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
                  판매 상품 ({selectedSeller.products?.length || 0}개)
                </h4>
                <div className="space-y-3">
                  {(selectedSeller.products || []).map((product: any) => (
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