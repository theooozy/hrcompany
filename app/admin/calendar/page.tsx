'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CHANNELS = ['셀럽온','찐예쁨','미모지상주의','쇼잉','쇼숏','숏됐다','밈튜브','숏스커버리','유니랜드','신기+탬','숏믈리에','디어랩','숏픽','두근두근','전국댓글자랑','숏플레시','출석체크','ワクワク','スポログ','笑慇の一秒','おもしろ塾','一瞬劇場','絆タイム','チーズケーキ','オイシイワールド','モグモグ','トレ韓']

type Schedule = {
  id: string
  product_name: string
  brand_name: string
  channel: string
  manager_name: string
  deadline: string
  status: string
  youtube_url?: string
}

type NewSchedule = {
  product_name: string
  brand_name: string
  channel: string
  manager_name: string
  deadline: string
  status: string
  youtube_url: string
}

const emptyForm: NewSchedule = {
  product_name: '',
  brand_name: '',
  channel: '',
  manager_name: '',
  deadline: '',
  status: '진행중',
  youtube_url: '',
}

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState<NewSchedule>(emptyForm)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/admin/login'); return }
      fetchSchedules()
    }
    checkLogin()
  }, [])

  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select('*')
    if (data) setSchedules(data)
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = ['일','월','화','수','목','금','토']

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter(s => s.deadline?.startsWith(dateStr))
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelected(getSchedulesForDay(day))
  }

  const openAddModal = (dateStr?: string) => {
    setAddForm({ ...emptyForm, deadline: dateStr ? dateStr + 'T09:00' : '' })
    setAddError('')
    setShowAddModal(true)
  }

  const handleAddFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAddForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.product_name || !addForm.deadline) {
      setAddError('제목과 날짜는 필수입니다.')
      return
    }
    setAddLoading(true)
    setAddError('')
    const payload: Record<string, string | null> = {
      product_name: addForm.product_name,
      brand_name: addForm.brand_name || null,
      channel: addForm.channel || null,
      manager_name: addForm.manager_name || null,
      deadline: addForm.deadline,
      status: addForm.status,
      youtube_url: addForm.youtube_url || null,
    }
    const { error } = await supabase.from('schedules').insert([payload])
    setAddLoading(false)
    if (error) {
      setAddError('저장 중 오류: ' + error.message)
    } else {
      setShowAddModal(false)
      setAddForm(emptyForm)
      await fetchSchedules()
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white shadow-md flex flex-col p-4">
        <h1 className="text-lg font-bold mb-6 text-gray-800">관리자 메뉴</h1>
        <nav className="flex flex-col gap-1 flex-1">
          <button onClick={() => router.push('/admin/dashboard')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📋 요청 관리</button>
          <button onClick={() => router.push('/admin/schedule')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📅 스케줄표</button>
          <button className="text-left px-4 py-2 rounded-lg text-sm bg-gray-700 text-white font-medium">📆 캘린더</button>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-400 hover:text-gray-600 mt-4">로그아웃</button>
      </aside>

      <main className="flex-1 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">◀</button>
            <h2 className="text-2xl font-bold">{year}년 {month + 1}월</h2>
            <button onClick={nextMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">▶</button>
          </div>
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition-all text-sm"
          >
            <span className="text-lg leading-none">+</span> 일정 추가
          </button>
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-7">
            {days.map((d, i) => (
              <div key={d} className={`text-center py-3 text-sm font-semibold border-b ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array(firstDay).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b min-h-[100px] bg-gray-50" />
            ))}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day
              const daySchedules = getSchedulesForDay(day)
              const dow = (firstDay + i) % 7
              return (
                <div
                  key={day}
                  className={`border-r border-b min-h-[100px] p-1 cursor-pointer hover:bg-blue-50 transition-colors relative group ${isToday ? 'bg-blue-50' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-gray-700'}`}>{day}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        openAddModal(dateStr)
                      }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-700 transition-all"
                    >+</button>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {daySchedules.slice(0, 3).map(s => (
                      <div key={s.id} className="text-xs px-1 py-0.5 rounded truncate bg-blue-100 text-blue-700">
                        {s.product_name}
                      </div>
                    ))}
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-gray-400">+{daySchedules.length - 3}개</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 날짜 클릭 시 스케줄 오버레이 */}
        {selected.length > 0 && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected([])}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">📅 {selectedDate} 스케줄</h3>
                <button
                  onClick={() => {
                    setSelected([])
                    openAddModal(selectedDate)
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  <span>+</span> 추가
                </button>
              </div>
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                {selected.map(s => (
                  <div key={s.id} className="border rounded-lg p-3">
                    <div className="font-semibold">{s.product_name}</div>
                    {s.brand_name && <p className="text-sm text-gray-500">브랜드: {s.brand_name}</p>}
                    {s.channel && <p className="text-sm text-gray-500">채널: {s.channel}</p>}
                    {s.manager_name && <p className="text-sm text-gray-500">담당자: {s.manager_name}</p>}
                    <p className="text-sm text-gray-500">날짜: {new Date(s.deadline).toLocaleString('ko-KR')}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s.status}</span>
                    {s.youtube_url && <a href={s.youtube_url} target="_blank" className="block text-xs text-red-500 mt-1">▶ 유튜브 링크</a>}
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected([])} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm">닫기</button>
            </div>
          </div>
        )}

        {/* 일정 직접 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-5 text-slate-800">📝 일정 직접 추가</h3>
              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">제목 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="product_name"
                    value={addForm.product_name}
                    onChange={handleAddFormChange}
                    placeholder="예) OO브랜드 숏폼 제작"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">브랜드명</label>
                    <input
                      type="text"
                      name="brand_name"
                      value={addForm.brand_name}
                      onChange={handleAddFormChange}
                      placeholder="브랜드명"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">채널</label>
                    <select
                      name="channel"
                      value={addForm.channel}
                      onChange={handleAddFormChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    >
                      <option value="">채널 선택</option>
                      {CHANNELS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">담당자</label>
                    <input
                      type="text"
                      name="manager_name"
                      value={addForm.manager_name}
                      onChange={handleAddFormChange}
                      placeholder="담당자명"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">날짜/시간 <span className="text-red-500">*</span></label>
                    <input
                      type="datetime-local"
                      name="deadline"
                      value={addForm.deadline}
                      onChange={handleAddFormChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">상태</label>
                    <select
                      name="status"
                      value={addForm.status}
                      onChange={handleAddFormChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    >
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                      <option value="대기">대기</option>
                      <option value="보류">보류</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">유튜브 URL</label>
                    <input
                      type="url"
                      name="youtube_url"
                      value={addForm.youtube_url}
                      onChange={handleAddFormChange}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>
                </div>
                {addError && <p className="text-red-500 text-sm">{addError}</p>}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
                  >취소</button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-60"
                  >{addLoading ? '저장 중...' : '일정 저장'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
