'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/contexts/ProductContext';
import { uploadImage } from '@/lib/supabase-storage';
import { validateFileSize, validateImageType, isHeicFile } from '@/lib/utils';
import Link from 'next/link';

export default function CreateProductPage() {
  const router = useRouter();
  const { addProduct } = useProducts();
  
  // 입력 상태
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<{ file: File; preview: string; uploaded?: boolean; url?: string }[]>([]);
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [saleType, setSaleType] = useState<'sell' | 'share'>('sell');
  const [isDragOver, setIsDragOver] = useState(false);

  // 이미지 업로드 처리 (Supabase Storage 사용)
  const handleImageUpload = (files: FileList) => {
    Array.from(files).forEach(file => {
      // 이미지 파일 타입 검증
      if (!validateImageType(file)) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      // HEIC 파일 감지
      if (isHeicFile(file)) {
        alert('HEIC 파일은 지원되지 않습니다. JPG, PNG 형식으로 변환해주세요.');
        return;
      }

      // 파일 크기 제한 (5MB)
      if (!validateFileSize(file, 5)) {
        alert('파일 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.');
        return;
      }

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages(prev => [...prev.slice(0, 9), { 
            file, 
            preview: result,
            uploaded: false 
          }]); // 최대 10개까지
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // 기본 검증
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!description.trim()) {
      alert('설명을 입력해주세요.');
      return;
    }

    if (saleType === 'sell' && (!price || Number(price) <= 0)) {
      alert('가격을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 이미지 업로드 처리
      let imageUrl: string = '/images/placeholder.svg';
      
      if (images.length > 0) {
        const uploadResult = await uploadImage(images[0].file);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          alert('이미지 업로드에 실패했습니다: ' + uploadResult.error);
          setIsSubmitting(false);
          return;
        }
      }

      const newProduct = {
        title: title.trim(),
        description: description.trim(),
        price: saleType === 'share' ? 0 : Number(price),
        image_url: imageUrl || '/images/placeholder.svg'
      };

      const { success, error } = await addProduct(newProduct);
      
      if (success) {
        // 폼 초기화
        setTitle('');
        setDescription('');
        setPrice('');
        setImages([]);
        
        // 성공 메시지
        alert('상품이 성공적으로 등록되었습니다! 🎉');
        
        // 상품 목록으로 이동
        router.push('/products');
      } else {
        alert(error || '상품 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('상품 등록 오류:', err);
      alert('상품 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white relative overflow-hidden">
      {/* 헤더 - 고정 */}
      <header className="bg-black border-b border-gray-800 flex-shrink-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/products">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold">내 물건 팔기</h1>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`text-sm ${
              isSubmitting ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400'
            }`}
          >
            {isSubmitting ? '저장 중...' : '완료'}
          </button>
        </div>
      </header>

      {/* 콘텐츠 영역 - 스크롤 가능 */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* AI 작성하기 토글 */}
          <div className="bg-purple-600 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-700 px-2 py-1 rounded text-xs font-medium">
                ✨ Beta
              </div>
              <span className="font-medium">AI로 작성하기</span>
            </div>
            <div 
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${
                isAiEnabled ? 'bg-white' : 'bg-gray-400'
              }`}
              onClick={() => setIsAiEnabled(!isAiEnabled)}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-purple-600 rounded-full transition-transform duration-200 ${
                  isAiEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* 사진 업로드 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">사진 (선택사항)</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {/* 사진 추가 버튼 */}
              <div 
                className={`min-w-[100px] h-[100px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isDragOver ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('imageInput')?.click()}
              >
                <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-400 text-center">
                  {images.length}/10
                </span>
              </div>

              {/* 업로드된 이미지들 */}
              {images.map((image, index) => (
                <div key={index} className="relative min-w-[100px] h-[100px]">
                  <img
                    src={image.preview}
                    alt={`업로드된 이미지 ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <input
              id="imageInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
            />
          </div>

          {/* 제목 입력 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">제목</h2>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              maxLength={40}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {title.length}/40
            </div>
          </div>

          {/* 설명 입력 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">자세한 설명</h2>
            <textarea
              placeholder="상품에 대한 자세한 설명을 작성해주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 resize-none"
              rows={6}
              maxLength={1000}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {description.length}/1000
            </div>
          </div>

          {/* 가격 설정 */}
          <div>
            <h2 className="text-lg font-semibold mb-3">가격</h2>
            
            {/* 판매/나눔 토글 */}
            <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
              <button
                onClick={() => setSaleType('sell')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  saleType === 'sell' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                판매하기
              </button>
              <button
                onClick={() => setSaleType('share')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  saleType === 'share' 
                    ? 'bg-white text-black' 
                    : 'bg-gray-700 text-gray-300'
                }`}
              >
                나눔하기
              </button>
            </div>

            {/* 가격 입력 */}
            {saleType === 'sell' && (
              <div className="relative">
                <input
                  type="number"
                  placeholder="가격을 입력하세요"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 pr-8"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  원
                </span>
              </div>
            )}
          </div>
        
          {/* 하단 여백 */}
          <div className="h-20"></div>
        </div>
      </main>

      {/* 하단 완료 버튼 - 고정 */}
      <div className="bg-black border-t border-gray-800 p-4 flex-shrink-0">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 font-semibold rounded-lg text-lg transition-colors ${
            isSubmitting 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              등록 중...
            </div>
          ) : (
            '작성 완료'
          )}
        </button>
      </div>
    </div>
  );
} 