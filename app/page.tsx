'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CHANNELS = ['셀럽온', '미모지상주의', '쇼숏', '쇼잉'];

const SECONDARY_USE_OPTIONS = [
  '브랜드/아티스트 관련 모두 활용 가능',
  '동의 안 받음',
  '기타',
];

export default function HomePage() {
  const [formData, setFormData] = useState({
    brand: '',
    upload_date: '',
    channels: [] as string[],
    product_link: '',
    product_link_none: false,
    material: '',
    material_none: false,
    secondary_use: '',
    secondary_use_custom: '',
    video_concept: '',
    extra: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'checkbox' && target.name === 'channels') {
      const val = target.value;
      setFormData(prev => ({
        ...prev,
        channels: prev.channels.includes(val)
          ? prev.channels.filter(c => c !== val)
          : [...prev.channels, val],
      }));
    } else if (target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [target.name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const secondaryUse = formData.secondary_use === '기타'
        ? (formData.secondary_use_custom || '기타')
        : formData.secondary_use;

      const payload = {
        brand: formData.brand,
        upload_date: formData.upload_date,
        channels: formData.channels.join(', '),
        product_link: formData.product_link_none ? '없음' : formData.product_link,
        material: formData.material_none ? '없음' : formData.material,
        secondary_use: secondaryUse,
        video_concept: formData.video_concept,
        extra: formData.extra,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: 'brand_ad',
        status: 'pending',
      };

      const { error } = await supabase.from('inquiries').insert([payload]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('제출 오류: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ brand: '', upload_date: '', channels: [], product_link: '', product_link_none: false, material: '', material_none: false, secondary_use: '', secondary_use_custom: '', video_concept: '', extra: '', name: '', email: '', phone: '' });
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <span className="text-xl font-bold text-slate-800">HR Company</span>
          </div>
          <a href="/admin/login" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">관리자 로그인</a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-12">
          <span>✦</span><span>디지털 콘텐츠 마케팅 파트너</span>
        </div>
        <div className="mb-12">
          <p className="text-2xl md:text-3xl font-semibold text-slate-800 mb-1">우리는</p>
          <h1 className="text-6xl md:text-8xl font-extrabold text-blue-600 leading-none mb-2 tracking-tight">광고대행사가</h1>
          <p className="text-2xl md:text-3xl font-semibold text-slate-800">아닙니다.</p>
        </div>
        <div className="max-w-2xl mx-auto mb-12 space-y-3 text-center">
          <p className="text-slate-600 text-lg leading-relaxed">우리는 <strong className="text-slate-800">49개의 자체 숏폼 채널, 500만 구독자, 월 15억 조회수</strong> 규모의</p>
          <p className="text-slate-600 text-lg leading-relaxed">자체 트래픽을 바탕으로 기획부터 제작, 집행까지 모든 광고 과정을 직접 실행합니다.</p>
          <p className="text-slate-500 text-base leading-relaxed">브랜드가 유저에게 자연스럽게 스며드는 콘텐츠를 만들고,</p>
          <p className="text-slate-500 text-base leading-relaxed">콘텐츠를 통해 브랜드 가치를 극대화하는 <strong className="text-blue-600">디지털 콘텐츠 마케팅 파트너</strong>입니다.</p>
        </div>
        <a href="#inquiry" className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all">브랜드 광고 문의하기 →</a>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center shadow-lg">
            <div className="text-5xl font-extrabold mb-2">49개</div>
            <div className="text-blue-200 text-base font-medium">자체 숏폼 채널</div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white text-center shadow-lg">
            <div className="text-5xl font-extrabold mb-2">500만</div>
            <div className="text-indigo-200 text-base font-medium">구독자</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white text-center shadow-lg">
            <div className="text-5xl font-extrabold mb-2">15억</div>
            <div className="text-blue-200 text-base font-medium">월 조회수</div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">핵심 차별점</h2>
          <p className="text-slate-500 text-lg">왜 HR Company인가요?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { num: '1', title: '영업 없이 콘텐츠에 집중', desc: '오직 콘텐츠 본질과 광고 성과에만 집중합니다.' },
            { num: '2', title: '외주 없이 인하우스로 제작', desc: '기획·촬영·편집 모두 내부 팀이 직접 진행합니다.' },
            { num: '3', title: '모든 과정을 직접 제작', desc: '전 과정을 직접 수행하여 품질을 보장합니다.' },
          ].map((item) => (
            <div key={item.num} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <span className="text-2xl font-bold text-blue-600">{item.num}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="inquiry" className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">브랜드 광고 문의</h2>
            <p className="text-slate-500 text-lg">아래 양식을 작성하여 문의해주세요.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">문의가 접수되었습니다!</h3>
              <p className="text-slate-500 text-lg mb-8">빠른 시일 내에 담당자가 연락드리겠습니다.</p>
              <button onClick={resetForm} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md">새 문의 작성</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-7">

              {/* 1. 담당자 정보 */}
              <div className="pb-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">1</span>
                  담당자 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>담당자명 <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="성함" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>이메일 <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@company.com" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>연락처</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" className={inputClass} />
                  </div>
                </div>
              </div>

              {/* 2. 캠페인 기본 정보 */}
              <div className="pb-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">2</span>
                  캠페인 기본 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>브랜드 <span className="text-red-500">*</span></label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="예) 더블랙레이블(태양)" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>업로드 일시 <span className="text-red-500">*</span></label>
                    <input type="date" name="upload_date" value={formData.upload_date} onChange={handleChange} required className={inputClass} />
                  </div>
                </div>
              </div>

              {/* 3. 희망 채널 */}
              <div className="pb-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">3</span>
                  희망 채널 <span className="text-xs font-normal text-slate-400 ml-1">(복수 선택 가능)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CHANNELS.map(ch => (
                    <label key={ch} className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${formData.channels.includes(ch) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'}`}>
                      <input type="checkbox" name="channels" value={ch} checked={formData.channels.includes(ch)} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm font-medium">{ch}</span>
                    </label>
                  ))}
                </div>
                {formData.channels.length > 0 && (
                  <p className="mt-2 text-xs text-blue-600">선택됨: {formData.channels.join(', ')}</p>
                )}
              </div>

              {/* 4. 소재 정보 */}
              <div className="pb-6 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">4</span>
                  소재 정보
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>제품 링크</label>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" name="product_link_none" checked={formData.product_link_none} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-slate-500">없음 (별도 파일 전달 예정)</span>
                    </label>
                    {!formData.product_link_none && (
                      <input type="text" name="product_link" value={formData.product_link} onChange={handleChange} placeholder="예) https://... 또는 별도 엑셀파일 전달" className={inputClass} />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>활용 소재</label>
                    <label className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" name="material_none" checked={formData.material_none} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                      <span className="text-sm text-slate-500">없음 (별도 재전달 예정)</span>
                    </label>
                    {!formData.material_none && (
                      <input type="text" name="material" value={formData.material} onChange={handleChange} placeholder="예) 공식계정 IG / YT 온드미디어" className={inputClass} />
                    )}
                  </div>
                </div>
              </div>

              {/* 5. 추가 정보 */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">5</span>
                  추가 정보
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>2차 활용 여부</label>
                    <div className="space-y-2">
                      {SECONDARY_USE_OPTIONS.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="secondary_use"
                            value={opt}
                            checked={formData.secondary_use === opt}
                            onChange={handleChange}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {formData.secondary_use === '기타' && (
                      <textarea
                        name="secondary_use_custom"
                        value={formData.secondary_use_custom}
                        onChange={handleChange}
                        rows={2}
                        placeholder="기타 내용을 직접 입력해주세요."
                        className={inputClass + " resize-none mt-3"}
                      />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>희망 영상 컨셉</label>
                    <textarea name="video_concept" value={formData.video_concept} onChange={handleChange} rows={3} placeholder="예) 자연스러운 일상 녹여내기, 별도 재전달 예정 등" className={inputClass + " resize-none"} />
                  </div>
                  <div>
                    <label className={labelClass}>기타 전달 사항</label>
                    <textarea name="extra" value={formData.extra} onChange={handleChange} rows={3} placeholder="추가로 전달하실 내용을 자유롭게 작성해주세요." className={inputClass + " resize-none"} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '제출 중...' : '문의 제출하기'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 mt-8">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <span className="text-white font-bold text-xs">HR</span>
            </div>
            <span className="text-lg font-bold text-slate-700">HR Company</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 HR Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
