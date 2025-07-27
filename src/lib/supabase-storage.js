import { createClient } from '@/lib/supabase';

const supabase = createClient();

// 이미지 업로드 함수
export const uploadImage = async (file, bucketName = 'product-images') => {
  try {
    // 파일명 생성 (중복 방지)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 공개 URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return { success: true, url: publicUrl, fileName };
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return { success: false, error: error.message };
  }
};

// 이미지 삭제 함수
export const deleteImage = async (fileName, bucketName = 'product-images') => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    return { success: false, error: error.message };
  }
};

// 파일명에서 URL 추출
export const getFileNameFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1];
}; 