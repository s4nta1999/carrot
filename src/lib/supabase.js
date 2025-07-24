import { createBrowserClient } from '@supabase/ssr'

// 브라우저용 Supabase 클라이언트
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// 기본 클라이언트 인스턴스
export const supabase = createClient()

// 연결 테스트 함수
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Supabase 연결 실패:', error)
      return false
    }
    
    console.log('✅ Supabase 연결 성공! 상품 데이터:', data.length + '개')
    return true
  } catch (error) {
    console.error('❌ 연결 에러:', error)
    return false
  }
} 