// 이미지 최적화 유틸리티

// 파일 크기 검증 (기본값: 5MB)
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

// 이미지 압축 함수
export const compressImage = async (
  file: File, 
  maxWidth: number = 800, 
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 비율 유지하면서 크기 조정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      // 압축된 이미지를 Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('이미지 압축 실패'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = URL.createObjectURL(file);
  });
};

// 이미지 미리보기 URL 생성
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('이미지 미리보기 생성 실패'));
    reader.readAsDataURL(file);
  });
};

// 이미지 크기 가져오기
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('이미지 크기 가져오기 실패'));
    img.src = URL.createObjectURL(file);
  });
}; 