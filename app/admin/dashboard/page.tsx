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
  name: string;
  email: string;
  phone: string;
  brand: string;
  upload_date: string;
  channels: string;
  product_link: string;
  material: string;
  secondary_use: string;
  video_concept: string;
  extra: string;
  status: string;
  scheduled_date: string | null;
  type: string;
  youtube_url?: string;
  business_number?: string;
  bank_account_image?: string;
  number?: number;
};

type Comment = {
  id: string;
  inquiry_id: string;
  author: string;
  content: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'inquiries' | 'table' | 'calendar'>('inquiries');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDetail, setSelectedDetail] = useState<Inquiry | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');
  const [ytInputs, setYtInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => { checkAuth(); fetchInquiries(); }, []);

  useEffect(() => {
    if (selectedDetail) fetchComments(selectedDetail.id);
  }, [selectedDetail]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  };

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    if (!error && data) setInquiries(data);
    setLoading(false);
  };

  const fetchComments = async (inquiryId: string) => {
    const { data } = await supabase.from('inquiry_comments').select('*').eq('inquiry_id', inquiryId).order('created_at', { ascending: true });
    if (data) setComments(data);
  };

  const handleApprove = async (inquiry: Inquiry) => {
    const date = selectedDates[inquiry.id] || inquiry.scheduled_date;
    if (!date) { alert('날짜를 먼저 선택해주세요.'); return; }
    const { error } = await supabase.from('inquiries').update({ status: 'approved', scheduled_date: date }).eq('id', inquiry.id);
    if (!error) { alert('승인 완료!'); fetchInquiries(); }
    else alert('오류: ' + error.message);
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase.from('inquiries').update({ status: 'rejected' }).eq('id', id);
    if (!error) fetchInquiries();
  };

  const handleSaveYoutube = async (id: string) => {
    const url = ytInputs[id];
    if (!url) { alert('유튜브 링크를 입력해주세요.'); return; }
    const { error } = await supabase.from('inquiries').update({ youtube_url: url }).eq('id', id);
    if (!error) {
      alert('유튜브 링크 저장 완료!');
      fetchInquiries();
      if (selectedDetail?.id === id) setSelectedDetail((prev) => prev ? { ...prev, youtube_url: url } : null);
    } else alert('오류: ' + error.message);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !commentAuthor.trim()) { alert('작성자와 댓글을 입력해주세요.'); return; }
    if (!selectedDetail) return;
    setSubmittingComment(true);
    const { error } = await supabase.from('inquiry_comments').insert([{ inquiry_id: selectedDetail.id, author: commentAuthor, content: newComment }]);
    if (!error) { setNewComment(''); fetchComments(selectedDetail.id); }
    else alert('댓글 오류: ' + error.message);
    setSubmittingComment(false);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/admin/login'); };

  const getDaysInMonth = (date: Date) => {
    const y = date.getFullYear(); const m = date.getMonth();
    return { firstDay: new Date(y, m, 1).getDay(), daysInMonth: new Date(y, m + 1, 0).getDate(), year: y, month: m };
  };

  const getApprovedForDate = (dateStr: string) => inquiries.filter(i => i.status === 'approved' && i.scheduled_date === dateStr);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">승인됨</span>;
    if (status === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">거절됨</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">대기중</span>;
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const approvedInquiries = inquiries.filter(i => i.status === 'approved');

  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="flex gap-2">
        <span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">{label}</span>
        <span className="text-xs text-slate-700 whitespace-pre-wrap">{value}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">HR</span>
            </div>
            <span className="font-bold text-slate-800 text-sm">관리자 대시보드</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => setActiveMenu('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📋</span><span>광고 문의</span>
            {pendingCount > 0 && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeMenu === 'inquiries' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveMenu('table')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📊</span><span>표 보기</span>
          </button>
          <button onClick={() => setActiveMenu('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📅</span><span>캘린더</span>
          </button>
        </nav>
        <div className="p-3 border-t border-slate-100 space-y-1">
          <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"><span>🏠</span><span>홈으로</span></a>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"><span>🚪</span><span>로그아웃</span></button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8">

        {activeMenu === 'inquiries' && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div><h1 className="text-2xl font-bold text-slate-800 mb-1">광고 문의</h1><p className="text-slate-500 text-sm">홈페이지에서 접수된 브랜드 광고 문의 목록입니다.</p></div>
              <button onClick={fetchInquiries} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
            </div>
            {loading ? <div className="flex items-center justify-center h-40 text-slate-400">불러오는 중...</div>
              : inquiries.length === 0 ? <div className="bg-white rounded-2xl p-12 text-center border border-slate-100"><div className="text-4xl mb-4">📭</div><p className="text-slate-500">아직 문의가 없습니다.</p></div>
              : <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg shrink-0">📢</div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5"><span className="font-bold text-slate-800">{inq.brand || '브랜드 미입력'}</span>{statusBadge(inq.status)}</div>
                          <div className="text-xs text-slate-400">{inq.name} · {inq.email} · {formatDateTime(inq.created_at)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {inq.status === 'approved' && inq.scheduled_date && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{formatDate(inq.scheduled_date)}</span>}
                        <span className="text-slate-400 text-sm">{expanded === inq.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded === inq.id && (
                      <div className="border-t border-slate-100 p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 mb-5 bg-slate-50 rounded-xl p-4">
                          <InfoRow label="브랜드" value={inq.brand} />
                          <InfoRow label="업로드 일시" value={inq.upload_date} />
                          <InfoRow label="희망 채널" value={inq.channels} />
                          <InfoRow label="제품 링크" value={inq.product_link} />
                          <InfoRow label="활용 소재" value={inq.material} />
                          <InfoRow label="2차 활용" value={inq.secondary_use} />
                          <InfoRow label="영상 컨셉" value={inq.video_concept} />
                          <InfoRow label="기타" value={inq.extra} />
                          <InfoRow label="담당자" value={inq.name + (inq.phone ? ' · ' + inq.phone : '')} />
                          <InfoRow label="이메일" value={inq.email} />
                          <InfoRow label="사업자번호" value={inq.business_number} />
                        </div>
                        {inq.status === 'pending' && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <input type="date" value={selectedDates[inq.id] || ''} onChange={(e) => setSelectedDates({ ...selectedDates, [inq.id]: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button onClick={() => handleApprove(inq)} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm">✓ 날짜 선택 후 승인</button>
                            <button onClick={() => handleReject(inq.id)} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">✕ 거절</button>
                          </div>
                        )}
                        {inq.status === 'approved' && (
                          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs font-semibold text-green-700 mb-2">▶ 유튜브 링크 등록 (컨펌 완료 후)</p>
                            {inq.youtube_url && (
                              <div className="mb-2"><a href={inq.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-sm underline">{inq.youtube_url}</a></div>
                            )}
                            <div className="flex gap-2">
                              <input type="url" placeholder="https://youtube.com/watch?v=..." value={ytInputs[inq.id] ?? (inq.youtube_url || '')} onChange={(e) => setYtInputs({ ...ytInputs, [inq.id]: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                              <button onClick={() => handleSaveYoutube(inq.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">저장</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {activeMenu === 'table' && (
          <div className="flex gap-6 h-full">
            <div className={`${selectedDetail ? 'w-3/5' : 'w-full'} transition-all`}>
              <div className="mb-6 flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800 mb-1">표 보기</h1><p className="text-slate-500 text-sm">행을 클릭하면 우측에 상세 내용이 표시됩니다.</p></div>
                <button onClick={fetchInquiries} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">번호</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">브랜드</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">채널</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">담당자</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">업로드일</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">상태</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">유튜브</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedInquiries.map((inq, idx) => (
                      <tr key={inq.id} onClick={() => setSelectedDetail(inq)} className={`border-b border-slate-50 cursor-pointer transition-all ${selectedDetail?.id === inq.id ? 'bg-blue-50' : inq.youtube_url ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-slate-50'}`}>
                        <td className="px-3 py-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{inq.brand || '-'}</td>
                        <td className="px-3 py-3 text-slate-600 text-xs">{inq.channels || '-'}</td>
                        <td className="px-3 py-3 text-slate-600 text-xs">{inq.name || '-'}</td>
                        <td className="px-3 py-3 text-slate-600 text-xs whitespace-nowrap">{inq.upload_date || '-'}</td>
                        <td className="px-3 py-3">{statusBadge(inq.status)}</td>
                        <td className="px-3 py-3">
                          {inq.youtube_url
                            ? <a href={inq.youtube_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-red-500 text-xs font-semibold hover:underline">▶ YT</a>
                            : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                      </tr>
                    ))}
                    {approvedInquiries.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">승인된 문의가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedDetail && (
              <div className="w-2/5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-y-auto sticky top-4" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{selectedDetail.brand} / {selectedDetail.channels || '-'}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedDetail.upload_date}</p>
                  </div>
                  <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-slate-600 text-xl ml-2">×</button>
                </div>

                <div className="p-5 space-y-2 border-b border-slate-100">
                  {[
                    ['브랜드', selectedDetail.brand],
                    ['채널', selectedDetail.channels],
                    ['업로드 일시', selectedDetail.upload_date],
                    ['담당자', selectedDetail.name],
                    ['이메일', selectedDetail.email],
                    ['연락처', selectedDetail.phone],
                    ['사업자번호', selectedDetail.business_number],
                    ['제품 링크', selectedDetail.product_link],
                    ['활용 소재', selectedDetail.material],
                    ['2차 활용', selectedDetail.secondary_use],
                    ['희망 컨셉', selectedDetail.video_concept],
                    ['기타 전달', selectedDetail.extra],
                  ].map(([label, value]) => value ? (
                    <div key={label} className="flex gap-3 text-sm">
                      <span className="text-slate-400 w-20 shrink-0 text-xs">{label}</span>
                      <span className="text-slate-700 text-xs whitespace-pre-wrap">{value}</span>
                    </div>
                  ) : null)}
                </div>

                {selectedDetail.status === 'approved' && (
                  <div className="p-5 border-b border-slate-100 bg-green-50">
                    <p className="text-xs font-semibold text-green-700 mb-2">▶ 유튜브 링크 등록</p>
                    {selectedDetail.youtube_url && (
                      <div className="mb-2"><a href={selectedDetail.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-xs underline break-all">{selectedDetail.youtube_url}</a></div>
                    )}
                    <div className="flex gap-2">
                      <input type="url" placeholder="https://youtube.com/..." value={ytInputs[selectedDetail.id] ?? (selectedDetail.youtube_url || '')} onChange={(e) => setYtInputs({ ...ytInputs, [selectedDetail.id]: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      <button onClick={() => handleSaveYoutube(selectedDetail.id)} className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600">저장</button>
                    </div>
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">💬 댓글</h3>
                  <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                    {comments.length === 0
                      ? <p className="text-xs text-slate-400">아직 댓글이 없습니다.</p>
                      : comments.map(c => (
                        <div key={c.id} className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-700">{c.author}</span>
                            <span className="text-xs text-slate-400">{new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))
                    }
                  </div>
                  <div className="space-y-2">
                    <input type="text" placeholder="작성자 이름" value={commentAuthor} onChange={(e) => setCommentAuthor(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    <textarea placeholder="댓글을 입력하세요..." value={newComment} onChange={(e) => setNewComment(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                    <button onClick={handleSubmitComment} disabled={submittingComment} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                      {submittingComment ? '저장 중...' : '댓글 등록'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMenu === 'calendar' && (
          <div>
            <div className="mb-8"><h1 className="text-2xl font-bold text-slate-800 mb-1">캘린더</h1><p className="text-slate-500 text-sm">승인된 광고 일정을 확인합니다.</p></div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 text-lg">←</button>
                <h2 className="text-lg font-bold text-slate-800">{currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
                <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 text-lg">→</button>
              </div>
              <div className="grid grid-cols-7 border-b border-slate-100">
                {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                  <div key={d} className={`text-center py-3 text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-500'}`}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} className="border-r border-b border-slate-50 min-h-24 p-2" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const events = getApprovedForDate(dateStr);
                  const isToday = new Date().toISOString().slice(0, 10) === dateStr;
                  const dow = (firstDay + i) % 7;
                  return (
                    <div key={day} className="border-r border-b border-slate-50 min-h-24 p-2">
                      <div className={`text-sm font-semibold mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-slate-700'}`}>{day}</div>
                      {events.map(ev => (
                        <div key={ev.id} className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mb-1 truncate">📢 {ev.brand || ev.name}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
            {approvedInquiries.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-slate-700 mb-3">승인된 광고 일정</h3>
                <div className="space-y-3">
                  {approvedInquiries.sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || '')).map(i => (
                    <div key={i.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">📢</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{i.brand}</div>
                        <div className="text-sm text-slate-500">{i.name} · {i.channels}</div>
                        {i.youtube_url && <a href={i.youtube_url} target="_blank" rel="noreferrer" className="text-xs text-red-500 underline">▶ 유튜브 보기</a>}
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