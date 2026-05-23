'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 틀렸어요.')
      return
    }
    router.push('/admin/dashboard')
  }

  const handleSignup = async () => {
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('회원가입 실패: ' + error.message)
    } else {
      setMessage('회원가입 완료! 이제 로그인해주세요.')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input type="email" placeholder="이메일" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-4 py-2" required />
          <input type="password" placeholder="비밀번호" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2" required />
          <button type="submit" className="bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-800">
            관리자 로그인
          </button>
          <button type="button" onClick={handleSignup}
            className="bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
            회원가입
          </button>
        </form>
      </div>
    </main>
  )
}