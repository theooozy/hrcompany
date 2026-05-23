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
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <span>✨</span>
          <span>브랜드 광고 전문 파트너</span>
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
          브랜드의 가치를<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            더 높이 올려드립니다
          </span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          HR Company는 브랜드 광고 기획부터 실행까지 전문적인 마케팅 솔루션을 제공합니다.
          귀사의 브랜드 성장을 함께 만들어 나갑니다.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <a
            href="#inquiry"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all"
          >
            브랜드 광고 문의하기
          </a>
          <a
            href="#services"
            className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            서비스 보기
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">주요 서비스</h2>
          <p className="text-slate-500 text-lg">브랜드 성장을 위한 맞춤형 솔루션</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '📢',
              title: '브랜드 광고 기획',
              desc: '타겟 분석부터 크리에이티브 전략까지 브랜드에 최적화된 광고를 기획합니다.',
            },
            {
              icon: '📊',
              title: '디지털 마케팅',
              desc: 'SNS, 검색광고, 디스플레이 광고 등 다양한 채널을 통한 효과적인 마케팅을 실행합니다.',
            },
            {
              icon: '🎯',
              title: '퍼포먼스 분석',
              desc: '데이터 기반 성과 분석으로 광고 효율을 지속적으로 최적화합니다.',
            },
          ].map((service) => (
            <div
              key={service.title}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{service.title}</h3>
              <p className="text-slate-500 leading-relaxed">{service.desc}</p>
            </div>
          ))}
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
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? '제출 중...' : '문의 제출하기'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-16">
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
