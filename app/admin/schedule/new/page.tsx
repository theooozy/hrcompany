'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const CHANNELS = ['셀럽온','찐예쁨','미모지상주의','쇼잉','쇼숏','숏됐다','밈튜브','숏스커버리','유니랜드','신기+탬','숏믈리에','디어랩','숏픽','두근두근','전국댓글자랑','숏플레시','출석체크','ワクワク','スポログ','笑慇の一秒','おもしろ塾','一瞬劇場','絆タイム','チーズケーキ','オイシイワールド','モグモグ','トレ韓']

export default function NewSchedulePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    product_name: '',
    brand_name: '',
    channel: '',
    manager_name: '',
    deadline: '',
    status: '진행중',
    youtube_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product_name.trim()) { setError('제목을 입력해주세요.'); return }
    if (!form.deadline) { setError('날짜/시간을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    const { error: insertError } = await supabase.from('schedules').insert([{
      product_name: form.product_name,
      brand_name: form.brand_name,
      channel: form.channel,
      manager_name: form.manager_name,
      deadline: form.deadline,
      status: form.status,
      youtube_url: form.youtube_url,
    }])
    setLoading(false)
    if (insertError) {
      setError('저장 실패: ' + insertError.message)
    } else {
      router.push('/admin/calendar')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.push('/admin/calendar')} className="text-gray-400 hover:text-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">새 일정 추가</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">브랜드명</label>
            <input
              name="brand_name"
              value={form.brand_name}
              onChange={handleChange}
              placeholder="브랜드명을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">채널</label>
            <select
              name="channel"
              value={form.channel}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">채널 선택</option>
              {CHANNELS.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">담당자</label>
            <input
              name="manager_name"
              value={form.manager_name}
              onChange={handleChange}
              placeholder="담당자 이름"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              날짜/시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">상태</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
              <option value="대기">대기</option>
              <option value="보류">보류</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">유튜브 URL</label>
            <input
              name="youtube_url"
              value={form.youtube_url}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin/calendar')}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
