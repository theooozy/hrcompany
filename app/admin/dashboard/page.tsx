'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WORK_STATUSES = [
  { label: '시작 전', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  { label: '수정 필요', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  { label: '진행 중', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  { label: '콘티 컴펌 중', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  { label: '영상 컴펌 중', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' },
  { label: '컴펌 완료', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { label: '영상 완료', color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-400' },
  { label: '콘티 완료', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  { label: '보류', color: 'bg-red-100 text-red-500', dot: 'bg-red-400' },
  { label: '취소', color: 'bg-red-100 text-red-700', dot: 'bg-red-600' },
];

const WORK_TYPES = ['콘티', '영상'];

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
  memo?: string;
  work_status?: string;
  work_type?: string;
  deleted?: boolean;
  deleted_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'inquiries' | 'approval' | 'table' | 'calendar' | 'trash'>('inquiries');
  const [approvalTab, setApprovalTab] = useState<'all' | 'approved' | 'rejected'>('all');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDetail, setSelectedDetail] = useState<Inquiry | null>(null);
  const [ytInputs, setYtInputs] = useState<Record<string, string>>({});
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);
  const [memoValues, setMemoValues] = useState<Record<string, string>>({});
  const [savingMemo, setSavingMemo] = useState<string | null>(null);

  useEffect(() => { checkAuth(); fetchInquiries(); }, []);
  useEffect(() => { if (activeMenu === 'trash') fetchTrash(); }, [activeMenu]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) router.push('/admin/login');
  };

  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inquiries').select('*').or('deleted.is.null,deleted.eq.false').order('created_at', { ascending: false });
    if (!error && data) setInquiries(data);
    setLoading(false);
  };

  const handleApprove = async (inquiry: Inquiry) => {
    const date = selectedDates[inquiry.id] || inquiry.scheduled_date;
    if (!date) { alert('날짜를 먼저 선택해주세요.'); return; }
    const { error } = await supabase.from('inquiries').update({ status: 'approved', scheduled_date: date }).eq('id', inquiry.id);
    if (!error) { alert('승인 완료!'); fetchInquiries(); }
    else alert('오류: ' + error.message);
  };

  const handleApproveSimple = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('inquiries').update({ status: 'approved', scheduled_date: today }).eq('id', id);
    if (!error) fetchInquiries();
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

  const handleWorkStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('inquiries').update({ work_status: status }).eq('id', id);
    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, work_status: status } : i));
      if (selectedDetail?.id === id) setSelectedDetail(prev => prev ? { ...prev, work_status: status } : null);
    }
    setStatusDropdown(null);
  };

  const handleWorkType = async (id: string, wtype: string) => {
    const { error } = await supabase.from('inquiries').update({ work_type: wtype }).eq('id', id);
    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, work_type: wtype } : i));
      if (selectedDetail?.id === id) setSelectedDetail(prev => prev ? { ...prev, work_type: wtype } : null);
    }
  };

  const handleSaveMemo = async (id: string) => {
    setSavingMemo(id);
    const memo = memoValues[id] ?? '';
    const { error } = await supabase.from('inquiries').update({ memo }).eq('id', id);
    if (!error) {
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, memo } : i));
      if (selectedDetail?.id === id) setSelectedDetail(prev => prev ? { ...prev, memo } : null);
    }
    setSavingMemo(null);
  };

  const [trashList, setTrashList] = useState<Inquiry[]>([]);

  const fetchTrash = async () => {
    const { data } = await supabase.from('inquiries').select('*').eq('deleted', true).order('deleted_at', { ascending: false });
    if (data) setTrashList(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('inquiries').update({ deleted: true, deleted_at: new Date().toISOString() }).eq('id', id);
    if (!error) { fetchInquiries(); fetchTrash(); }
    else alert('오류: ' + error.message);
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from('inquiries').update({ deleted: false, deleted_at: null }).eq('id', id);
    if (!error) { fetchTrash(); fetchInquiries(); }
    else alert('오류: ' + error.message);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('영구 삭제하시겠습니까? 복구가 불가능합니다.')) return;
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (!error) fetchTrash();
    else alert('오류: ' + error.message);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/admin/login'); };

  const getDaysInMonth = (date: Date) => {
    const y = date.getFullYear(); const m = date.getMonth();
    return { firstDay: new Date(y, m, 1).getDay(), daysInMonth: new Date(y, m + 1, 0).getDate(), year: y, month: m };
  };

  const getApprovedForDate = (dateStr: string) => inquiries.filter(i => i.status === 'approved' && i.scheduled_date === dateStr);
  const formatDate = (dateStr: string) => { if (!dateStr) return ''; return new Date(dateStr + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }); };
  const formatDateTime = (dateStr: string) => { if (!dateStr) return ''; return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }); };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">승인됨</span>;
    if (status === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">거절됨</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">대기중</span>;
  };

  const getWorkStatusStyle = (ws: string) => WORK_STATUSES.find(s => s.label === ws) || WORK_STATUSES[0];

  const WorkStatusBadge = ({ inq }: { inq: Inquiry }) => {
    const ws = inq.work_status || '시작 전';
    const st = getWorkStatusStyle(ws);
    return (
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setStatusDropdown(statusDropdown === inq.id ? null : inq.id); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.color} hover:opacity-80 transition-all`}
        >
          <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
          {ws}
          <span className="text-xs opacity-60">▾</span>
        </button>
        {statusDropdown === inq.id && (
          <div className="absolute left-0 top-8 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 w-44 space-y-1" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs text-slate-400 font-semibold mb-2 px-1">상태 선택</p>
            {WORK_STATUSES.map(s => (
              <button key={s.label} onClick={() => handleWorkStatus(inq.id, s.label)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium hover:bg-slate-50 transition-all ${ws === s.label ? s.color : 'text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const WorkTypeBadge = ({ inq }: { inq: Inquiry }) => {
    const wt = inq.work_type || '콘티';
    return (
      <div className="flex gap-1">
        {WORK_TYPES.map(t => (
          <button key={t} onClick={(e) => { e.stopPropagation(); handleWorkType(inq.id, t); }} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${wt === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>
    );
  };

  const MemoSection = ({ inq }: { inq: Inquiry }) => {
    const currentMemo = memoValues[inq.id] !== undefined ? memoValues[inq.id] : (inq.memo || '');
    return (
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
        <p className="text-xs font-semibold text-amber-700 mb-2">📝 메모</p>
        <textarea
          value={currentMemo}
          onChange={(e) => setMemoValues(prev => ({ ...prev, [inq.id]: e.target.value }))}
          rows={3}
          placeholder="메모를 입력하세요..."
          className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none bg-white"
        />
        <button
          onClick={() => handleSaveMemo(inq.id)}
          disabled={savingMemo === inq.id}
          className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 disabled:opacity-60"
        >
          {savingMemo === inq.id ? '저장 중...' : '메모 저장'}
        </button>
      </div>
    );
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonth);
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const approvedInquiries = inquiries.filter(i => i.status === 'approved');

  const InfoRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return <div className="flex gap-2"><span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">{label}</span><span className="text-xs text-slate-700 whitespace-pre-wrap">{value}</span></div>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex" onClick={() => setStatusDropdown(null)}>
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center"><span className="text-white font-bold text-xs">HR</span></div>
            <span className="font-bold text-slate-800 text-sm">관리자 대시보드</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => setActiveMenu('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📋</span><span>광고 문의</span>
            {pendingCount > 0 && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeMenu === 'inquiries' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveMenu('approval')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'approval' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>✅</span><span>승인 목록</span>
          </button>
          <button onClick={() => setActiveMenu('table')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📊</span><span>표 보기</span>
          </button>
          <button onClick={() => setActiveMenu('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📅</span><span>캘린더</span>
          </button>
          <button onClick={() => setActiveMenu('trash')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'trash' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>
            <span>🗑️</span><span>휴지통</span>
            {trashList.length > 0 && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeMenu === 'trash' ? 'bg-white text-red-500' : 'bg-red-100 text-red-500'}`}>{trashList.length}</span>}
          </button>
        </nav>
        <div className="p-3 border-t border-slate-100 space-y-1">
          <a href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100"><span>🏠</span><span>홈으로</span></a>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100"><span>🚪</span><span>로그아웃</span></button>
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
                          <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-800">{inq.brand || '브랜드 미입력'}</span>{statusBadge(inq.status)}</div>
                          <div className="flex items-center gap-2">
                            <WorkStatusBadge inq={inq} />
                            <WorkTypeBadge inq={inq} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {inq.status === 'approved' && inq.scheduled_date && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{formatDate(inq.scheduled_date)}</span>}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(inq.id); }}
                          className="text-xs font-medium text-slate-400 hover:text-red-500 px-2 py-1 rounded-md hover:bg-red-50 transition-all"
                        >삭제</button>
                        <span className="text-slate-400 text-sm">{expanded === inq.id ? '▲' : '▼'}</span>
                      </div>
                    </div>
                    {expanded === inq.id && (
                      <div className="border-t border-slate-100 p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 bg-slate-50 rounded-xl p-4">
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
                        <MemoSection inq={inq} />
                        {inq.status === 'pending' && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <input type="date" value={selectedDates[inq.id] || ''} onChange={(e) => setSelectedDates({ ...selectedDates, [inq.id]: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button onClick={() => handleApprove(inq)} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm">✓ 날짜 선택 후 승인</button>
                            <button onClick={() => handleReject(inq.id)} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">✕ 거절</button>
                          </div>
                        )}
                        {(inq.work_status === '컴펌 완료') && (
                          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs font-semibold text-green-700 mb-2">▶ 유튜브 링크 등록</p>
                            {inq.youtube_url && <div className="mb-2"><a href={inq.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-sm underline">{inq.youtube_url}</a></div>}
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

        {activeMenu === 'approval' && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 mb-1">✅ 승인 목록</h1>
                  <p className="text-slate-500 text-sm">문의를 승인하거나 거절할 수 있습니다.</p>
                </div>
              </div>
              <div className="flex gap-2 border-b border-slate-200">
                {([
                  { key: 'all', label: '전체' },
                  { key: 'approved', label: '승인' },
                  { key: 'rejected', label: '거절' },
                ] as const).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setApprovalTab(t.key)}
                    className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${approvalTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                    {t.label}
                    <span className="ml-2 text-xs text-slate-400">
                      {t.key === 'all' ? inquiries.length : inquiries.filter(i => i.status === t.key).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {inquiries
                .filter(i => approvalTab === 'all' ? true : i.status === approvalTab)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(inq => (
                  <div key={inq.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 truncate">{inq.brand || '브랜드 미입력'}</span>
                        {inq.status === 'approved' && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">승인</span>}
                        {inq.status === 'rejected' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">거절</span>}
                        {(!inq.status || inq.status === 'pending') && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold">대기</span>}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {inq.name} · {inq.email} · {inq.channels}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        제출일: {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {inq.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveSimple(inq.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                        >승인</button>
                      )}
                      {inq.status !== 'rejected' && (
                        <button
                          onClick={() => handleReject(inq.id)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                        >거절</button>
                      )}
                    </div>
                  </div>
                ))
              }
              {inquiries.filter(i => approvalTab === 'all' ? true : i.status === approvalTab).length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <p className="text-slate-500">해당하는 문의가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

                {activeMenu === 'table' && (
          <div className="flex gap-6">
            <div className={selectedDetail ? 'w-3/5' : 'w-full'}>
              <div className="mb-6 flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800 mb-1">표 보기</h1><p className="text-slate-500 text-sm">행을 클릭하면 우측에 상세 내용이 표시됩니다.</p></div>
                <button onClick={fetchInquiries} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['번호', '브랜드', '채널', '담당자', '작업', '상태', '작업타입', '유튜브'].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {approvedInquiries.map((inq, idx) => (
                      <tr key={inq.id} onClick={() => setSelectedDetail(inq)} className={`border-b border-slate-50 cursor-pointer transition-all ${selectedDetail?.id === inq.id ? 'bg-blue-50' : inq.youtube_url ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-slate-50'}`}>
                        <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap max-w-[140px] truncate">{inq.brand || '-'}</td>
                        <td className="px-3 py-2 text-slate-600 text-xs max-w-[100px] truncate">{inq.channels || '-'}</td>
                        <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">{inq.name || '-'}</td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <WorkStatusBadge inq={inq} />
                        </td>
                        <td className="px-3 py-2">{statusBadge(inq.status)}</td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <WorkTypeBadge inq={inq} />
                        </td>
                        <td className="px-3 py-2">
                          {inq.youtube_url
                            ? <a href={inq.youtube_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-red-500 text-xs font-semibold hover:underline">▶ YT</a>
                            : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                      </tr>
                    ))}
                    {approvedInquiries.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">승인된 문의가 없습니다.</td></tr>}
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
                    <div className="flex items-center gap-2 mt-2">
                      <WorkStatusBadge inq={selectedDetail} />
                      <WorkTypeBadge inq={selectedDetail} />
                    </div>
                  </div>
                  <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-slate-600 text-xl ml-2 shrink-0">×</button>
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
                  ].filter(([, v]) => v).map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <span className="text-slate-400 w-20 shrink-0 text-xs pt-0.5">{label}</span>
                      <span className="text-slate-700 text-xs whitespace-pre-wrap">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-b border-slate-100">
                  <MemoSection inq={selectedDetail} />
                </div>
                {(selectedDetail.work_status === '컴펌 완료') && (
                  <div className="p-5 border-b border-slate-100 bg-green-50">
                    <p className="text-xs font-semibold text-green-700 mb-2">▶ 유튜브 링크 등록</p>
                    {selectedDetail.youtube_url && <div className="mb-2"><a href={selectedDetail.youtube_url} target="_blank" rel="noreferrer" className="text-red-500 text-xs underline break-all">{selectedDetail.youtube_url}</a></div>}
                    <div className="flex gap-2">
                      <input type="url" placeholder="https://youtube.com/..." value={ytInputs[selectedDetail.id] ?? (selectedDetail.youtube_url || '')} onChange={(e) => setYtInputs({ ...ytInputs, [selectedDetail.id]: e.target.value })} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
                      <button onClick={() => handleSaveYoutube(selectedDetail.id)} className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600">저장</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeMenu === 'trash' && (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">🗑️ 휴지통</h1>
                <p className="text-slate-500 text-sm">삭제된 문의 목록입니다. 복구하거나 영구 삭제할 수 있습니다.</p>
              </div>
              <button onClick={fetchTrash} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
            </div>
            {trashList.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
                <div className="text-4xl mb-4">🗑️</div>
                <p className="text-slate-500">휴지통이 비어있습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {trashList.map((inq) => (
                  <div key={inq.id} className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-lg shrink-0">🗑️</div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-700">{inq.brand || '브랜드 미입력'}</span>
                          {inq.channels && <span className="text-xs text-slate-400">{inq.channels}</span>}
                        </div>
                        <div className="text-xs text-slate-400">
                          {inq.name} · {inq.email}
                          {inq.deleted_at && <span className="ml-2">삭제: {new Date(inq.deleted_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(inq.id)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-all">↩ 복구</button>
                      <button onClick={() => handlePermanentDelete(inq.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all">완전 삭제</button>
                    </div>
                  </div>
                ))}
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
                      {events.map(ev => <div key={ev.id} className="text-xs bg-blue-100 text-blue-700 rounded-lg px-2 py-1 mb-1">
                        <div className="font-semibold truncate">📢 {ev.brand || ev.name}</div>
                        {ev.channels && <div className="text-xs opacity-75 truncate">📺 {ev.channels}</div>}
                        {ev.work_type && <div className="text-xs opacity-75">🎬 {ev.work_type}</div>}
                      </div>)}
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
