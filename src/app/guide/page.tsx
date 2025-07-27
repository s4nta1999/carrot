'use client';

import MobileLayout from '@/components/MobileLayout';
import Link from 'next/link';

export default function GuidePage() {
  const features = [
    {
      icon: '🏠',
      title: '홈',
      description: '내 지역의 상품들을 확인하고 검색할 수 있어요',
      tips: ['위치 설정 후 해당 지역 상품만 표시', '가격순, 최신순, 인기순 정렬 가능', '상품명으로 검색 가능']
    },
    {
      icon: '🗺️',
      title: '동네지도',
      description: '주변 상품들의 위치를 지도에서 확인해요',
      tips: ['판매자 위치 기반 지도 표시', '핀 클릭 시 해당 판매자 상품 목록', '실시간 위치 기반 필터링']
    },
    {
      icon: '💬',
      title: '채팅',
      description: '판매자와 실시간으로 대화할 수 있어요',
      tips: ['상품 상세페이지에서 채팅 시작', '실시간 메시지 송수신', '읽지 않은 메시지 알림 표시']
    },
    {
      icon: '👤',
      title: '프로필',
      description: '내 정보와 활동 내역을 관리해요',
      tips: ['위치 정보 수정', '내가 등록한 상품 관리', '거래 내역 확인']
    },
    {
      icon: '➕',
      title: '상품등록',
      description: '내 물건을 팔거나 나눔할 수 있어요',
      tips: ['AI 작성 기능으로 쉽게 등록', '이미지 업로드 지원', '가격 설정 또는 나눔 선택']
    }
  ];

  const aiFeatures = [
    {
      title: 'AI 제목 생성',
      description: '상품 설명을 입력하면 자동으로 매력적인 제목을 만들어줘요',
      example: '입력: "아이폰 13 새상품" → 결과: "📱 좋은 아이폰"'
    },
    {
      title: 'AI 설명 생성',
      description: '간단한 설명으로 전문적인 상품 설명을 자동 생성해요',
      example: '입력: "깨끗한 의자" → 결과: "안녕하세요! 🪑 깨끗한 의자 판매합니다..."'
    },
    {
      title: '자동 카테고리 분류',
      description: '상품 내용을 분석해서 적절한 카테고리로 자동 분류해요',
      example: '전자기기 📱, 의류 👕, 가구 🪑, 도서 📚 등'
    }
  ];

  const tips = [
    '📍 위치 설정을 먼저 해주세요!',
    '📸 상품 사진은 명확하게 촬영해주세요',
    '💰 적절한 가격 설정이 거래 성공의 열쇠예요',
    '💬 빠른 응답이 좋은 거래를 만들어요',
    '🤖 AI 작성 기능을 활용하면 더 쉽게 등록할 수 있어요',
    '🔍 검색 기능으로 원하는 상품을 빠르게 찾아보세요',
    '🗺️ 동네지도로 가까운 거래를 찾아보세요',
    '📱 실시간 채팅으로 편리하게 소통하세요'
  ];

  return (
    <MobileLayout title="사용법 가이드" showBackButton>
      <div className="p-4 space-y-6">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">당근마켓에 오신 것을 환영합니다! 🥕</h1>
          <p className="text-orange-100">
            가까운 이웃과 함께 나누는 따뜻한 거래를 경험해보세요.
          </p>
        </div>

        {/* 주요 기능 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">📱 주요 기능</h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI 기능 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">🤖 AI 작성 기능</h2>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-600 text-lg">✨</span>
              <span className="font-semibold text-purple-900">Beta 기능</span>
            </div>
            <div className="space-y-3">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500 font-mono">{feature.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 사용 팁 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">💡 사용 팁</h2>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <ul className="space-y-2">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-900">
                  <span className="text-blue-600 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 빠른 시작 */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-900">🚀 빠른 시작</h2>
          <div className="space-y-3">
            <Link 
              href="/location-setup"
              className="block bg-green-500 text-white rounded-xl p-4 text-center font-medium hover:bg-green-600 transition-colors"
            >
              📍 위치 설정하기
            </Link>
            <Link 
              href="/create"
              className="block bg-orange-500 text-white rounded-xl p-4 text-center font-medium hover:bg-orange-600 transition-colors"
            >
              ➕ 첫 상품 등록하기
            </Link>
            <Link 
              href="/products"
              className="block bg-blue-500 text-white rounded-xl p-4 text-center font-medium hover:bg-blue-600 transition-colors"
            >
              🏠 상품 둘러보기
            </Link>
          </div>
        </div>

        {/* 문의 */}
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-gray-600 text-sm">
            더 자세한 도움이 필요하시면 언제든 연락주세요! 📧
          </p>
        </div>
      </div>
    </MobileLayout>
  );
} 