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
    '밈튜브', '숏스커버리', '유니랜드', '신기+탬', '숏믈리에',
    '디어랩', '숏픽', '두근두근', '전국댓글자랑', '숏플레시', '출석체크',
  ];

const JAPAN_CHANNELS = [
    'ワクワク', 'スポログ', '笑慇の一秒', 'おもしろ塾', '一瞬劇場',
    '絆タイム', 'チーズケーキ', 'オイシイワールド', 'モグモグ', 'トレ韓',
  ];

type Session = { id: string; name: string; email: string };

export default function PortalDetailsPage() {
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bankFile, setBankFile] = useState<File | null>(null);
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

  const handleChannelToggle = (channel: string) => {
        setPreferredChannels(prev =>
                prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
                                 );
  };

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        setLoading(true);
        try {
                let bankImageUrl = '';
                if (bankFile) {
                          const ext = bankFile.name.split('.').pop();
                          const fileName = 'bank_' + Date.now() + '.' + ext;
                          const { error: uploadError } = await supabase.storage
                            .from('inquiry-files')
                            .upload(fileName, bankFile, { upsert: true });
                          if (uploadError) throw new Error('이미지 업로드 실패: ' + uploadError.message);
                          const { data: urlData } = supabase.storage.from('inquiry-files').getPublicUrl(fileName);
                          bankImageUrl = urlData.publicUrl;
                }

          const secondaryUse = form.secondary_use === '기타'
                  ? (form.secondary_use_custom || '기타')
                    : form.secondary_use;

          const updatePayload: Record<string, unknown> = {
                    type: 'ad',
                    business_number: form.business_number,
                    upload_date: form.upload_date || null,
                    material: form.material_none ? '없음' : form.material,
                    product_link: form.product_link_none ? '없음' : form.product_link,
                    secondary_use: secondaryUse,
                    video_concept: form.video_concept,
                    extra: form.extra,
                    preferred_channels: preferredChannels.length > 0 ? preferredChannels.join(', ') : null,
          };
                if (bankImageUrl) updatePayload.bank_account_image = bankImageUrl;

          const { error } = await supabase.from('inquiries').update(updatePayload).eq('id', session.id);
                if (error) throw new Error(error.message);
                setSubmitted(true);
        } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
                alert('제출 오류: ' + msg);
        } finally {
                setLoading(false);
        }
  };

  if (!session) return null;

  const ic = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white";
    const lc = "block text-sm font-semibold text-slate-700 mb-2";

  if (submitted) {
        return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
                        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
                                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                              <span className="text-3xl">✓</span>span>
                                  </div>
                                  <h1 className="text-2xl font-bold text-slate-800 mb-2">제출 완료</h1>h1>
                                  <p className="text-slate-500 mb-6">담당자가 검토 후 연락드리겠습니다.</p>p>
                                  <a href="/portal" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">포털로 돌아가기</a>a>
                        </div>
                </div>
              );
  }
  
    return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
                        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
                                                            <span className="text-white font-bold text-sm">HR</span>span>
                                              </div>
                                              <span className="text-xl font-bold text-slate-800">HR Company</span>span>
                                  </div>
                                  <a href="/portal" className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100">← 포털</a>a>
                        </div>
                </header>header>
          
                <section className="max-w-3xl mx-auto px-6 py-12">
                        <div className="text-center mb-8">
                                  <h1 className="text-3xl font-bold text-slate-800 mb-2">세부 정보 입력</h1>h1>
                                  <p className="text-slate-500">진행을 위해 아래 정보를 입력해주세요.</p>p>
                        </div>
                
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
                                  <div>
                                              <label className={lc}>사업자번호</label>label>
                                              <input type="text" name="business_number" value={form.business_number} onChange={handleChange} placeholder="예) 123-45-67890" className={ic} />
                                  </div>
                        
                                  <div>
                                              <label className={lc}>통장 사본 <span className="text-xs text-slate-400">(이미지 첨부)</span>span></label>label>
                                              <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer">
                                                            <span className="text-lg">📎</span>span>
                                                            <span className="text-sm text-slate-500">{bankFile ? bankFile.name : '이미지를 선택해주세요 (JPG, PNG, PDF)'}</span>span>
                                                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setBankFile(e.target.files?.[0] || null)} />
                                              </label>label>
                                    {bankFile && (
                          <button type="button" onClick={() => setBankFile(null)} className="mt-2 text-xs text-red-400 hover:text-red-600">파일 삭제</button>button>
                                              )}
                                  </div>
                        
                                  <div>
                                              <label className={lc}>업로드 일시</label>label>
                                              <input type="date" name="upload_date" value={form.upload_date} onChange={handleChange} className={ic} />
                                  </div>
                        
                                  <div>
                                              <label className={lc}>소재 정보</label>label>
                                              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                                            <input type="checkbox" name="material_none" checked={form.material_none} onChange={handleChange} className="w-4 h-4" />
                                                            <span className="text-sm text-slate-500">없음 (별도 재전달 예정)</span>span>
                                              </label>label>
                                    {!form.material_none && (
                          <input type="text" name="material" value={form.material} onChange={handleChange} placeholder="예) 공식계정 IG / YT 온드미디어" className={ic} />
                        )}
                                  </div>
                        
                                  <div>
                                              <label className={lc}>제품 링크</label>label>
                                              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                                            <input type="checkbox" name="product_link_none" checked={form.product_link_none} onChange={handleChange} className="w-4 h-4" />
                                                            <span className="text-sm text-slate-500">없음</span>span>
                                              </label>label>
                                    {!form.product_link_none && (
                          <input type="url" name="product_link" value={form.product_link} onChange={handleChange} placeholder="https://" className={ic} />
                        )}
                                  </div>
                        
                                  <div>
                                              <label className={lc}>추가 정보 (2차 활용 여부)</label>label>
                                              <div className="space-y-2">
                                                {SECONDARY_USE_OPTIONS.map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                              <input type="radio" name="secondary_use" value={opt} checked={form.secondary_use === opt} onChange={handleChange} />
                                              <span className="text-sm text-slate-700">{opt}</span>span>
                            </label>label>
                          ))}
                                                {form.secondary_use === '기타' && (
                            <input type="text" name="secondary_use_custom" value={form.secondary_use_custom} onChange={handleChange} placeholder="기타 내용 입력" className={ic} />
                          )}
                                              </div>
                                  </div>
                        
                          {/* 선호하는 채널 선택 */}
                                  <div>
                                              <label className={lc}>선호하는 채널 <span className="text-xs font-normal text-slate-400">(복수 선택 가능)</span>span></label>label>
                                              
                                    {/* 국내 채널 */}
                                              <div className="mb-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">🇰🇷 국내 채널</span>span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                              {DOMESTIC_CHANNELS.map(ch => (
                              <button
                                                    key={ch}
                                                    type="button"
                                                    onClick={() => handleChannelToggle(ch)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                                            preferredChannels.includes(ch)
                                                                              ? 'bg-blue-600 text-white border-blue-600'
                                                                              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                                                    }`}
                                                  >
                                {ch}
                              </button>button>
                            ))}
                                                            </div>
                                              </div>
                                  
                                    {/* 일본 채널 */}
                                              <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">🇯🇵 일본 채널</span>span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                              {JAPAN_CHANNELS.map(ch => (
                              <button
                                                    key={ch}
                                                    type="button"
                                                    onClick={() => handleChannelToggle(ch)}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                                                            preferredChannels.includes(ch)
                                                                              ? 'bg-red-500 text-white border-red-500'
                                                                              : 'bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-500'
                                                    }`}
                                                  >
                                {ch}
                              </button>button>
                            ))}
                                                            </div>
                                              </div>
                                  
                                    {preferredChannels.length > 0 && (
                          <div className="mt-3 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                                          <span className="text-xs text-slate-500">선택된 채널: </span>span>
                                          <span className="text-xs font-semibold text-slate-700">{preferredChannels.join(', ')}</span>span>
                          </div>
                                              )}
                                  </div>
                        
                                  <div>
                                              <label className={lc}>희망 영상 컨셉</label>label>
                                              <textarea name="video_concept" value={form.video_concept} onChange={handleChange} rows={3} placeholder="원하시는 영상 컨셉을 자유롭게 적어주세요" className={ic + ' resize-none'} />
                                  </div>
                        
                                  <div>
                                              <label className={lc}>기타 전달 사항</label>label>
                                              <textarea name="extra" value={form.extra} onChange={handleChange} rows={2} placeholder="추가 전달 사항을 입력해주세요." className={ic + ' resize-none'} />
                                  </div>
                        
                                  <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60"
                                              >
                                    {loading ? '제출 중...' : '세부 정보 제출하기'}
                                  </button>button>
                        </form>form>
                </section>section>
          </div>
        );
}</div>
