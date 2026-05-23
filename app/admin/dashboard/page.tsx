'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Inquiry = {
  id: string;
  created_at: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  scheduled_date: string | null;
  type: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'inquiries' | 'calendar'>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    checkAuth();
    fetchInquiries();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  };

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setInquiries(data);
    setLoading(false);
  };

  const handleApprove = async (inquiry: Inquiry) => {
    const date = selectedDates[inquiry.id] || inquiry.scheduled_date;
    if (!date) {
      alert('날짜를 먼저 선택해주세요.');
      return;
    }
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'approved', scheduled_date: date })
      .eq('id', inquiry.id);
    if (!error) {
      alert('승인 완료! 캘린더에 추가됐습니다.');
      fetchInquiries();
    } else {
      alert('오류: ' + error.message);
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (!error) fetchInquiries();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const getApprovedForDate = (dateStr: string) => {
    return inquiries.filter(
      (i) => i.status === 'approved' && i.scheduled_date === dateStr
    );
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">승인됨</span>;
    if (status === 'rejected') return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">거절됨</span>;
    return <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">대기중</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">HR</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">관리자</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => setActiveMenu('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span>📋</span>
            <span>광고 문의</span>
            {inquiries.filter(i => i.status === 'pending').length > 0 && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeMenu === 'inquiries' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                {inquiries.filter(i => i.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveMenu('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span>📅</span>
            <span>캘린더</span>
          </button>
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"
          >
            <span>🚪</span>
            <span>로그아웃</span>
          </button>
          <a
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"
          >
            <span>🏠</span>
            <span>홈으로</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56 p-8">
        {/* Inquiries Tab */}
        {activeMenu === 'inquiries' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">광고 문의</h1>
              <p className="text-slate-500 text-sm">홈페이지에서 접수된 브랜드 광고 문의 목록입니다.</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-slate-400">불러오는 중...</div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-slate-500">아직 문의가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">{inquiry.company}</h3>
                          {statusBadge(inquiry.status)}
                        </div>
                        <p className="text-slate-500 text-sm">
                          {inquiry.name} · {inquiry.email} · {inquiry.phone}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          {new Date(inquiry.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {inquiry.status === 'approved' && inquiry.scheduled_date && (
                        <div className="text-right">
                          <div className="text-xs text-slate-400 mb-1">예정일</div>
                          <div className="text-sm font-semibold text-blue-600">{formatDate(inquiry.scheduled_date)}</div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-4">
                      <p className="text-slate-600 text-sm leading-relaxed">{inquiry.message}</p>
                    </div>

                    {inquiry.status === 'pending' && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <input
                          type="date"
                          value={selectedDates[inquiry.id] || ''}
                          onChange={(e) => setSelectedDates({ ...selectedDates, [inquiry.id]: e.target.value })}
                          className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                          onClick={() => handleApprove(inquiry)}
                          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-sm"
                        >
                          ✓ 날짜 선택 후 승인
                        </button>
                        <button
                          onClick={() => handleReject(inquiry.id)}
                          className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
                        >
                          ✕ 거절
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeMenu === 'calendar' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">캘린더</h1>
              <p className="text-slate-500 text-sm">승인된 광고 일정을 확인합니다.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                >
                  ←
                </button>
                <h2 className="text-lg font-bold text-slate-800">
                  {currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}
                </h2>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all"
                >
                  →
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                  <div key={d} className={`text-center py-3 text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={'empty-' + i} className="border-r border-b border-slate-50 min-h-24 p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const events = getApprovedForDate(dateStr);
                  const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                  const dayOfWeek = (firstDay + i) % 7;
                  return (
                    <div
                      key={day}
                      className="border-r border-b border-slate-50 min-h-24 p-2"
                    >
                      <div className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-slate-700'}`}>
                        {day}
                      </div>
                      {events.map((ev) => (
                        <div
                          key={ev.id}
                          className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mb-1 font-medium truncate"
                          title={ev.company + ' - ' + ev.name}
                        >
                          📢 {ev.company}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Approved list */}
            {inquiries.filter(i => i.status === 'approved').length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-slate-700 mb-3">승인된 광고 일정</h3>
                <div className="space-y-3">
                  {inquiries
                    .filter(i => i.status === 'approved')
                    .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
                    .map(i => (
                      <div key={i.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">📢</div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800">{i.company}</div>
                          <div className="text-sm text-slate-500">{i.name} · {i.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-600">{formatDate(i.scheduled_date || '')}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">승인됨</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
