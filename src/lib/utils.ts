// 시간 경과 계산 함수
export const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}일 전`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}달 전`;
};

// 가격 포맷팅 함수
export const formatPrice = (price: number): string => {
  if (price === 0) return '나눔';
  return `${price.toLocaleString()}원`;
};

// 파일 크기 검증
export const validateFileSize = (file: File, maxSizeMB: number = 5): boolean => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// 이미지 파일 타입 검증
export const validateImageType = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return allowedTypes.includes(file.type);
};

// HEIC 파일 검증
export const isHeicFile = (file: File): boolean => {
  return file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic');
}; 