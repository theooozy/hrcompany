'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUSES = ['시작 전', '콘티 컨펌중', '콘티 완료', '영상 컨펌중', '진행 중', '영상 완료', '영상 컨펌 완료']
const STATUS_COLORS: {[key:string]:string} = {
  '시작 전': 'bg-gray-100 text-gray-600',
  '콘티 컨펌중': 'bg-purple-100 text-purple-700',
  '콘티 완료': 'bg-blue-100 text-blue-700',
  '영상 컨펌중': 'bg-yellow-100 text-yellow-700',
  '진행 중': 'bg-orange-100 text-orange-700',
  '영상 완료': 'bg-green-100 text-green-700',
  '영상 컨펌 완료': 'bg-emerald-100 text-emerald-700',
}

const CHANNELS = ['셀럽온','찐예쁨','미모지상주의','쇼잉','쇼숏','숏됐다','밈튜브','숏스커버리','유니랜드','신기+탬','숏믈리에','디어랩','숏픽','두근두근','전국댓글자랑','숏플레시','출석체크','ワクワク','スポログ','笑慇の一秒','おもしろ塾','一瞬劇場','絆タイム','チーズケーキ','オイシイワールド','モグモグ','トレ韓']

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState({
    request_id: '', product_name: '', brand_name: '', conti_name: '',
    video_name: '', channel: '', manager_name: '', status: '시작 전', youtube_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/admin/login')
    }
    checkLogin()
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const { data: s } = await supabase.from('schedules').select('*').order('deadline', { ascending: true })
    const { data: r } = await supabase.from('inquiries').select('*').eq('status', '승인').order('created_at', { ascending: false })
    setSchedules(s || [])
    setRequests(r || [])
  }

  const openEdit = (s: any) => {
    setEditId(s.id)
    setForm({
      request_id: s.request_id || '',
      product_name: s.product_name || '',
      brand_name: s.brand_name || '',
      conti_name: s.conti_name || '',
      video_name: s.video_name || '',
      channel: s.channel || '',
      manager_name: s.manager_name || '',
      status: s.status || '시작 전',
      youtube_url: s.youtube_url || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await supabase.from('schedules').update({
        product_name: form.product_name,
        brand_name: form.brand_name,
        conti_name: form.conti_name,
        video_name: form.video_name,
        channel: form.channel,
        manager_name: form.manager_name,
        status: form.status,
        youtube_url: form.youtube_url || null,
      }).eq('id', editId)
    }
    setShowForm(false)
    setEditId(null)
    fetchAll()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    await supabase.from('schedules').delete().eq('id', id)
    fetchAll()
  }

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from('schedules').update({ status }).eq('id', id)
    fetchAll()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-52 bg-slate-800 text-white flex flex-col py-6 px-4 min-h-screen">
        <div className="text-lg font-bold mb-8 px-2">관리자 메뉴</div>
        <div className="flex flex-col gap-1 flex-1">
          <button onClick={() => router.push('/admin/dashboard')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-700 transition">📋 요청 관리</button>
          <button onClick={() => router.push('/admin/schedule')} className="text-left px-4 py-2 rounded-lg text-sm text-white bg-slate-700 font-semibold">📊 스케줄표</button>
          <button onClick={() => router.push('/admin/calendar')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-slate-700 transition">📅 캘린더</button>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }}
          className="mt-4 text-sm text-slate-400 hover:text-white transition px-2 text-left"
        >로그아웃</button>
      </nav>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📊 스케줄표</h2>
          <button
            onClick={() => router.push('/admin/schedule/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition text-sm flex items-center gap-2"
          >
            <span className="text-lg leading-none">+</span> 새 스케줄 추가
          </button>
        </div>

        {/* Edit Modal */}
        {showForm && editId && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-lg font-bold mb-4">스케줄 수정</h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">승인된 브랜드에서 불러오기</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    onChange={e => {
                      const req = requests.find(r => r.id === e.target.value)
                      if (req) setForm(f => ({ ...f, request_id: req.id, brand_name: req.brand_name || '', product_name: req.product_name || '', channel: req.channel || '' }))
                    }}
                  >
                    <option value="">선택 안함</option>
                    {requests.map(r => (
                      <option key={r.id} value={r.id}>{r.brand_name} - {r.product_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제품명</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.product_name} onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.manager_name} onChange={e => setForm(f => ({ ...f, manager_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">채널</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                    <option value="">채널 선택</option>
                    {CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유튜브 URL</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm" value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">취소</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">저장</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">No</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">제품명</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">데드라인</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">브랜드</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">설명</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">콘티</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">영상</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">채널</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">상태</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">담당자</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">스케줄이 없어요. + 새 스케줄 추가 버튼을 눌러주세요.</td></tr>
              ) : (
                schedules.map((s, i) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{s.product_name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.deadline ? new Date(s.deadline).toLocaleDateString('ko-KR') : '-'}</td>
                    <td className="px-4 py-3">{s.brand_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.conti_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.conti_name || '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{s.video_name || '-'}</td>
                    <td className="px-4 py-3">{s.channel || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={s.status || '시작 전'}
                        onChange={e => handleStatusChange(s.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-semibold border-0 cursor-pointer ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">{s.manager_name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition">수정</button>
                        <button onClick={() => handleDelete(s.id)} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
