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

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState({
    product_name: '', brand_name: '', deadline: '', description: '콘티',
    conti_name: '', video_name: '', channel: '', manager_name: '', status: '시작 전', youtube_url: ''
  })
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      fetchAll()
    }
    checkLogin()
  }, [])

  const fetchAll = async () => {
    const [{ data: s }, { data: r }] = await Promise.all([
      supabase.from('schedules').select('*').order('deadline', { ascending: true }),
      supabase.from('brand_requests').select('*').eq('status', 'approved')
    ])
    setSchedules(s || [])
    setRequests(r || [])
  }

  const handleSave = async () => {
    if (editId) {
      await supabase.from('schedules').update(form).eq('id', editId)
    } else {
      await supabase.from('schedules').insert(form)
    }
    setShowForm(false); setEditId(null)
    setForm({ product_name: '', brand_name: '', deadline: '', description: '콘티', conti_name: '', video_name: '', channel: '', manager_name: '', status: '시작 전', youtube_url: '' })
    fetchAll()
  }

  const handleEdit = (s: any) => {
    setEditId(s.id)
    setForm({ product_name: s.product_name||'', brand_name: s.brand_name||'', deadline: s.deadline ? s.deadline.slice(0,16) : '', description: s.description||'콘티', conti_name: s.conti_name||'', video_name: s.video_name||'', channel: s.channel||'', manager_name: s.manager_name||'', status: s.status||'시작 전', youtube_url: s.youtube_url||'' })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('삭제할까요?')) { await supabase.from('schedules').delete().eq('id', id); fetchAll() }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white shadow-md flex flex-col p-4">
        <h1 className="text-lg font-bold mb-6 text-gray-800">관리자 메뉴</h1>
        <nav className="flex flex-col gap-1 flex-1">
          <button onClick={() => router.push('/admin/dashboard')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📋 요청 관리</button>
          <button className="text-left px-4 py-2 rounded-lg text-sm bg-gray-700 text-white font-medium">📊 스케줄표</button>
          <button onClick={() => router.push('/admin/calendar')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📅 캘린더</button>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-400 hover:text-gray-600 mt-4">로그아웃</button>
      </aside>

      <main className="flex-1 p-6 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📊 스케줄표</h2>
          <button onClick={() => { setShowForm(true); setEditId(null) }} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm">+ 새 스케줄 추가</button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{editId ? '스케줄 수정' : '새 스케줄 추가'}</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">승인된 브랜드에서 불러오기</label>
                  <select className="border rounded-lg px-3 py-2 w-full text-sm mt-1"
                    onChange={(e) => {
                      const r = requests.find(r => r.id == e.target.value)
                      if (r) setForm(f => ({ ...f, brand_name: r.company_name || r.brand_name, channel: r.channel, manager_name: r.manager_name }))
                    }}>
                    <option value="">선택 안함</option>
                    {requests.map(r => <option key={r.id} value={r.id}>{r.company_name || r.brand_name}</option>)}
                  </select>
                </div>
                {[
                  { label: '제품명', key: 'product_name' },
                  { label: '브랜드명', key: 'brand_name' },
                  { label: '담당자', key: 'manager_name' },
                  { label: '채널', key: 'channel' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <input type="text" value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1" />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-gray-700">데드라인</label>
                  <input type="datetime-local" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">설명 유형</label>
                  <select value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1">
                    <option>콘티</option><option>영상</option><option>단순</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">콘티 이름</label>
                  <input type="text" value={form.conti_name} onChange={e => setForm(f => ({ ...f, conti_name: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">영상 이름</label>
                  <input type="text" value={form.video_name} onChange={e => setForm(f => ({ ...f, video_name: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">상태</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {form.status === '영상 컨펌 완료' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">유튜브 링크</label>
                    <input type="url" value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))} className="border rounded-lg px-3 py-2 w-full text-sm mt-1" placeholder="https://youtube.com/..." />
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={handleSave} className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm flex-1">저장</button>
                <button onClick={() => { setShowForm(false); setEditId(null) }} className="bg-gray-200 px-4 py-2 rounded-lg text-sm flex-1">취소</button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white text-sm border-collapse">
            <thead>
              <tr className="bg-gray-700 text-white">
                {['No', '제품명', '데드라인', '브랜드', '설명', '콘티', '영상', '채널', '상태', '담당자', ''].map(h => (
                  <th key={h} className="px-3 py-3 text-left whitespace-nowrap font-medium border-r border-gray-600 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => (
                <tr key={s.id} className={`border-b hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-3 py-2 text-gray-400 border-r">{i + 1}</td>
                  <td className="px-3 py-2 font-medium border-r whitespace-nowrap">{s.product_name}</td>
                  <td className="px-3 py-2 text-gray-600 border-r whitespace-nowrap">
                    {s.deadline ? new Date(s.deadline).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-3 py-2 border-r">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{s.brand_name}</span>
                  </td>
                  <td className="px-3 py-2 border-r">
                    <span className={`px-2 py-0.5 rounded text-xs ${s.description === '콘티' ? 'bg-purple-100 text-purple-700' : s.description === '영상' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>{s.description}</span>
                  </td>
                  <td className="px-3 py-2 border-r text-gray-600">{s.conti_name || '-'}</td>
                  <td className="px-3 py-2 border-r text-gray-600">{s.video_name || '-'}</td>
                  <td className="px-3 py-2 border-r text-gray-600">{s.channel || '-'}</td>
                  <td className="px-3 py-2 border-r">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span>
                  </td>
                  <td className="px-3 py-2 border-r text-gray-600 whitespace-nowrap">{s.manager_name || '-'}</td>
                  <td className="px-3 py-2 flex gap-1">
                    <button onClick={() => handleEdit(s)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">수정</button>
                    <button onClick={() => handleDelete(s.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">삭제</button>
                    {s.youtube_url && <a href={s.youtube_url} target="_blank" className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">▶</a>}
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={11} className="text-center py-12 text-gray-400">스케줄이 없어요. + 새 스케줄 추가 버튼을 눌러주세요.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}