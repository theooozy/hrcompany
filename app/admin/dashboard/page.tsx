'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ASSIGNEE_OPTIONS = ['임상이', '이보배'];

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
  ad_review_status?: string;
  number?: number;
  memo?: string;
  work_status?: string;
  work_type?: string;
  storyboard_assignees?: Record<string, string> | null;
  video_assignees?: Record<string, string> | null;
  work_types?: Record<string, string> | null;
  work_statuses?: Record<string, string> | null;
  deleted?: boolean;
  deleted_from?: string;
  deleted_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<'inquiries' | 'approval' | 'table' | 'calendar' | 'trash' | 'staff' | 'channels'>('inquiries');
  const [currentEmail, setCurrentEmail] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<string>('worker');
  const [staffList, setStaffList] = useState<Array<{ user_email: string; role: string }>>([]);
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');
  const [channelSettings, setChannelSettings] = useState<Record<string, { person_name: string; tts_info: string }>>({});
  const [newChannelName, setNewChannelName] = useState('');
  const [approvalTab, setApprovalTab] = useState<'all' | 'approved' | 'rejected'>('all');
  const [inquiryTab, setInquiryTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [calendarView, setCalendarView] = useState<'week' | 'month'>('week');
  const [openWorkStatusFor, setOpenWorkStatusFor] = useState<string | null>(null);
  const [openWorkTypeFor, setOpenWorkTypeFor] = useState<string | null>(null);
  const [selectedRowMeta, setSelectedRowMeta] = useState<{ channel: string; conceptName: string } | null>(null);
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
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [addPanelLoading, setAddPanelLoading] = useState(false)
  const [addPanelError, setAddPanelError] = useState('')
  const [manualSchedules, setManualSchedules] = useState<any[]>([])
  const [addPanelForm, setAddPanelForm] = useState({
    product_name: '', brand_name: '', channel: '', manager_name: '',
    deadline: '', status: '진행중', youtube_url: '',
    email: '', phone: '', business_number: '', product_link: '',
    material: '', secondary_use: '', work_type: '콘티', work_status: ''
  })

  useEffect(() => { checkAuth(); fetchInquiries(); }, []);
  useEffect(() => {
    const ch = supabase
      .channel('inquiries-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inquiries' }, () => {
        fetchInquiries();
        fetchManualSchedules();
        if (activeMenu === 'trash') fetchTrash();
      })
      .subscribe();
    fetchInquiries();
    fetchManualSchedules();
    return () => { supabase.removeChannel(ch); };
  }, [activeMenu]);
  useEffect(() => { if (activeMenu === 'trash') fetchTrash(); if (activeMenu === 'staff') fetchStaff(); if (activeMenu === 'channels') fetchChannelSettings(); }, [activeMenu]);
  useEffect(() => {
    const onClick = () => { setOpenWorkStatusFor(null); setOpenWorkTypeFor(null); };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/admin/login'); return; }
    const email = session.user?.email || '';
    setCurrentEmail(email);
    if (email === 'tkddl@whrcompany.com') {
      setCurrentRole('master');
    } else {
      const { data: roleRow } = await supabase.from('user_roles').select('role, status').eq('user_email', email).maybeSingle();
      if (!roleRow) {
        await supabase.from('user_roles').insert({ user_email: email, role: 'worker', status: 'pending' });
        alert('관리자 승인이 필요합니다. 승인이 완료될 때까지 기다려주세요.');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }
      if (roleRow.status === 'pending') {
        alert('관리자 승인 대기 중입니다.');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }
      if (roleRow.status === 'rejected') {
        alert('접근이 거부되었습니다.');
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }
      setCurrentRole(roleRow.role || 'worker');
    }
  };

  const handleAdReview = async (id: string, status: 'approved' | 'rejected' | 'pending', scheduledDate?: string) => {
    const updates: { ad_review_status: string; scheduled_date?: string; work_type?: string; status?: string } = { ad_review_status: status };
    if (status === 'approved' && scheduledDate) {
      updates.scheduled_date = scheduledDate;
      updates.status = 'approved';
      updates.work_type = '광고';
    }
    const { error } = await supabase.from('inquiries').update(updates).eq('id', id);
    if (error) { alert('오류: ' + error.message); return; }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };;
  const fetchInquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inquiries').select('*').or('deleted.is.null,deleted.eq.false').order('created_at', { ascending: false });
    if (!error && data) setInquiries(data);
    setLoading(false);
  };

   const fetchManualSchedules = async () => {
    const { data, error } = await supabase.from('schedules').select('*').order('created_at', { ascending: false });
    if (!error && data) setManualSchedules(data);
  };

 const handleApprove = async (inquiry: Inquiry) => {
    const date = selectedDates[inquiry.id] || inquiry.scheduled_date;
    if (!date) { alert('날짜를 먼저 선택해주세요.'); return; }
    const { error } = await supabase.from('inquiries').update({ status: 'approved', scheduled_date: date }).eq('id', inquiry.id);
    if (!error) { alert('승인 완료!'); fetchInquiries(); }
    else alert('오류: ' + error.message);
  };

  const handleApproveSimple = async (id: string) => {
    const { error } = await supabase.from('inquiries').update({ status: 'approved' }).eq('id', id);
    if (!error) fetchInquiries();
    else alert('오류: ' + error.message);
  };

  const handleAssign = async (id: string, channel: string, kind: 'storyboard' | 'video', value: string) => {
    const fieldName = kind === 'storyboard' ? 'storyboard_assignees' : 'video_assignees';
    const target = inquiries.find(i => i.id === id) as (Inquiry & Record<string, unknown>) | undefined;
    const current = (target && (target[fieldName] as Record<string, string> | null | undefined)) || {};
    const next = { ...current, [channel]: value };
    const { error } = await supabase.from('inquiries').update({ [fieldName]: next }).eq('id', id);
    if (error) { alert('오류: ' + error.message); return; }
    setInquiries(prev => prev.map(i => i.id === id ? ({ ...i, [fieldName]: next } as Inquiry) : i));
    if (selectedDetail?.id === id) setSelectedDetail((prev) => prev ? ({ ...prev, [fieldName]: next } as Inquiry) : null);
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

  const handleDelete = async (id: string, source: string = '광고 문의') => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    let { error, data } = await supabase.from('inquiries').update({ deleted: true, deleted_at: new Date().toISOString(), deleted_from: source }).eq('id', id).select();
    if (error && /deleted_from/i.test(error.message)) {
      const retry = await supabase.from('inquiries').update({ deleted: true, deleted_at: new Date().toISOString() }).eq('id', id).select();
      error = retry.error;
      data = retry.data;
    }
    if (error) {
      alert('삭제 실패: ' + error.message + '\n\nSupabase RLS UPDATE 정책을 확인해주세요.');
      return;
    }
    if (!data || data.length === 0) {
      alert('삭제할 항목을 찾지 못했습니다. RLS 정책 또는 권한을 확인해주세요.');
      return;
    }
    fetchInquiries();
    fetchTrash();
  };

  const handleRestore = async (id: string) => {
    const { error } = await supabase.from('inquiries').update({ deleted: false, deleted_at: null }).eq('id', id);
    if (!error) { fetchTrash(); fetchInquiries(); }
    else alert('오류: ' + error.message);
  };

  const fetchStaff = async () => {
    const { data } = await supabase.from('user_roles').select('user_email, name, role, status').order('user_email');
    setStaffList(data || []);
  };
  const handleApproveStaff = async (email: string, role: string) => {
    const { error } = await supabase.from('user_roles').update({ status: 'approved', role }).eq('user_email', email);
    if (error) { alert('오류: ' + error.message); return; }
    fetchStaff();
  };
  const handleRejectStaff = async (email: string) => {
    if (!confirm(email + ' 가입을 거부하시겠습니까?')) return;
    const { error } = await supabase.from('user_roles').update({ status: 'rejected' }).eq('user_email', email);
    if (error) { alert('오류: ' + error.message); return; }
    fetchStaff();
  };
  const handleAddStaff = async (email: string, role: string) => {
    if (!email) return;
    const { error } = await supabase.from('user_roles').upsert({ user_email: email, role, status: 'approved' }, { onConflict: 'user_email' });
    if (error) { alert('오류: ' + error.message); return; }
    setNewStaffEmail('');
    fetchStaff();
  };
  const handleRemoveStaff = async (email: string) => {
    if (!confirm(email + ' 권한을 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('user_roles').delete().eq('user_email', email);
    if (error) { alert('오류: ' + error.message); return; }
    fetchStaff();
  };
  const fetchChannelSettings = async () => {
    const { data } = await supabase.from('channel_settings').select('channel, person_name, tts_info');
    const map: Record<string, { person_name: string; tts_info: string }> = {};
    (data || []).forEach((r: { channel: string; person_name: string; tts_info: string }) => { map[r.channel] = { person_name: r.person_name || '', tts_info: r.tts_info || '' }; });
    setChannelSettings(map);
  };
  const handleAddChannel = async () => {
    const name = newChannelName.trim();
    if (!name) return;
    if (channelSettings[name]) { alert('이미 있는 채널입니다.'); return; }
    const { error } = await supabase.from('channel_settings').insert({ channel: name, person_name: '', tts_info: '' });
    if (error) { alert('오류: ' + error.message); return; }
    setChannelSettings(prev => ({ ...prev, [name]: { person_name: '', tts_info: '' } }));
    setNewChannelName('');
  };
  const handleDeleteChannel = async (channel: string) => {
    if (!canDeletePermanent()) { alert('관리자만 채널을 삭제할 수 있습니다.'); return; }
    if (!confirm(`'${channel}' 채널을 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('channel_settings').delete().eq('channel', channel);
    if (error) { alert('오류: ' + error.message); return; }
    setChannelSettings(prev => { const next = { ...prev }; delete next[channel]; return next; });
  };
  const handleSaveChannelSetting = async (channel: string, person_name: string, tts_info: string) => {
    const { error } = await supabase.from('channel_settings').upsert({ channel, person_name, tts_info }, { onConflict: 'channel' });
    if (error) { alert('오류: ' + error.message); return; }
    setChannelSettings(prev => ({ ...prev, [channel]: { person_name, tts_info } }));
  };
  const canDeletePermanent = () => currentRole === 'master' || currentRole === 'admin';
  const handleEmptyTrash = async () => {
    if (!canDeletePermanent()) { alert('영구 삭제 권한이 없습니다. 관리자에게 문의하세요.'); return; }
    if (trashList.length === 0) { alert('휴지통이 비어있습니다.'); return; }
    if (!confirm('휴지통을 비우시겠습니까? 모든 항목이 영구 삭제되며 복구할 수 없습니다.')) return;
    const ids = trashList.map(t => t.id);
    let okCount = 0;
    let failMsg = '';
    for (const id of ids) {
      const { error } = await supabase.from('inquiries').delete().eq('id', id);
      if (error) { failMsg = error.message; }
      else okCount++;
    }
    await fetchTrash();
    await fetchInquiries();
    if (okCount === ids.length) {
      // 조용히 완료 - 알림 없이 사라짐
      return;
    } else if (okCount > 0) {
      alert(`${okCount}/${ids.length}개만 삭제됨. 일부 실패: ${failMsg}`);
    } else {
      alert('삭제에 실패했습니다. Supabase RLS 정책(delete)을 확인해주세요.\n오류: ' + failMsg);
    }
  };

  const handleRowWorkType = async (id: string, channel: string, wtype: string) => {
    const target = inquiries.find(i => i.id === id) as (Inquiry & Record<string, unknown>) | undefined;
    const current = (target && (target['work_types'] as Record<string, string> | null | undefined)) || {};
    const next = { ...current, [channel]: wtype };
    const { error } = await supabase.from('inquiries').update({ work_types: next }).eq('id', id);
    if (error) { alert('오류: ' + error.message + '\n\nSupabase에 work_types 컬럼이 없습니다. 안내된 SQL을 실행해주세요.'); return; }
    setInquiries(prev => prev.map(i => i.id === id ? ({ ...i, work_types: next } as Inquiry) : i));
    if (selectedDetail?.id === id) setSelectedDetail((prev) => prev ? ({ ...prev, work_types: next } as Inquiry) : null);
  };

  const handleRowWorkStatus = async (id: string, channel: string, status: string) => {
    const target = inquiries.find(i => i.id === id) as (Inquiry & Record<string, unknown>) | undefined;
    const current = (target && (target['work_statuses'] as Record<string, string> | null | undefined)) || {};
    const next = { ...current, [channel]: status };
    const { error } = await supabase.from('inquiries').update({ work_statuses: next }).eq('id', id);
    if (error) { alert('오류: ' + error.message + '\n\nSupabase에 work_statuses 컬럼이 없습니다. 안내된 SQL을 실행해주세요.'); return; }
    setInquiries(prev => prev.map(i => i.id === id ? ({ ...i, work_statuses: next } as Inquiry) : i));
    if (selectedDetail?.id === id) setSelectedDetail((prev) => prev ? ({ ...prev, work_statuses: next } as Inquiry) : null);
    setOpenWorkStatusFor(null);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!canDeletePermanent()) { alert('영구 삭제 권한이 없습니다. 관리자에게 문의하세요.'); return; }
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

  const getApprovedForDate = (dateStr: string) => [
    ...inquiries.filter(i => i.status === 'approved' && i.scheduled_date === dateStr).map(i => ({ ...i, _source: 'inquiry' })),
    ...manualSchedules.filter(s => s.deadline && s.deadline.startsWith(dateStr)).map(s => ({ ...s, brand_name: s.brand_name, _source: 'schedule' }))
  ];
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

  const RowWorkType = ({ inq, channel }: { inq: Inquiry; channel: string }) => {
    const wt = (inq.work_types && inq.work_types[channel]) || inq.work_type || '콘티';
    return (
      <div className="flex gap-1">
        {WORK_TYPES.map(t => (
          <button key={t} onClick={(e) => { e.stopPropagation(); handleRowWorkType(inq.id, channel, t); }} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${wt === t ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {t}
          </button>
        ))}
      </div>
    );
  };

  const RowWorkStatus = ({ inq, channel, rowKey }: { inq: Inquiry; channel: string; rowKey: string }) => {
    const ws = (inq.work_statuses && inq.work_statuses[channel]) || inq.work_status || '시작 전';
    const st = getWorkStatusStyle(ws);
    const open = openWorkStatusFor === rowKey;
    return (
      <div className="relative inline-block">
        <button
          onClick={(e) => { e.stopPropagation(); setOpenWorkStatusFor(open ? null : rowKey); }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.color} hover:opacity-80 transition-all`}
        >
          <span className={`w-2 h-2 rounded-full ${st.dot}`}></span>
          {ws}
          <span className="text-[10px]">▾</span>
        </button>
        {open && (
          <div className="fixed z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden" style={{ minWidth: 140 }} ref={(el) => {
            if (!el) return;
            const parent = el.previousSibling as HTMLElement | null;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            el.style.top = (rect.bottom + 4) + 'px';
            el.style.left = rect.left + 'px';
          }}>
            {WORK_STATUSES.map(s => (
              <button key={s.label} onClick={(e) => { e.stopPropagation(); handleRowWorkStatus(inq.id, channel, s.label); }} className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-all ${ws === s.label ? s.color : 'text-slate-600'}`}>
                <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                {s.label}
              </button>
            ))}
          </div>
        )}
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
          onInput={(e) => {
            const ta = e.currentTarget;
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
          }}
          ref={(el) => {
            if (el && !el.dataset.sized) {
              el.dataset.sized = '1';
              el.style.height = 'auto';
              el.style.height = el.scrollHeight + 'px';
            }
          }}
          rows={3}
          placeholder="메모를 입력하세요..."
          className="w-full px-3 py-2 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none bg-white overflow-hidden min-h-[80px]"
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
  const pendingCount = inquiries.filter(i => i.type === 'ad' && (!i.ad_review_status || i.ad_review_status === 'pending')).length;
  const approvedInquiries = inquiries.filter(i => i.status === 'approved' && i.scheduled_date);
  const tableRows = (() => {
    const rows: { inq: Inquiry; channel: string; conceptName: string; rowKey: string }[] = [];
    const brandCounter: Record<string, number> = {};
    [...approvedInquiries].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).forEach(inq => {
      const chans = (inq.channels || '').split(',').map(c => c.trim()).filter(Boolean);
      const list = chans.length ? chans : ['-'];
      list.forEach(ch => {
        const brandKey = inq.brand || '-';
        brandCounter[brandKey] = (brandCounter[brandKey] || 0) + 1;
        rows.push({ inq, channel: ch, conceptName: '컨셉' + brandCounter[brandKey], rowKey: inq.id + '__' + ch });
      });
    });
    return rows;
  })();

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
        <nav className="flex-1 p-3 space-y-1 flex flex-col">
          <button onClick={() => setActiveMenu('inquiries')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'inquiries' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📋</span><span>광고 문의</span>
            {pendingCount > 0 && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${activeMenu === 'inquiries' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveMenu('approval')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'approval' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>✅</span><span>승인 목록</span>{(() => { const n = inquiries.filter(i => i.type === 'signup' && (!i.status || i.status === 'pending')).length; return n > 0 ? <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${activeMenu === 'approval' ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>{n}</span> : null; })()}
          </button>
          <button onClick={() => setActiveMenu('table')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📊</span><span>표 보기</span>
          </button>
          <button onClick={() => setActiveMenu('calendar')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'calendar' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>📅</span><span>캘린더</span>
          </button>
          <button onClick={() => setActiveMenu('channels')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'channels' ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <span>🎤</span><span>채널 설정</span>
          </button>
          {currentEmail === 'tkddl@whrcompany.com' && (
            <button onClick={() => setActiveMenu('staff')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'staff' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span>👥</span><span>직원</span>
            </button>
          )}
          <button onClick={() => setActiveMenu('trash')} className={`w-full mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeMenu === 'trash' ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}>
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
            <div className="mb-6 flex items-center justify-between">
              <div><h1 className="text-2xl font-bold text-slate-800 mb-1">광고 문의</h1><p className="text-slate-500 text-sm">홈페이지에서 접수된 브랜드 광고 문의 목록입니다.</p></div>
              <button onClick={fetchInquiries} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
            </div>
            <div className="flex gap-2 border-b border-slate-200 mb-6">
              {([
                { key: 'all', label: '전체' },
                { key: 'pending', label: '대기중' },
                { key: 'approved', label: '승인' },
                { key: 'rejected', label: '거절' },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setInquiryTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${inquiryTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {tab.label}
                  <span className="ml-2 text-xs text-slate-400">
                    {tab.key === 'all'
                      ? inquiries.filter(i => i.type === 'ad').length
                      : tab.key === 'pending'
                      ? inquiries.filter(i => i.type === 'ad' && (!i.ad_review_status || i.ad_review_status === 'pending')).length
                      : inquiries.filter(i => i.type === 'ad' && i.ad_review_status === tab.key).length}
                  </span>
                </button>
              ))}
            </div>
            {loading ? <div className="flex items-center justify-center h-40 text-slate-400">불러오는 중...</div>
              : inquiries.filter(i => i.type === 'ad' && (inquiryTab === 'all' || (inquiryTab === 'pending' ? (!i.ad_review_status || i.ad_review_status === 'pending') : i.ad_review_status === inquiryTab))).length === 0 ? <div className="bg-white rounded-2xl p-12 text-center border border-slate-100"><div className="text-4xl mb-4">📭</div><p className="text-slate-500">아직 문의가 없습니다.</p></div>
              : <div className="space-y-4">
                {inquiries.filter(i => i.type === 'ad' && (inquiryTab === 'all' || (inquiryTab === 'pending' ? (!i.ad_review_status || i.ad_review_status === 'pending') : i.ad_review_status === inquiryTab))).map((inq) => (
                  <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50" onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg shrink-0">📢</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1"><span className="font-bold text-slate-800">{inq.brand || '브랜드 미입력'}</span></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {inq.status === 'approved' && inq.scheduled_date && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{formatDate(inq.scheduled_date)}</span>}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(inq.id, '광고 문의'); }}
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
                          {inq.bank_account_image && (
                            <div className="flex gap-2 md:col-span-2">
                              <span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">통장 사본</span>
                              <a href={inq.bank_account_image} target="_blank" rel="noreferrer" download className="text-xs text-blue-600 hover:underline">📎 이미지 다운로드 / 보기</a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 px-1 pt-2">
                          <span className="text-xs text-slate-500">광고 문의 검토:</span>
                          {(inq.ad_review_status === 'approved') && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-700">승인됨</span>}
                          {(inq.ad_review_status === 'rejected') && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-600">거절됨</span>}
                          {(!inq.ad_review_status || inq.ad_review_status === 'pending') && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-700">대기중</span>}
                          {(!inq.ad_review_status || inq.ad_review_status === 'pending') && (
                            <>
                              <button onClick={() => { const dt = prompt('시작 날짜을 입력하세요 (YYYY-MM-DD)', new Date().toISOString().slice(0,10)); if (dt) handleAdReview(inq.id, 'approved', dt); }} className="ml-auto px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold">승인</button>
                              <button onClick={() => handleAdReview(inq.id, 'rejected')} className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold">거절</button>
                            </>
                          )}
                          {(inq.ad_review_status === 'approved' || inq.ad_review_status === 'rejected') && (
                            <button onClick={() => handleAdReview(inq.id, 'pending')} className="ml-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold">되돌리기</button>
                          )}
                        </div>
                        {inq.status === 'pending' && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <input type="date" value={selectedDates[inq.id] || ''} onChange={(e) => setSelectedDates({ ...selectedDates, [inq.id]: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            <button onClick={() => handleApprove(inq)} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm">✓ 날짜 선택 후 승인</button>
                            <button onClick={() => { if (confirm('거절하시겠습니까?')) handleReject(inq.id); }} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold">✕ 거절</button>
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
                      {inquiries.filter(i => i.type === 'signup' && (t.key === 'all' ? (!i.status || i.status === 'pending') : i.status === t.key)).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {inquiries
                .filter(i => approvalTab === 'all' ? (!i.status || i.status === 'pending') : i.status === approvalTab)
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
                      {(!inq.status || inq.status === 'pending') && (
                        <>
                          <button
                            onClick={() => handleApproveSimple(inq.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                          >승인</button>
                          <button
                            onClick={() => { if (confirm('거절하시겠습니까?')) handleReject(inq.id); }}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all"
                          >거절</button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(inq.id, '승인 목록')}
                        className="px-3 py-2 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >삭제</button>
                    </div>
                  </div>
                ))
              }
              {inquiries.filter(i => i.type === 'signup').filter(i => approvalTab === 'all' ? (!i.status || i.status === 'pending') : i.status === approvalTab).length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <p className="text-slate-500">해당하는 문의가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

                {activeMenu === 'table' && (
          <div className="relative">
            <div className="w-full">
              <div className="mb-6 flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-800 mb-1">표 보기</h1><p className="text-slate-500 text-sm">행을 클릭하면 우측에 상세 내용이 표시됩니다.</p></div>
                <div className="flex gap-2">
                  <button onClick={fetchInquiries} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
                  <button onClick={() => setShowAddPanel(true)} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all"><span className="text-base leading-none">+</span> 일정 추가</button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['번호', '브랜드', '채널', '콘티', '영상', '작업타입', '작업', '담당자', '유튜브'].map(h => (
                        <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row, idx) => {
                      const inq = row.inq;
                      const ch = row.channel;
                      const sa = (inq.storyboard_assignees as Record<string, string> | null | undefined) || {};
                      const va = (inq.video_assignees as Record<string, string> | null | undefined) || {};
                      return (
                      <tr key={row.rowKey} onClick={() => { setSelectedDetail(inq); setSelectedRowMeta({ channel: row.channel, conceptName: row.conceptName }); }} className={`border-b border-slate-50 cursor-pointer transition-all ${(selectedDetail?.id === inq.id && selectedRowMeta?.channel === row.channel) ? 'bg-blue-100' : inq.youtube_url ? 'bg-pink-50 hover:bg-pink-100' : 'hover:bg-slate-50'}`}>
                        <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-slate-800 whitespace-nowrap max-w-[140px] truncate">{inq.brand || '-'}</td>
                        <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">
                          <div className="font-medium text-slate-700">{ch}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{row.conceptName}</div>
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <select value={sa[ch] || ''} onChange={(e) => handleAssign(inq.id, ch, 'storyboard', e.target.value)} className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                            <option value="">선택</option>
                            {ASSIGNEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <select value={va[ch] || ''} onChange={(e) => handleAssign(inq.id, ch, 'video', e.target.value)} className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400">
                            <option value="">선택</option>
                            {ASSIGNEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <RowWorkType inq={inq} channel={ch} />
                        </td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <RowWorkStatus inq={inq} channel={ch} rowKey={row.rowKey} />
                        </td>
                        <td className="px-3 py-2 text-slate-600 text-xs whitespace-nowrap">{inq.name || '-'}</td>
                        <td className="px-3 py-2">
                          {inq.youtube_url
                            ? <a href={inq.youtube_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-red-500 text-xs font-semibold hover:underline">▶ YT</a>
                            : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                      </tr>
                      );
                    })}
                    </tbody>
                </table>
              </div>
            </div>

            {selectedDetail && (
              <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto z-30" style={{ minHeight: '600px' }}>
                <div className="p-5 border-b border-slate-100 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{selectedDetail.brand} {selectedRowMeta ? `/ ${selectedRowMeta.channel} · ${selectedRowMeta.conceptName}` : (selectedDetail.channels ? '/ ' + selectedDetail.channels : '')}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">승인일: {selectedDetail.scheduled_date || '-'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {selectedRowMeta
                        ? <RowWorkStatus inq={selectedDetail} channel={selectedRowMeta.channel} rowKey={'detail__' + selectedDetail.id + '__' + selectedRowMeta.channel} />
                        : <WorkStatusBadge inq={selectedDetail} />}
                      {selectedRowMeta
                        ? <RowWorkType inq={selectedDetail} channel={selectedRowMeta.channel} />
                        : <WorkTypeBadge inq={selectedDetail} />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                <button onClick={() => { if (selectedDetail) { handleDelete(selectedDetail.id, '표 보기'); setSelectedDetail(null); setSelectedRowMeta(null); } }} className="px-3 py-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 rounded-lg">삭제</button>
                <button onClick={() => { setSelectedDetail(null); setSelectedRowMeta(null); }} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
              </div>
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
                <div className="p-4 border-b border-slate-100">
                  <MemoSection inq={selectedDetail} />
                </div>
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
              <div className="flex gap-2">
              <button onClick={fetchTrash} className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">새로고침</button>
              <button onClick={handleEmptyTrash} className="px-4 py-2 text-sm text-white bg-red-500 rounded-xl hover:bg-red-600 font-semibold">🗑️ 전체 삭제</button>
            </div>
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
                          {inq.deleted_from && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">출처: {inq.deleted_from}</span>}
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
        {activeMenu === 'staff' && currentEmail === 'tkddl@whrcompany.com' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 mb-1">👥 직원 관리</h1>
              <p className="text-slate-500 text-sm">직원에게 권한을 부여하세요. (관리자만 영구 삭제 가능)</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">새 직원 추가</h2>
              <div className="flex gap-2">
                <input type="email" placeholder="이메일 (예: hong@whrcompany.com)" value={newStaffEmail} onChange={(e) => setNewStaffEmail(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                <select id="newStaffRole" defaultValue="worker" className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white">
                  <option value="admin">관리자</option>
                  <option value="mid">중간 관리자</option>
                  <option value="worker">작업자</option>
                </select>
                <button onClick={() => { const sel = document.getElementById('newStaffRole') as HTMLSelectElement; handleAddStaff(newStaffEmail.trim(), sel.value); }} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600">추가</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-800">직원 목록</h2>
                <span className="text-xs text-slate-400">{staffList.length}명</span>
              </div>
              {staffList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">등록된 직원이 없습니다.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {staffList.map((s) => (
                    <div key={s.user_email} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
                          {s.name ? <span>{s.name}</span> : null}
                          <span className="text-slate-500 text-xs font-normal">{s.user_email}</span>
                          {s.status === 'pending' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">대기중</span>}
                          {s.status === 'rejected' && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">거부됨</span>}
                          {(!s.status || s.status === 'approved') && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">승인됨</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.role === 'admin' ? '관리자' : s.role === 'mid' ? '중간 관리자' : '작업자'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.status === 'pending' && (
                          <>
                            <select defaultValue="worker" onChange={(e) => (s as { pendingRole?: string }).pendingRole = e.target.value} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
                              <option value="admin">관리자</option>
                              <option value="mid">중간 관리자</option>
                              <option value="worker">작업자</option>
                            </select>
                            <button onClick={() => handleApproveStaff(s.user_email, (s as { pendingRole?: string }).pendingRole || 'worker')} className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-semibold">승인</button>
                            <button onClick={() => handleRejectStaff(s.user_email)} className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold">거부</button>
                          </>
                        )}
                        {s.status !== 'pending' && (<select value={s.role} onChange={(e) => handleAddStaff(s.user_email, e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white">
                          <option value="admin">관리자</option>
                          <option value="mid">중간 관리자</option>
                          <option value="worker">작업자</option>
                        </select>)}
                        <button onClick={() => handleRemoveStaff(s.user_email)} className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100">삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeMenu === 'channels' && (
          <div>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">🎤 채널 설정</h1>
                <p className="text-slate-500 text-sm">채널별 담당자와 TTS 설정을 관리하세요.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleAddChannel(); } }}
                  placeholder="새 채널 이름"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button onClick={handleAddChannel} className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-sm transition-all">+ 추가</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                <div className="col-span-3">채널</div>
                <div className="col-span-4">담당자 이름</div>
                <div className="col-span-4">TTS</div>
                <div className="col-span-1 text-right">삭제</div>
              </div>
              {Object.keys(channelSettings).sort((a, b) => a.localeCompare(b, 'ko')).map((ch) => {
                const cur = channelSettings[ch] || { person_name: '', tts_info: '' };
                return (
                  <div key={ch} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-50 items-center hover:bg-slate-50/40">
                    <div className="col-span-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>{ch}
                    </div>
                    <div className="col-span-4">
                      <input type="text" defaultValue={cur.person_name} onBlur={(e) => handleSaveChannelSetting(ch, e.target.value, cur.tts_info)} placeholder="예: 임상이" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="col-span-4">
                      <input type="text" defaultValue={cur.tts_info} onBlur={(e) => handleSaveChannelSetting(ch, cur.person_name, e.target.value)} placeholder="예: 민지 1.3배" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>
                    <div className="col-span-1 text-right">
                      {canDeletePermanent() && (<button onClick={() => handleDeleteChannel(ch)} className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50">삭제</button>)}
                    </div>
                  </div>
                );
              })}
              {Object.keys(channelSettings).length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400">채널이 없습니다. 위에서 추가하세요.</div>
              )}
              <p className="px-4 py-3 text-[11px] text-slate-400">입력 후 다른 곳을 클릭하면 자동 저장됩니다.</p>
            </div>
          </div>
        )}

        {activeMenu === 'calendar' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div><h1 className="text-2xl font-bold text-slate-800 mb-1">캘린더</h1><p className="text-slate-500 text-sm">승인된 광고 일정을 확인합니다.</p></div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all"
                >오늘</button>
                <button
                  onClick={() => setShowAddPanel(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 shadow-sm transition-all"
                >
                  <span className="text-base leading-none">+</span> 일정 추가
                </button>
              <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setCalendarView('week')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${calendarView === 'week' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>주간</button>
                <button onClick={() => setCalendarView('month')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${calendarView === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>월간</button>
              </div>
              </div>
            </div>
            {calendarView === 'month' ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">‹</button>
                  <h2 className="text-lg font-bold text-slate-800">{year}년 {month + 1}월</h2>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">›</button>
                </div>
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {['일','월','화','수','목','금','토'].map((d, i) => (
                    <div key={d} className={`text-center py-2 text-xs font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={'p' + i} className="border-r border-b border-slate-50 min-h-24 bg-slate-50/50" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const events = getApprovedForDate(dateStr);
                    const _t = new Date(); const _tStr = `${_t.getFullYear()}-${String(_t.getMonth()+1).padStart(2,'0')}-${String(_t.getDate()).padStart(2,'0')}`; const isToday = _tStr === dateStr;
                    const dow = (firstDay + i) % 7;
                    return (
                      <div key={day} className="border-r border-b border-slate-50 min-h-24 p-2">
                        <div className={`text-xs font-semibold mb-1 ${isToday ? 'inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white' : dow === 0 ? 'text-red-500' : dow === 6 ? 'text-blue-500' : 'text-slate-600'}`}>{day}</div>
                        <div className="space-y-1">
                          {events.slice(0, 3).map(ev => (
                            <div key={ev.id} onClick={() => { setSelectedDetail(ev); setSelectedRowMeta(null); setActiveMenu('table'); }} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200" title={ev.brand}>{ev.brand}</div>
                          ))}
                          {events.length > 3 && <div className="text-[10px] text-slate-400">+{events.length - 3}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              (() => {
                const weekStart = new Date(currentMonth);
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                weekStart.setHours(0,0,0,0);
                const weekDays = Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
                });
                const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                      <button onClick={() => { const d = new Date(currentMonth); d.setDate(d.getDate() - 7); setCurrentMonth(d); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">‹</button>
                      <h2 className="text-lg font-bold text-slate-800">{weekDays[0].getMonth() + 1}월 {weekDays[0].getDate()}일 ~ {weekDays[6].getMonth() + 1}월 {weekDays[6].getDate()}일</h2>
                      <button onClick={() => { const d = new Date(currentMonth); d.setDate(d.getDate() + 7); setCurrentMonth(d); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">›</button>
                    </div>
                    <div className="grid grid-cols-7 border-b border-slate-100">
                      {['일','월','화','수','목','금','토'].map((d, i) => (
                        <div key={d} className={`text-center py-2 text-xs font-semibold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7">
                      {weekDays.map((d, i) => {
                        const dateStr = fmt(d);
                        const events = getApprovedForDate(dateStr);
                        const _t = new Date(); const _tStr = `${_t.getFullYear()}-${String(_t.getMonth()+1).padStart(2,'0')}-${String(_t.getDate()).padStart(2,'0')}`; const isToday = _tStr === dateStr;
                        return (
                          <div key={dateStr} className="border-r border-slate-50 min-h-48 p-3">
                            <div className={`text-sm font-bold mb-2 ${isToday ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white' : i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-700'}`}>{d.getDate()}</div>
                            <div className="space-y-1.5">
                              {events.map(ev => (
                                <div key={ev.id} onClick={() => { setSelectedDetail(ev); setSelectedRowMeta(null); setActiveMenu('table'); }} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-200" title={ev.brand}>
                                  <div className="font-semibold truncate">{ev.brand}</div>
                                  <div className="text-[10px] text-blue-500 truncate">{ev.channels || ''}</div>
                                </div>
                              ))}
                              {events.length === 0 && <div className="text-[10px] text-slate-300">일정 없음</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}
      </main>

        {showAddPanel && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => { setShowAddPanel(false); setAddPanelError(''); setAddPanelForm({ product_name: '', brand_name: '', channel: '', manager_name: '', deadline: '', status: '진행중', youtube_url: '', email: '', phone: '', business_number: '', product_link: '', material: '', secondary_use: '', work_type: '콘티', work_status: '' }) }} />
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-slate-800">새 일정 추가</h2>
                <button onClick={() => { setShowAddPanel(false); setAddPanelError(''); setAddPanelForm({ product_name: '', brand_name: '', channel: '', manager_name: '', deadline: '', status: '진행중', youtube_url: '', email: '', phone: '', business_number: '', product_link: '', material: '', secondary_use: '', work_type: '콘티', work_status: '' }) }} className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">제목 <span className="text-red-500">*</span></label>
                  <input value={addPanelForm.product_name} onChange={e => setAddPanelForm(f => ({ ...f, product_name: e.target.value }))} placeholder="제목을 입력하세요" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">브랜드명</label>
                  <input value={addPanelForm.brand_name} onChange={e => setAddPanelForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="브랜드명을 입력하세요" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">채널</label>
                  <select value={addPanelForm.channel} onChange={e => setAddPanelForm(f => ({ ...f, channel: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">채널 선택</option>
                    <option value="셀럽온">셀럽온</option>
                    <option value="찐예쁨">찐예쁨</option>
                    <option value="미모지상주의">미모지상주의</option>
                    <option value="쇼잉">쇼잉</option>
                    <option value="쇼숏">쇼숏</option>
                    <option value="숏됐다">숏됐다</option>
                    <option value="밈튜브">밈튜브</option>
                    <option value="숏스커버리">숏스커버리</option>
                    <option value="유니랜드">유니랜드</option>
                    <option value="신기+탬">신기+탬</option>
                    <option value="숏믈리에">숏믈리에</option>
                    <option value="디어랩">디어랩</option>
                    <option value="숏픽">숏픽</option>
                    <option value="두근두근">두근두근</option>
                    <option value="전국댓글자랑">전국댓글자랑</option>
                    <option value="숏플레시">숏플레시</option>
                    <option value="출석체크">출석체크</option>
                    <option value="ワクワク">ワクワク</option>
                    <option value="スポログ">スポログ</option>
                    <option value="笑慇の一秒">笑慇の一秒</option>
                    <option value="おもしろ塾">おもしろ塾</option>
                    <option value="一瞬劇場">一瞬劇場</option>
                    <option value="絆タイム">絆タイム</option>
                    <option value="チーズケーキ">チーズケーキ</option>
                    <option value="オイシイワールド">オイシイワールド</option>
                    <option value="モグモグ">モグモグ</option>
                    <option value="トレ韓">トレ韓</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">담당자</label>
                  <input value={addPanelForm.manager_name} onChange={e => setAddPanelForm(f => ({ ...f, manager_name: e.target.value }))} placeholder="담당자 이름" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">날짜/시간 <span className="text-red-500">*</span></label>
                  <input type="datetime-local" value={addPanelForm.deadline} onChange={e => setAddPanelForm(f => ({ ...f, deadline: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">상태</label>
                  <select value={addPanelForm.status} onChange={e => setAddPanelForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="진행중">진행중</option>
                    <option value="완료">완료</option>
                    <option value="대기">대기</option>
                    <option value="보류">보류</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">유튜브 URL</label>
                  <input value={addPanelForm.youtube_url} onChange={e => setAddPanelForm(f => ({ ...f, youtube_url: e.target.value }))} placeholder="https://youtube.com/..." className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">이메일</label>
                  <input value={addPanelForm.email} onChange={e => setAddPanelForm(f => ({ ...f, email: e.target.value }))} placeholder="이메일 주소" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">연락처</label>
                  <input value={addPanelForm.phone} onChange={e => setAddPanelForm(f => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">사업자번호</label>
                  <input value={addPanelForm.business_number} onChange={e => setAddPanelForm(f => ({ ...f, business_number: e.target.value }))} placeholder="000-00-00000" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">제품 링크</label>
                  <input value={addPanelForm.product_link} onChange={e => setAddPanelForm(f => ({ ...f, product_link: e.target.value }))} placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">활용 소재</label>
                  <input value={addPanelForm.material} onChange={e => setAddPanelForm(f => ({ ...f, material: e.target.value }))} placeholder="활용 소재 입력" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">2차 활용</label>
                  <select value={addPanelForm.secondary_use} onChange={e => setAddPanelForm(f => ({ ...f, secondary_use: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">선택</option>
                    <option value="동의">동의</option>
                    <option value="동의 안 받음">동의 안 받음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">작업 타입</label>
                  <select value={addPanelForm.work_type} onChange={e => setAddPanelForm(f => ({ ...f, work_type: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="콘티">콘티</option>
                    <option value="영상">영상</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">작업 상태</label>
                  <select value={addPanelForm.work_status} onChange={e => setAddPanelForm(f => ({ ...f, work_status: e.target.value }))} className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">선택</option>
                    <option value="시작 전">시작 전</option>
                    <option value="진행 중">진행 중</option>
                    <option value="완료">완료</option>
                  </select>
                </div>
                {addPanelError && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">{addPanelError}</div>}
              </div>
              <div className="px-6 py-4 border-t flex gap-3">
                <button onClick={() => { setShowAddPanel(false); setAddPanelError(''); setAddPanelForm({ product_name: '', brand_name: '', channel: '', manager_name: '', deadline: '', status: '진행중', youtube_url: '', email: '', phone: '', business_number: '', product_link: '', material: '', secondary_use: '', work_type: '콘티', work_status: '' }) }} className="flex-1 py-3 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">취소</button>
                <button disabled={addPanelLoading} onClick={async () => { if (!addPanelForm.product_name.trim()) { setAddPanelError('제목을 입력해주세요.'); return; } if (!addPanelForm.deadline) { setAddPanelError('날짜/시간을 입력해주세요.'); return; } setAddPanelLoading(true); setAddPanelError(''); const { error } = await supabase.from('schedules').insert([{ product_name: addPanelForm.product_name, brand_name: addPanelForm.brand_name || null, channel: addPanelForm.channel || null, manager_name: addPanelForm.manager_name || null, deadline: addPanelForm.deadline, status: addPanelForm.status, youtube_url: addPanelForm.youtube_url || null, email: addPanelForm.email || null, phone: addPanelForm.phone || null, business_number: addPanelForm.business_number || null, product_link: addPanelForm.product_link || null, material: addPanelForm.material || null, secondary_use: addPanelForm.secondary_use || null, work_type: addPanelForm.work_type || null, work_status: addPanelForm.work_status || null }]); setAddPanelLoading(false); if (error) { setAddPanelError('저장 실패: ' + error.message); } else { fetchManualSchedules(); setShowAddPanel(false); setAddPanelError(''); setAddPanelForm({ product_name: '', brand_name: '', channel: '', manager_name: '', deadline: '', status: '진행중', youtube_url: '', email: '', phone: '', business_number: '', product_link: '', material: '', secondary_use: '', work_type: '콘티', work_status: '' }); } }} className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50">{addPanelLoading ? '저장 중...' : '저장'}</button>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
