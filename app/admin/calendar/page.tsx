'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selected, setSelected] = useState<Schedule[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/admin/login')
    }
    checkLogin()
  }, [router])

  useEffect(() => {
    fetchSchedules()
  }, [year, month])

  const fetchSchedules = async () => {
    const start = new Date(year, month, 1).toISOString()
    const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .gte('deadline', start)
      .lte('deadline', end)
      .order('deadline', { ascending: true })
    setSchedules(data || [])
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const getSchedulesForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return schedules.filter(s => s.deadline.startsWith(dateStr))
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setSelected(getSchedulesForDay(day))
  }

  const statusColor = (status: string) => {
    if (status === '완료') return 'bg-green-100 text-green-700'
    if (status === '진행중') return 'bg-blue-100 text-blue-700'
    if (status === '대기') return 'bg-yellow-100 text-yellow-700'
    if (status === '보류') return 'bg-red-100 text-red-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-52 bg-slate-800 text-white flex flex-col py-6 px-4 min-h-screen">
        <div className="text-lg font-bold mb-8 px-2">관리자 메뉴</div>
        <nav className="flex flex-col gap-1 flex-1">
          <a href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-sm">
            📋 요청 관리
          </a>
          <a href="/admin/schedule" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-sm">
            📊 스케줄표
          </a>
          <a href="/admin/calendar" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 transition text-sm font-semibold">
            📅 캘린더
          </a>
        </nav>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }}
          className="mt-4 text-sm text-slate-400 hover:text-white transition px-2"
        >
          로그아웃
        </button>
      </nav>

      <main className="flex-1 p-8 overflow-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center justify-between gap-4 mb-6 w-full">
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">◀</button>
              <h2 className="text-2xl font-bold">{year}년 {month + 1}월</h2>
              <button onClick={nextMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">▶</button>
            </div>
            <button
              onClick={() => router.push('/admin/schedule/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold shadow hover:bg-blue-700 transition-all text-sm"
            >
              <span className="text-lg leading-none">+</span> 일정 추가
            </button>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="grid grid-cols-7 border-b">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className={`text-center py-3 text-sm font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={'empty-' + i} className="border-r border-b min-h-[100px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const daySchedules = getSchedulesForDay(day)
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
              const col = (firstDay + i) % 7
              return (
                <div
                  key={day}
                  className={`border-r border-b min-h-[100px] p-1 cursor-pointer hover:bg-gray-50 group relative ${isToday ? 'bg-blue-50' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : col === 0 ? 'text-red-500' : col === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); router.push('/admin/schedule/new') }}
                      className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-lg font-bold w-6 h-6 flex items-center justify-center rounded transition"
                    >+</button>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {daySchedules.slice(0, 3).map(s => (
                      <div key={s.id} className={`text-xs px-1 py-0.5 rounded truncate ${statusColor(s.status)}`}>
                        {s.product_name}
                      </div>
                    ))}
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-gray-400 px-1">+{daySchedules.length - 3}개 더</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 날짜 클릭 오버레이 */}
        {selected.length > 0 && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setSelected([])}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{selectedDate} 일정</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelected([]); router.push('/admin/schedule/new') }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    <span>+</span> 추가
                  </button>
                  <button onClick={() => setSelected([])} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
                </div>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selected.map(s => (
                  <div key={s.id} className="border rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(s.status)}`}>{s.status}</span>
                      <span className="font-semibold text-sm">{s.product_name}</span>
                    </div>
                    {s.brand_name && <div className="text-xs text-gray-500">브랜드: {s.brand_name}</div>}
                    {s.channel && <div className="text-xs text-gray-500">채널: {s.channel}</div>}
                    {s.manager_name && <div className="text-xs text-gray-500">담당자: {s.manager_name}</div>}
                    <div className="text-xs text-gray-400 mt-1">{new Date(s.deadline).toLocaleString('ko-KR')}</div>
                    {s.youtube_url && (
                      <a href={s.youtube_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline mt-1 block truncate">{s.youtube_url}</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
