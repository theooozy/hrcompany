'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          company: formData.company,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          type: 'brand_ad',
        },
      ]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">HR</span>
            </div>
            <span className="text-xl font-bold text-slate-800">HR Company</span>
          </div>
          <a
            href="/admin/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            관리자 로그인
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-12">
          <span>✦</span>
          <span>디지털 콘텐츠 마케팅 파트너</span>
        </div>

        {/* Title - 우리는 작게(검정) / 광고대행사가 크게(파랑) / 아닙니다. 작게(검정) */}
        <div className="mb-12">
          <p className="text-2xl md:text-3xl font-semibold text-slate-800 mb-1">우리는</p>
          <h1 className="text-6xl md:text-8xl font-extrabold text-blue-600 leading-none mb-2 tracking-tight">
            광고대행사가
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-slate-800">아닙니다.</p>
        </div>

        {/* Description - no box, just text lines */}
        <div className="max-w-2xl mx-auto mb-12 space-y-3 text-center">
          <p className="text-slate-600 text-lg leading-relaxed">
            우리는 <strong className="text-slate-800">49개의 자체 숏폼 채널, 500만 구독자, 월 15억 조회수</strong> 규모의
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            자체 트래픽을 바탕으로 기획부터 제작, 집행까지 모든 광고 과정을 직접 실행합니다.
          </p>
          <p className="text-slate-500 text-base leading-relaxed">
            브랜드가 유저에게 자연스럽게 스며드는 콘텐츠를 만들고,
          </p>
          <p className="text-slate-500 text-base leading-relaxed">
            콘텐츠를 통해 브랜드 가치를 극대화하는 <strong className="text-blue-600">디지털 콘텐츠 마케팅 파트너</strong>입니다.
          </p>
        </div>

        <a
          href="#inquiry"
          className="inline-block px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
        >
          브랜드 광고 문의하기 →
        </a>
      </section>

      {/* Stats Section - 3 individual cards */}
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

      {/* Differentiators Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">핵심 차별점</h2>
          <p className="text-slate-500 text-lg">왜 HR Company인가요?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-5">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">영업 없이 콘텐츠에 집중</h3>
            <p className="text-slate-500 leading-relaxed">오직 콘텐츠 본질과 광고 성과에만 집중합니다. 불필요한 영업 비용 없이 순수하게 결과로 증명합니다.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-5">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">외주 없이 인하우스로 제작</h3>
            <p className="text-slate-500 leading-relaxed">기획·촬영·편집 모두 내부 팀이 직접 진행합니다. 일관된 퀄리티와 빠른 피드백이 가능합니다.</p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center mb-5">
              <span className="text-2xl font-bold text-sky-600">3</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">모든 과정을 직접 제작</h3>
            <p className="text-slate-500 leading-relaxed">콘텐츠 기획부터 집행까지 전 과정을 직접 수행하여 품질을 보장하고 책임 있는 결과를 만들어냅니다.</p>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">브랜드 광고 문의</h2>
            <p className="text-slate-500 text-lg">궁금한 점이 있으시면 언제든지 문의해주세요.</p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">문의가 접수되었습니다!</h3>
              <p className="text-slate-500 text-lg mb-8">
                빠른 시일 내에 담당자가 연락드리겠습니다.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ company: '', name: '', email: '', phone: '', message: '' });
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md"
              >
                새 문의 작성
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    회사명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="회사명을 입력해주세요"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    담당자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="담당자 성함"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">연락처</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="광고 문의 내용을 자세히 작성해주세요. (예: 원하는 광고 유형, 예산 범위, 캠페인 일정 등)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"
                />
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

      {/* Footer */}
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
