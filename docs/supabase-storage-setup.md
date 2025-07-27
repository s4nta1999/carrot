# Supabase Storage 설정 가이드

## 🚀 **Supabase Storage 설정 방법**

### **1단계: Supabase Dashboard에서 Storage 활성화**

1. **Supabase 프로젝트 대시보드** 접속
2. **Storage** 메뉴 클릭
3. **"Create a new bucket"** 클릭

### **2단계: Bucket 생성**

```
Bucket 이름: product-images
Public bucket: ✅ 체크 (공개 접근 허용)
File size limit: 5MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

### **3단계: RLS 정책 설정**

Storage > Policies에서 다음 정책 추가:

#### **읽기 정책 (모든 사용자가 이미지 조회 가능)**
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');
```

#### **업로드 정책 (인증된 사용자만 업로드 가능)**
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

#### **삭제 정책 (본인이 업로드한 이미지만 삭제 가능)**
```sql
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### **4단계: 환경 변수 확인**

`.env.local` 파일에 다음이 설정되어 있는지 확인:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📸 **이미지 업로드 프로세스**

### **기존 방식 (Base64)**
- ❌ 데이터베이스에 직접 저장
- ❌ 용량 제한 (5MB)
- ❌ 성능 저하

### **새로운 방식 (Supabase Storage)**
- ✅ 클라우드 스토리지에 저장
- ✅ CDN을 통한 빠른 로딩
- ✅ 확장 가능한 구조
- ✅ 이미지 최적화 가능

## 🔧 **주요 변경사항**

1. **`src/lib/supabase-storage.js`** - Storage 유틸리티 함수
2. **`src/app/create/page.tsx`** - 이미지 업로드 로직 변경
3. **실시간 업로드** - 상품 등록 시 자동 업로드

## 🧪 **테스트 방법**

1. **상품 등록 페이지**에서 이미지 선택
2. **업로드 진행 상황** 확인
3. **Supabase Storage**에서 파일 확인
4. **상품 목록**에서 이미지 표시 확인

## 🚨 **주의사항**

- **파일 크기**: 5MB 이하
- **지원 형식**: JPG, PNG, WebP
- **HEIC 파일**: 지원하지 않음 (변환 필요)
- **중복 방지**: 타임스탬프 + 랜덤 문자열로 파일명 생성 