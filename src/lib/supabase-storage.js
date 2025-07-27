import { createClient } from '@/lib/supabase';

const supabase = createClient();

// 이미지 업로드 함수
export const uploadImage = async (file, bucketName = 'product-images') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    throw error;
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