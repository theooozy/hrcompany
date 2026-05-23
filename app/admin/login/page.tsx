'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLogin() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('이메일 또는 비밀번호가 올바르지 않습니다.'); setLoading(false); return }
      router.push('/admin/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setError('가입 완료! 로그인해주세요.')
      setIsLogin(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#111118] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[#111118]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/15 via-violet-600/15 to-pink-600/15 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-10">
          <span className="text-3xl font-black tracking-[0.2em] text-white">HR</span>
          <p className="text-gray-600 text-sm mt-2 tracking-widest">ADMIN</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">
            {isLogin ? '관리자 로그인' : '계정 만들기'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
              />
            </div>

            {error && (
              <p className={`text-xs px-3 py-2 rounded-lg ${error.includes('완료') ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 hover:opacity-90 disabled:opacity-50 transition-opacity mt-2"
            >
              {loading ? '처리중...' : isLogin ? '로그인' : '회원가입'}
            </button>
          </form>

          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="w-full mt-4 text-sm text-gray-600 hover:text-gray-400 transition-colors text-center"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full mt-4 text-xs text-gray-700 hover:text-gray-500 transition-colors text-center"
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}