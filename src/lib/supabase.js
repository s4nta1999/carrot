import { createBrowserClient } from '@supabase/ssr'

// 환경변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 없음')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 없음')
}

// 브라우저용 Supabase 클라이언트
export function createClient() {
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    })
  } catch (error) {
    console.error('❌ Supabase 클라이언트 생성 실패:', error)
    throw error
  }
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