'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CalendarPage() {
  const [schedules, setSchedules] = useState<any[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState<any[]>([])
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
    setSchedules(data || [])
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getSchedulesForDay = (day: number) => {
    return schedules.filter(s => {
      if (!s.deadline) return false
      const d = new Date(s.deadline)
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
    })
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const days = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white shadow-md flex flex-col p-4">
        <h1 className="text-lg font-bold mb-6 text-gray-800">관리자 메뉴</h1>
        <nav className="flex flex-col gap-1 flex-1">
          <button onClick={() => router.push('/admin/dashboard')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📋 요청 관리</button>
          <button onClick={() => router.push('/admin/schedule')} className="text-left px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100">📊 스케줄표</button>
          <button className="text-left px-4 py-2 rounded-lg text-sm bg-gray-700 text-white font-medium">📅 캘린더</button>
        </nav>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-sm text-gray-400 hover:text-gray-600 mt-4">로그아웃</button>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={prevMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">◀</button>
          <h2 className="text-2xl font-bold">{year}년 {month + 1}월</h2>
          <button onClick={nextMonth} className="bg-white shadow px-3 py-1 rounded-lg hover:bg-gray-100">▶</button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-7">
            {days.map((d, i) => (
              <div key={d} className={`text-center py-3 text-sm font-semibold border-b ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="border-r border-b min-h-[100px] bg-gray-50" />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1
              const daySchedules = getSchedulesForDay(day)
              const isToday = new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day
              return (
                <div key={day} className={`border-r border-b min-h-[100px] p-1 cursor-pointer hover:bg-blue-50 ${isToday ? 'bg-yellow-50' : ''}`}
                  onClick={() => setSelected(daySchedules)}>
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-yellow-400 text-white' : 'text-gray-700'}`}>{day}</div>
                  <div className="flex flex-col gap-0.5">
                    {daySchedules.slice(0, 3).map(s => (
                      <div key={s.id} className="text-xs bg-blue-500 text-white px-1 py-0.5 rounded truncate">{s.brand_name} - {s.product_name}</div>
                    ))}
                    {daySchedules.length > 3 && <div className="text-xs text-gray-400">+{daySchedules.length - 3}개 더</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected([])}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-4">📅 해당 날짜 스케줄</h3>
              <div className="flex flex-col gap-3">
                {selected.map(s => (
                  <div key={s.id} className="border rounded-lg p-3">
                    <div className="font-semibold">{s.product_name}</div>
                    <p className="text-sm text-gray-500">브랜드: {s.brand_name}</p>
                    <p className="text-sm text-gray-500">채널: {s.channel}</p>
                    <p className="text-sm text-gray-500">담당자: {s.manager_name}</p>
                    <p className="text-sm text-gray-500">데드라인: {new Date(s.deadline).toLocaleString('ko-KR')}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{s.status}</span>
                    {s.youtube_url && <a href={s.youtube_url} target="_blank" className="block text-xs text-red-500 mt-1">▶ 유튜브 링크</a>}
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected([])} className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg text-sm">닫기</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}