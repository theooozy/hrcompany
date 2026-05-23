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
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState({ text: '', isError: false })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', isError: false })

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setMsg({ text: '이메일 또는 비밀번호가 올바르지 않습니다.', isError: true }); setLoading(false); return }
      router.push('/admin/dashboard')

    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setMsg({ text: error.message, isError: true }); setLoading(false); return }
      setMsg({ text: '가입 완료! 로그인해주세요.', isError: false })
      setMode('login')

    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })
      if (error) { setMsg({ text: error.message, isError: true }); setLoading(false); return }
      setMsg({ text: '비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.', isError: false })
    }

    setLoading(false)
  }

  const titles = { login: '관리자 로그인', signup: '계정 만들기', reset: '비밀번호 찾기' }
  const btnLabels = { login: '로그인', signup: '회원가입', reset: '재설정 이메일 보내기' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: 'linear-gradient(135deg, #060B18 0%, #0A1628 50%, #080E1F 100%)' }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #1E40AF, #7C3AED, transparent)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-10">
          <button onClick={() => router.push('/')} className="inline-block">
            <span className="text-3xl font-black tracking-[0.2em] text-white">HR</span>
          </button>
          <p className="text-blue-400/60 text-xs mt-2 tracking-[0.3em] font-medium">ADMIN</p>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: 'rgba(10,22,40,0.9)', borderColor: 'rgba(59,130,246,0.2)' }}>
          <h2 className="text-xl font-bold text-white mb-6">{titles[mode]}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200/70 mb-2 font-medium">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-blue-300/20"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm text-blue-200/70 mb-2 font-medium">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-blue-300/20"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
                />
              </div>
            )}

            {msg.text && (
              <div className={`text-sm px-4 py-3 rounded-xl ${msg.isError ? 'text-red-300 bg-red-500/10 border border-red-500/20' : 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'}`}>
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90 mt-2"
              style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #DB2777)' }}
            >
              {loading ? '처리중...' : btnLabels[mode]}
            </button>
          </form>

          {/* 하단 링크들 - 잘 보이게 */}
          <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('reset'); setMsg({ text: '', isError: false }) }} className="w-full text-sm text-blue-300/70 hover:text-blue-200 transition-colors text-center py-1">
                  🔑 비밀번호를 잊으셨나요?
                </button>
                <button onClick={() => { setMode('signup'); setMsg({ text: '', isError: false }) }} className="w-full text-sm text-blue-300/70 hover:text-blue-200 transition-colors text-center py-1">
                  계정이 없으신가요? <span className="text-blue-400 font-semibold">회원가입</span>
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button onClick={() => { setMode('login'); setMsg({ text: '', isError: false }) }} className="w-full text-sm text-blue-300/70 hover:text-blue-200 transition-colors text-center py-1">
                이미 계정이 있으신가요? <span className="text-blue-400 font-semibold">로그인</span>
              </button>
            )}
            {mode === 'reset' && (
              <button onClick={() => { setMode('login'); setMsg({ text: '', isError: false }) }} className="w-full text-sm text-blue-300/70 hover:text-blue-200 transition-colors text-center py-1">
                ← <span className="text-blue-400 font-semibold">로그인으로 돌아가기</span>
              </button>
            )}
          </div>
        </div>

        {/* 홈으로 - 잘 보이게 */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-5 text-sm text-blue-300/60 hover:text-blue-200 transition-colors text-center py-2"
        >
          ← 홈으로 돌아가기
        </button>
      </div>
    </div>
  )
}