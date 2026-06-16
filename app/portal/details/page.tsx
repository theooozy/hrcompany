'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SECONDARY_USE_OPTIONS = ['브랜드/아티스트 관련 모두 활용 가능', '동의 안 받음', '기타'];

const DOMESTIC_CHANNELS = [
'셀럽온', '찐예쁨', '미모지상주의', '쇼잉', '쇼숏', '숏됐다',
'밈튜브', '숏스커버리', '유니랜드', '신기+템', '숏믈리에',
'디어랩', '숏픽', '두근두근', '전국댓글자랑', '숏플레시', '출석체크',
];

const JP_CHANNEL_KR: Record<string, string> = {
  'ワクワク': '와쿠와쿠',
  'スポログ': '스포로그',
  '笑撃の一秒': '웃음의 1초',
  'おもしろ塾': '재미학원',
  '一瞬劇場': '순간극장',
  '絆タイム': '인연의 시간',
  'チーズケーキ': '치즈케이크',
  'オイシイワールド': '맛있는 세계',
  'モグモグ': '모구모구',
  'トレ韓': '토레칸',
};
const getJpChLabel = (ch: string): string => JP_CHANNEL_KR[ch] ? ch + ' (' + JP_CHANNEL_KR[ch] + ')' : ch;

const JAPAN_CHANNELS = [
'ワクワク', 'スポログ', '笑撃の一秒', 'おもしろ塾', '一瞬劇場',
'絆タイム', 'チーズケーキ', 'オイシイワールド', 'モグモグ', 'トレ韓',
];

type Session = { id: string; name: string; email: string; brand?: string };

const formatBusinessNumber = (value: string): string => {
const digits = value.replace(/[^0-9]/g, '');
if (digits.length <= 3) return digits;
if (digits.length <= 5) return digits.substring(0, 3) + '-' + digits.substring(3);
return digits.substring(0, 3) + '-' + digits.substring(3, 5) + '-' + digits.substring(5, 10);
};

export default function PortalDetailsPage() {
const router = useRouter();
const [session, setSession] = useState<Session | null>(null);

const [loading, setLoading] = useState(false);
const [submitError, setSubmitError] = useState('');
const [form, setForm] = useState({
business_number: '',
upload_date: '',
material: '',
material_none: false,
secondary_use: '',
secondary_use_custom: '',
video_concept: '',
extra: '',
product_link: '',
product_link_none: false,
simple_upload: '',
});
const [preferredChannels, setPreferredChannels] = useState<string[]>([]);

useEffect(() => {
const raw = typeof window !== 'undefined' ? localStorage.getItem('portal_session') : null;
if (!raw) { router.replace('/portal/login'); return; }
try { setSession(JSON.parse(raw)); } catch { router.replace('/portal/login'); }
}, [router]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
const target = e.target as HTMLInputElement;
if (target.type === 'checkbox') {
setForm(prev => ({ ...prev, [target.name]: target.checked }));
} else {
setForm(prev => ({ ...prev, [target.name]: target.value }));
}
};

const handleBusinessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const formatted = formatBusinessNumber(e.target.value);
setForm(prev => ({ ...prev, business_number: formatted }));
};

const handleChannelToggle = (channel: string) => {
setPreferredChannels(prev =>
prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
);
};

const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
if (!session) {
setSubmitError('세션이 없습니다. 다시 로그인해주세요.');
return;
}
setLoading(true);
setSubmitError('');

  // Validation
  if (!form.upload_date) { setSubmitError('업로드 일시를 입력해주세요.'); setLoading(false); return; }
  if (!form.material_none && !form.material.trim()) { setSubmitError('소재 정보를 입력하거나 없음을 체크해주세요.'); setLoading(false); return; }
  if (!form.product_link_none && !form.product_link.trim()) { setSubmitError('제품 링크를 입력하거나 없음을 체크해주세요.'); setLoading(false); return; }
  if (!form.secondary_use) { setSubmitError('추가 정보 (2차 활용 여부)를 선택해주세요.'); setLoading(false); return; }
  if (preferredChannels.length === 0) { setSubmitError('선호하는 채널을 최소 1개 이상 선택해주세요.'); setLoading(false); return; }
  if (!form.video_concept.trim()) { setSubmitError('희망 영상 콘셉을 입력해주세요.'); setLoading(false); return; }

const secondaryUse = form.secondary_use === '기타'
? (form.secondary_use_custom || '기타')
: form.secondary_use;

const insertPayload: Record<string, unknown> = {
        name: session.name,
        email: session.email,
        type: 'ad',
        brand: session.brand || null,
        status: 'pending',
        business_number: form.business_number || null,
        upload_date: form.upload_date || null,
        material: form.material_none ? '없음' : (form.material || null),
        product_link: form.product_link_none ? '없음' : (form.product_link || null),
        secondary_use: secondaryUse || null,
        video_concept: form.video_concept || null,
        extra: form.extra || null,
        preferred_channels: preferredChannels.length > 0 ? preferredChannels.join(',') : null,
simple_upload: form.simple_upload || null,
      };

try {
const timeoutPromise = new Promise<never>((_, reject) =>
setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 네트워크를 확인해주세요.')), 15000)
);

// Find existing approved inquiry to update
    const findResult = await supabase
      .from('inquiries')
      .select('id')
      .eq('name', session.name)
      .eq('email', session.email)
      .eq('status', 'approved')
      .maybeSingle();
    const existingId = findResult.data?.id;

    let updatePromise;
    if (existingId) {
      updatePromise = supabase
        .from('inquiries')
        .update({
          type: 'ad',
          business_number: insertPayload.business_number,
          upload_date: insertPayload.upload_date,
          material: insertPayload.material,
          product_link: insertPayload.product_link,
          secondary_use: insertPayload.secondary_use,
          video_concept: insertPayload.video_concept,
          extra: insertPayload.extra,
          preferred_channels: insertPayload.preferred_channels,
          simple_upload: insertPayload.simple_upload,
          brand: insertPayload.brand,
        })
        .eq('id', existingId)
        .select();
    } else {
      updatePromise = supabase
        .from('inquiries')
        .insert([insertPayload])
        .select();
    }

const result = await Promise.race([updatePromise, timeoutPromise]);
const { data, error } = result as { data: any; error: any };

if (error) {
if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
setSubmitError('권한 오류: 관리자에게 문의해주세요. (RLS)');
} else {
setSubmitError('제출 오류: ' + error.message);
}
setLoading(false);
return;
}

if (!data || data.length === 0) {
setSubmitError('업데이트된 항목이 없습니다. 관리자에게 문의해주세요.');
setLoading(false);
return;
}

setLoading(false);
      router.replace('/portal/complete');
            // 세부 정보 제출 알림
            fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'inquiry', data: { brand: session?.brand || session?.name || '-', name: session?.name || '-', phone: '-', preferred_channel: preferredChannels.join(', ') || '-', created_at: new Date().toLocaleString('ko-KR') } }) }).catch(err => console.error('[Telegram] details error:', err));
} catch (err: unknown) {
const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
setSubmitError(msg);
setLoading(false);
}
};

if (!session) return null;

const ic = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white";
const lc = "block text-sm font-semibold text-slate-700 mb-2";



return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
<header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
<div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
<a href="/" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
<span className="text-white font-bold text-sm">HR</span>
</div>
<span className="text-xl font-bold text-slate-800">HR Company</span>
</a>
<a href="/portal" className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100">← 포털</a>
</div>
</header>

<section className="max-w-3xl mx-auto px-6 py-12">
<div className="text-center mb-8">
<h1 className="text-3xl font-bold text-slate-800 mb-2">세부 정보 입력</h1>
<p className="text-slate-500">진행을 위해 아래 정보를 입력해주세요.</p>
</div>

<form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
<div>
<label className={lc}>사업자번호</label>
<input
type="text"
name="business_number"
value={form.business_number}
onChange={handleBusinessNumberChange}
placeholder="예) 123-45-67890"
maxLength={12}
className={ic}
/>
</div>

<div>
<label className={lc}>업로드 일시 <span className="text-red-500">*</span></label>
<input type="date" name="upload_date" value={form.upload_date} onChange={handleChange} className={ic} />
</div>

<div>
<label className={lc}>소재 정보 <span className="text-red-500">*</span></label>
<label className="flex items-center gap-2 mb-2 cursor-pointer">
<input type="checkbox" name="material_none" checked={form.material_none} onChange={handleChange} className="w-4 h-4" />
<span className="text-sm text-slate-500">없음 (별도 재전달 예정)</span>
</label>
{!form.material_none && (
<input type="text" name="material" value={form.material} onChange={handleChange} placeholder="예) 공식계정 IG / YT 온드미디어" className={ic} />
)}
</div>

<div>
<label className={lc}>제품 링크 <span className="text-red-500">*</span></label>
<label className="flex items-center gap-2 mb-2 cursor-pointer">
<input type="checkbox" name="product_link_none" checked={form.product_link_none} onChange={handleChange} className="w-4 h-4" />
<span className="text-sm text-slate-500">없음</span>
</label>
{!form.product_link_none && (
<input type="url" name="product_link" value={form.product_link} onChange={handleChange} placeholder="https://" className={ic} />
)}
</div>

<div>
<label className={lc}>추가 정보 (2차 활용 여부) <span className="text-red-500">*</span></label>
<div className="space-y-2">
{SECONDARY_USE_OPTIONS.map(opt => (
<label key={opt} className="flex items-center gap-2 cursor-pointer">
<input type="radio" name="secondary_use" value={opt} checked={form.secondary_use === opt} onChange={handleChange} />
<span className="text-sm text-slate-700">{opt}</span>
</label>
))}
{form.secondary_use === '기타' && (
<input type="text" name="secondary_use_custom" value={form.secondary_use_custom} onChange={handleChange} placeholder="기타 내용 입력" className={ic} />
)}
</div>
</div>

<div>
<label className={lc}>선호하는 채널 <span className="text-red-500">*</span> <span className="text-xs font-normal text-slate-400">(복수 선택 가능)</span></label>
<div className="mb-4">
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">🇰🇷 국내 채널</span>
</div>
<div className="flex flex-wrap gap-2">
{DOMESTIC_CHANNELS.map(ch => (
<button key={ch} type="button" onClick={() => handleChannelToggle(ch)}
className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${preferredChannels.includes(ch) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'}`}>
{ch}
</button>
))}
</div>
</div>
<div>
<div className="flex items-center gap-2 mb-2">
<span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">일본 채널</span>
</div>
<div className="flex flex-wrap gap-2">
{JAPAN_CHANNELS.map(ch => (
<button key={ch} type="button" onClick={() => handleChannelToggle(ch)}
className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${preferredChannels.includes(ch) ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-500'}`}>
{getJpChLabel(ch)}
</button>
))}
</div>
</div>
{preferredChannels.length > 0 && (
<div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
<span className="text-xs text-slate-500">선택된 채널: </span>
<span className="text-xs font-semibold text-slate-700">{preferredChannels.map(ch => getJpChLabel(ch)).join(', ')}</span>
</div>
)}
</div>

<div>
<label className={lc}>희망 영상 콘셉 <span className="text-red-500">*</span></label>
<textarea name="video_concept" value={form.video_concept} onChange={handleChange} rows={3} placeholder="원하시는 영상 컨셉을 자유롭게 적어주세요" className={ic + ' resize-none'} />
</div>

<div>
<label className={lc}>기타 전달 사항</label>
<textarea name="extra" value={form.extra} onChange={handleChange} rows={2} placeholder="추가 전달 사항을 입력해주세요." className={ic + ' resize-none'} />
</div>

<div>
<label className={lc}>단순 업로드 여부</label>
<div className="space-y-2">
{['단순 업로드', '단순 업로드 아님'].map(opt => (
<label key={opt} className="flex items-center gap-2 cursor-pointer">
<input type="radio" name="simple_upload" value={opt} checked={form.simple_upload === opt} onChange={handleChange} />
<span className="text-sm text-slate-700">{opt}</span>
</label>
))}
</div>
</div>

{submitError && (
<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
{submitError}
</div>
)}

<button
type="submit"
disabled={loading}
className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60"
>
{loading ? '제출 중...' : '세부 정보 제출하기'}
</button>
</form>
</section>
</div>
);
}
