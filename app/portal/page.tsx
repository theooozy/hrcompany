'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Session = { id: string; name: string; email: string };

const CHANNEL_PRICES = [
  { name: '셀럽온', price: 1000000, description: '셀럽 중심 콘텐츠 채널' },
  { name: '미모지상주의', price: 1000000, description: '뷰티·라이프스타일 채널' },
  { name: '쇼숏', price: 1000000, description: '쇼츠·릴스 전문 채널' },
  { name: '쇼잉', price: 1000000, description: '쇼츠 콘텐츠 채널' },
];

export default function PortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('portal_session') : null;
    if (!raw) { router.replace('/portal/login'); return; }
    try { setSession(JSON.parse(raw)); } catch { router.replace('/portal/login'); }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('portal_session');
    router.push('/');
  };

  if (!session) return null;

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
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden md:inline">{session.name}님 환영합니다</span>
            <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100">로그아웃</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">채널별 단가 안내</h1>
          <p className="text-slate-500">아래 단가를 확인하시고 진행을 원하시면 세부 정보를 입력해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {CHANNEL_PRICES.map((ch) => (
            <div key={ch.name} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-slate-800">{ch.name}</h3>
                <span className="text-xs text-slate-400">{ch.description}</span>
              </div>
              <div className="text-3xl font-extrabold text-blue-600">
                {ch.price.toLocaleString()}<span className="text-base text-slate-500 font-medium ml-1">원</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-md border border-slate-100 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">진행을 원하시나요?</h2>
          <p className="text-slate-500 mb-6">세부 정보를 입력해주시면 담당자가 곧 연락드립니다.</p>
          <a
            href="/portal/details"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            세부 정보 입력하기 →
          </a>
        </div>
      </section>
    </div>
  );
}
