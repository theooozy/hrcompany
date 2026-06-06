'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [formData, setFormData] = useState({
    brand: '',
    name: '',
    email: '',
    phone: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setFormData(prev => ({ ...prev, [target.name]: target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('inquiries').insert([{
        brand: formData.brand,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: 'signup',
        status: 'pending',
      }]);

      if (error) throw new Error(error.message);
      setSubmitted(true);
      fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'inquiry', data: { brand: formData.brand, name: formData.name, phone: formData.phone || formData.email, preferred_channel: '-', created_at: new Date().toLocaleString('ko-KR') } }) }).catch(err => console.error('[Telegram] error:', err));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      alert('제출 오류: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({ brand: '', name: '', email: '', phone: '' });
  };

  const ic = "w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all bg-white";
  const lc = "block text-sm font-semibold text-slate-700 mb-2";
  const SectionTitle = ({ n, title }: { n: string; title: string }) => (
    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0">{n}</span>
      {title}
    </h3>
  );

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
          <div className="flex items-center gap-2"><a href="/portal/login" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50">문의자 로그인</a><a href="/admin/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100">관리자 로그인</a></div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-12">
          <span>✦</span><span>디지털 콘텐츠 마케팅 파트너</span>
        </div>
        <div className="mb-12">
          <p className="text-2xl md:text-3xl font-semibold text-slate-800 mb-1">우리는</p>
          <h1 className="text-6xl md:text-8xl font-extrabold text-blue-600 leading-none mb-2 tracking-tight">광고대행사<span className="text-2xl md:text-3xl font-semibold text-slate-800 align-bottom">가</span></h1>
          <p className="text-2xl md:text-3xl font-semibold text-slate-800">아닙니다.</p>
        </div>
        <div className="max-w-2xl mx-auto mb-12 space-y-3 text-center">
          <p className="text-slate-600 text-lg leading-relaxed">우리는 <strong className="text-slate-800">49개의 자체 숏폼 채널, 500만 구독자, 월 15억 조회수</strong> 규모의</p>
          <p className="text-slate-600 text-lg leading-relaxed">자체 트래픽을 바탕으로 기획부터 제작, 집행까지 모든 광고 과정을 직접 실행합니다.</p>
          <p className="text-slate-500 text-base leading-relaxed">브랜드가 유저에게 자연스럽게 스며드는 콘텐츠를 만들고,</p>
          <p className="text-slate-500 text-base leading-relaxed">콘텐츠를 통해 브랜드 가치를 극대화하는 <strong className="text-blue-600">디지털 콘텐츠 마케팅 파트너</strong>입니다.</p>
        </div>
        <a href="#inquiry" className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">브랜드 광고 문의하기 →</a>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[{ n: '49개', s: '자체 숏폼 채널', c: 'from-blue-600 to-blue-700', t: 'text-blue-200' }, { n: '500만', s: '구독자', c: 'from-indigo-600 to-indigo-700', t: 'text-indigo-200' }, { n: '15억', s: '월 조회수', c: 'from-blue-500 to-indigo-600', t: 'text-blue-200' }].map(item => (
            <div key={item.n} className={`bg-gradient-to-br ${item.c} rounded-2xl p-8 text-white text-center shadow-lg`}>
              <div className="text-5xl font-extrabold mb-2">{item.n}</div>
              <div className={`${item.t} text-base font-medium`}>{item.s}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">핵심 차별점</h2>
          <p className="text-slate-500 text-lg">왜 HR Company인가요?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[{ n: '1', t: '영업 없이 콘텐츠에 집중', d: '오직 콘텐츠 본질과 광고 성과에만 집중합니다.' }, { n: '2', t: '외주 없이 인하우스로 제작', d: '기획·촬영·편집 모두 내부 팀이 직접 진행합니다.' }, { n: '3', t: '모든 과정을 직접 제작', d: '전 과정을 직접 수행하여 품질을 보장합니다.' }].map(item => (
            <div key={item.n} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
                <span className="text-2xl font-bold text-blue-600">{item.n}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.t}</h3>
              <p className="text-slate-500 leading-relaxed">{item.d}</p>
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
              <button onClick={resetForm} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md">새 문의 작성</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-7">

              {/* 1. 담당자 정보 */}
              <div className="pb-6 border-b border-slate-100">
                <SectionTitle n="1" title="담당자 정보" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={lc}>담당자명 <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="성함" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>이메일 <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="email@company.com" className={ic} />
                  </div>
                  <div>
                    <label className={lc}>연락처</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" className={ic} />
                  </div>
                </div>
              </div>

              {/* 2. 캠페인 기본 정보 */}
              <div>
                <SectionTitle n="2" title="캠페인 기본 정보" />
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={lc}>브랜드 <span className="text-red-500">*</span></label>
                    <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder="예) 더블랙레이블(태양)" className={ic} />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
