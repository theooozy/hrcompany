'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminDashboard() {
  const [inquiries, setInquiries] = useState([])
  const [brandRequests, setBrandRequests] = useState([])
  const [tab, setTab] = useState('inquiries')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      fetchData()
    }
    init()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: inq } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
    const { data: req } = await supabase.from('brand_requests').select('*').order('created_at', { ascending: false })
    setInquiries(inq || [])
    setBrandRequests(req || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatDate = (str) => {
    if (!str) return ''
    return new Date(str).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow">
            <span className="text-white font-black text-sm">HR</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">관리자 대시보드</span>
        </div>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-red-50">
          로그아웃
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button onClick={() => setTab('inquiries')}
            className={"px-6 py-2.5 rounded-xl text-sm font-semibold transition-all " + (tab === 'inquiries' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-700')}>
            브랜드 광고 문의 ({inquiries.length})
          </button>
          <button onClick={() => setTab('requests')}
            className={"px-6 py-2.5 rounded-xl text-sm font-semibold transition-all " + (tab === 'requests' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md' : 'text-gray-500 hover:text-gray-700')}>
            브랜드 요청 ({brandRequests.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <p>불러오는 중...</p>
          </div>
        ) : (
          <div>
            {tab === 'inquiries' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  브랜드 광고 문의 - 총 {inquiries.length}건
                </h2>
                {inquiries.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-gray-500 font-medium">아직 문의가 없어요</p>
                    <p className="text-gray-400 text-sm mt-1">홈페이지에서 문의가 들어오면 여기에 표시됩니다</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{inq.company || '(회사명 없음)'}</h3>
                            <p className="text-gray-400 text-sm mt-0.5">{formatDate(inq.created_at)}</p>
                          </div>
                          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-full border border-blue-100">신규 문의</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 text-xs mb-0.5">담당자</p>
                            <p className="text-gray-800 font-medium">{inq.name || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 text-xs mb-0.5">연락처</p>
                            <p className="text-gray-800 font-medium">{inq.phone || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                            <p className="text-gray-400 text-xs mb-0.5">이메일</p>
                            <p className="text-gray-800 font-medium">{inq.email || '-'}</p>
                          </div>
                        </div>
                        {inq.message && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-gray-400 text-xs mb-1">문의 내용</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{inq.message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'requests' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  브랜드 요청 - 총 {brandRequests.length}건
                </h2>
                {brandRequests.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-gray-500 font-medium">아직 요청이 없어요</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {brandRequests.map((req) => (
                      <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-gray-900 text-lg">{req.company_name || req.brand_name || '(이름 없음)'}</h3>
                          <span className={"text-xs font-semibold px-3 py-1.5 rounded-full border " + (req.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' : req.status === 'rejected' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100')}>
                            {req.status === 'approved' ? '승인' : req.status === 'rejected' ? '반려' : '검토중'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 text-xs mb-0.5">이메일</p>
                            <p className="text-gray-800 font-medium">{req.email || '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 text-xs mb-0.5">담당자</p>
                            <p className="text-gray-800 font-medium">{req.manager_name || '-'}</p>
                          </div>
                        </div>
                        <p className="text-gray-400 text-xs mt-3">{formatDate(req.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}