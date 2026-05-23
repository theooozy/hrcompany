'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CHANNELS = ['셀럽온', '쇼숏', '쇼잉']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({
    company_name: '', email: '', manager_name: '',
    manager_phone: '', business_number: '', channel: ''
  })
  const [bankFile, setBankFile] = useState<File | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      fetchRequests(user.id)
    }
    getUser()
  }, [])

  const fetchRequests = async (userId: string) => {
    const { data } = await supabase.from('brand_requests').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setMessage('')
    if (!form.channel) { setError('선호하는 채널을 선택해주세요.'); return }
    setLoading(true)

    let bank_image = ''
    if (bankFile) {
      const fileName = `${user.id}_${Date.now()}_${bankFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('bank-images').upload(fileName, bankFile)
      if (uploadError) { setError('이미지 업로드 실패: ' + uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('bank-images').getPublicUrl(fileName)
      bank_image = urlData.publicUrl
    }

    const { error } = await supabase.from('brand_requests').insert({
      user_id: user.id, ...form, bank_image, status: 'pending'
    })
    setLoading(false)
    if (error) { setError('제출 실패: ' + error.message) }
    else {
      setMessage('요청이 제출됐어요! 관리자 승인을 기다려주세요.')
      setForm({ company_name: '', email: '', manager_name: '', manager_phone: '', business_number: '', channel: '' })
      setBankFile(null)
      fetchRequests(user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut(); router.push('/')
  }

  const statusLabel = (status: string) => {
    if (status === 'pending') return '⏳ 검토중'
    if (status === 'approved') return '✅ 승인'
    if (status === 'rejected') return '❌ 반려'
    return status
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">브랜드 요청하기</h2>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:underline">로그아웃</button>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 flex flex-col gap-4">
          {[
            { label: '회사명', name: 'company_name', type: 'text', placeholder: '회사명 입력' },
            { label: '이메일', name: 'email', type: 'email', placeholder: '연락받을 이메일' },
            { label: '담당자 이름', name: 'manager_name', type: 'text', placeholder: '담당자 이름' },
            { label: '담당자 연락처', name: 'manager_phone', type: 'tel', placeholder: '010-0000-0000' },
            { label: '사업자번호', name: 'business_number', type: 'text', placeholder: '000-00-00000' },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} name={name} placeholder={placeholder}
                value={(form as any)[name]} onChange={handleChange}
                className="border rounded-lg px-4 py-2 w-full" required />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">선호하는 채널</label>
            <select name="channel" value={form.channel} onChange={handleChange}
              className="border rounded-lg px-4 py-2 w-full">
              <option value="">채널 선택</option>
              {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">통장 사본</label>
            <input type="file" accept="image/*" ref={fileRef}
              onChange={(e) => setBankFile(e.target.files?.[0] || null)}
              className="border rounded-lg px-4 py-2 w-full text-sm" />
            {bankFile && <p className="text-xs text-gray-500 mt-1">선택된 파일: {bankFile.name}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}
          <button type="submit" disabled={loading}
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {loading ? '제출 중...' : '요청 제출'}
          </button>
        </form>

        <h3 className="text-lg font-semibold mb-3">내 요청 목록</h3>
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{req.company_name}</span>
                <span>{statusLabel(req.status)}</span>
              </div>
              <p className="text-sm text-gray-500">채널: {req.channel}</p>
              {req.admin_note && <p className="text-sm text-blue-500 mt-1">관리자 메모: {req.admin_note}</p>}
            </div>
          ))}
          {requests.length === 0 && <p className="text-gray-400 text-center">아직 요청이 없어요.</p>}
        </div>
      </div>
    </main>
  )
}