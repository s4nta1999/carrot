// 시간 경과 계산 함수 (메모이제이션 최적화)
const timeAgoCache = new Map<string, string>();

export const getTimeAgo = (dateString: string): string => {
  // 캐시된 결과가 있으면 반환
  if (timeAgoCache.has(dateString)) {
    return timeAgoCache.get(dateString)!;
  }

  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  let result: string;
  
  if (diffInMinutes < 1) {
    result = '방금 전';
  } else if (diffInMinutes < 60) {
    result = `${diffInMinutes}분 전`;
  } else {
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      result = `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        result = `${diffInDays}일 전`;
      } else {
        const diffInMonths = Math.floor(diffInDays / 30);
        result = `${diffInMonths}달 전`;
      }
    }
  }

  // 캐시에 저장 (5분 후 만료)
  timeAgoCache.set(dateString, result);
  setTimeout(() => timeAgoCache.delete(dateString), 5 * 60 * 1000);

  return result;
};

// 가격 포맷팅 함수
export const formatPrice = (price: number): string => {
  if (price === 0) return '나눔';
  return `${price.toLocaleString()}원`;
};

// 이미지 관련 함수들은 src/lib/image-utils.ts로 이동 