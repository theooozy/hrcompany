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
      if (error) {
        setMsg({ text: '이메일 또는 비밀번호가 올바르지 않습니다.', isError: true })
        setLoading(false)
        return
      }
      router.push('/admin/dashboard')
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMsg({ text: error.message, isError: true })
        setLoading(false)
        return
      }
      setMsg({ text: '가입 완료! 로그인해주세요.', isError: false })
      setMode('login')
    } else if (mode === 'reset') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`,
      })
      if (error) {
        setMsg({ text: error.message, isError: true })
        setLoading(false)
        return
      }
      setMsg({ text: '✅ 비밀번호 재설정 이메일을 보냈습니다!', isError: false })
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #060B18 0%, #0A1628 50%, #080E1F 100%)' }}
    >
      {/* 배경 글로우 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1E40AF, #7C3AED, transparent)' }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">

        {/* 로고 */}
        <button onClick={() => router.push('/')} className="inline-block mb-2">
          <span className="text-4xl font-black tracking-[0.25em] text-white">HR</span>
        </button>
        <p className="text-blue-300 text-xs tracking-[0.35em] font-semibold mb-10">ADMIN</p>

        {/* 카드 */}
        <div
          className="rounded-2xl p-8 text-left"
          style={{ background: 'rgba(10,22,40,0.95)', border: '1px solid rgba(96,165,250,0.25)' }}
        >
          {/* 타이틀 */}
          <h2 className="text-2xl font-black text-white text-center mb-2">
            {mode === 'login' && '로그인'}
            {mode === 'signup' && '회원가입'}
            {mode === 'reset' && '비밀번호 찾기'}
          </h2>
          <p className="text-blue-300/60 text-sm text-center mb-8">
            {mode === 'login' && '관리자 계정으로 로그인하세요'}
            {mode === 'signup' && '새 관리자 계정을 만드세요'}
            {mode === 'reset' && '가입한 이메일로 재설정 링크를 보내드립니다'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-semibold text-blue-100 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl text-white text-sm focus:outline-none transition-all placeholder-blue-400/30 font-medium"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(96,165,250,0.3)',
                }}
              />
            </div>

            {/* 비밀번호 */}
            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-semibold text-blue-100 mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm focus:outline-none transition-all font-medium"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(96,165,250,0.3)',
                  }}
                />
              </div>
            )}

            {/* 메시지 */}
            {msg.text && (
              <div
                className={`text-sm px-4 py-3 rounded-xl font-medium ${
                  msg.isError
                    ? 'text-red-300 bg-red-500/10 border border-red-400/30'
                    : 'text-emerald-300 bg-emerald-500/10 border border-emerald-400/30'
                }`}
              >
                {msg.text}
              </div>
            )}

            {/* 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white text-base disabled:opacity-50 transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #DB2777)' }}
            >
              {loading ? '처리중...' : mode === 'login' ? '로그인' : mode === 'signup' ? '회원가입' : '재설정 이메일 보내기'}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3 text-center">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => { setMode('reset'); setMsg({ text: '', isError: false }) }}
                  className="block w-full text-sm text-blue-300 hover:text-white transition-colors py-1 font-medium"
                >
                  🔑 비밀번호를 잊으셨나요?
                </button>
                <button
                  onClick={() => { setMode('signup'); setMsg({ text: '', isError: false }) }}
                  className="block w-full text-sm text-blue-300 hover:text-white transition-colors py-1 font-medium"
                >
                  계정이 없으신가요?{' '}
                  <span className="text-white font-bold underline underline-offset-2">회원가입</span>
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => { setMode('login'); setMsg({ text: '', isError: false }) }}
                className="block w-full text-sm text-blue-300 hover:text-white transition-colors py-1 font-medium"
              >
                이미 계정이 있으신가요?{' '}
                <span className="text-white font-bold underline underline-offset-2">로그인</span>
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => { setMode('