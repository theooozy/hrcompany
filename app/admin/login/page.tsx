'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminLogin() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    else router.push('/admin/dashboard')
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (password !== confirmPassword) { setError('비밀번호가 일치하지 않습니다.'); setLoading(false); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); setLoading(false); return }
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError('회원가입 실패: ' + error.message)
    else { setMessage('회원가입 완료! 로그인해주세요.'); setMode('login') }
    setLoading(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://hrcompany-seven.vercel.app/admin/login',
    })
    if (error) setError('이메일 전송 실패')
    else setMessage('비밀번호 재설정 링크를 이메일로 보냈습니다!')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl border border-gray-100 px-8 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mb-4 shadow-lg">
            <span className="text-white font-black text-2xl">HR</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '관리자 로그인' : mode === 'signup' ? '관리자 회원가입' : '비밀번호 찾기'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' ? '관리자 계정으로 로그인하세요' : mode === 'signup' ? '새 관리자 계정을 만드세요' : '이메일로 재설정 링크를 보내드립니다'}
          </p>
        </div>

        {message && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center font-medium">{message}</div>
        )}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">{error}</div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="비밀번호 입력"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-60">
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="6자 이상"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">비밀번호 확인</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="비밀번호 재입력"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-60">
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">가입한 이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all text-sm disabled:opacity-60">
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {mode === 'login' && (
            <div>
              <button onClick={() => { setMode('reset'); setError(''); setMessage('') }}
                className="block w-full text-center text-sm text-blue-600 font-semibold mb-2">
                비밀번호를 잊으셨나요?
              </button>
              <button onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                className="block w-full text-center text-sm text-gray-500">
                계정이 없으신가요? 회원가입하기
              </button>
            </div>
          )}
          {mode === 'signup' && (
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className="text-sm text-gray-500">
              이미 계정이 있으신가요? 로그인하기
            </button>
          )}
          {mode === 'reset' && (
            <button onClick={() => { setMode('login'); setError(''); setMessage('') }}
              className="text-sm text-blue-600 font-semibold">
              로그인으로 돌아가기
            </button>
          )}
          <a href="/" className="text-sm text-gray-400 font-medium mt-2">
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}