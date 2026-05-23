'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [notes, setNotes] = useState<{[key: string]: string}>({})
  const [filter, setFilter] = useState('pending')
  const [openRequests, setOpenRequests] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      fetchRequests()
    }
    checkLogin()
  }, [])

  const fetchRequests = async () => {
    const { data } = await supabase.from('brand_requests').select('*').order('created_at', { ascending: false })
    setRequests(data || [])
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('brand_requests').update({ status, admin_note: notes[id] || '' }).eq('id', id)
    fetchRequests()
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  const filtered = requests.filter(r => r.status === filter)
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const approvedCount = requests.filter(r => r.status === 'approved').length

  const statusBadge = (status: string) => {
    if (status === 'pending') return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⏳ 검토중</span>
    if (status === 'approved') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">✅ 승인됨</span>
    if (status === 'rejected') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">❌ 반려됨</span>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white shadow-md flex flex-col p-4">
        <h1 className="text-lg font-bold mb-6 text-gray-800">관리자 메뉴</h1>
        <nav className="flex flex-col gap-1 flex-1">
          <button onClick={() => setOpenRequests(!openRequests)}
            className="text-left px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 flex justify-between">
            <span>📋 요청 관리</span><span>{openRequests ? '▲' : '▼'}</span>
          </button>
          {openRequests && (
            <div className="ml-3 flex flex-col gap-1">
              <button onClick={() => setFilter('pending')}
                className={`text-left px-4 py-2 rounded-lg text-sm flex justify-between ${filter === 'pending' ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>⏳ 검토중</span><span className="text-xs bg-yellow-100 text-yellow-700 rounded-full px-2">{pendingCount}</span>
              </button>
              <button onClick={() => setFilter('approved')}
                className={`text-left px-4 py-2 rounded-lg text-sm flex justify-between ${filter === 'approved' ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span>✅ 승인</span><span className="text-xs bg-green-100 text-green-700 rounded-full px-2">{approvedCount}</span>
              </button>
            </div>
          )}
          <button onClick={() => router.push('/admin/schedule')}
            className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 mt-1">
            📊 스케줄표
          </button>
          <button onClick={() => router.push('/admin/calendar')}
            className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
            📅 캘린더
          </button>
        </nav>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 mt-4">로그아웃</button>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6">{filter === 'pending' ? '⏳ 검토중 요청' : '✅ 승인된 요청'}</h2>
        <div className="flex flex-col gap-4 max-w-2xl">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg">{req.company_name || req.brand_name}</span>
                {statusBadge(req.status)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                <p>📧 {req.email}</p>
                <p>👤 {req.manager_name}</p>
                <p>📞 {req.manager_phone}</p>
                <p>🏢 {req.business_number}</p>
                <p>📱 {req.channel}</p>
              </div>
              {req.bank_image && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 mb-1">🏦 통장 사본</p>
                  <img src={req.bank_image} alt="통장사본" className="max-h-40 rounded-lg border object-contain" />
                </div>
              )}
              <input type="text" placeholder="관리자 메모 (선택)"
                value={notes[req.id] || ''} onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                className="border rounded-lg px-3 py-1 text-sm w-full mb-3" />
              <div className="flex gap-2">
                <button onClick={() => updateStatus(req.id, 'approved')} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-600">✅ 승인</button>
                <button onClick={() => updateStatus(req.id, 'rejected')} className="bg-red-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-500">❌ 반려</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-center py-16 text-gray-400"><p className="text-4xl mb-3">📭</p><p>요청이 없어요.</p></div>}
        </div>
      </main>
    </div>
  )
}