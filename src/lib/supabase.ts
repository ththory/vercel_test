import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// 개발 환경에서 환경 변수가 없을 때 경고만 표시
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are not set. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// 환경 변수가 없어도 클라이언트는 생성 (에러 방지)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)
