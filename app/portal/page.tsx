'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Session = { id: string; name: string; email: string };

const CHANNEL_PRICES = [
  // 국내 채널
  { name: '셀럽온', platform: 'YouTube · IG · TikTok', subscribers: '1.16만 / 153 / 185', makePrice: 80, postPrice: 35, link: 'https://www.youtube.com/@셀럽은', featured: true },
  { name: '찐예쁨', platform: 'YouTube · IG · TikTok', subscribers: '1.2만 / 900 / 1,562', makePrice: 70, postPrice: 30, link: 'https://www.youtube.com/@예쁘지고싶니' },
  { name: '미모지상주의', platform: 'YouTube · IG · TikTok', subscribers: '6.21만 / 2 / 2,683', makePrice: 70, postPrice: 30, link: 'https://www.youtube.com/@예쁘지고싶으면구독' },
  { name: '쇼잉', platform: 'YouTube · IG · TikTok', subscribers: '37.2만 / 6,505 / 793', makePrice: 75, postPrice: 30, link: 'https://www.youtube.com/@구독은너무좋아요' },
  { name: '쇼숏', platform: 'YouTube · IG · TikTok', subscribers: '34.1만 / 9,835 / 5,206', makePrice: 75, postPrice: 30, link: 'https://www.youtube.com/@구독은행운입니다' },
  { name: '숏됐다', platform: 'YouTube · IG', subscribers: '25.3만 / 7,869', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@구독은필수인거알지' },
  { name: '밈튜브', platform: 'YouTube · IG · TikTok', subscribers: '24.7만 / 2,469 / 1,735', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@mimtube777' },
  { name: '숏스커버리', platform: 'YouTube · IG', subscribers: '21.3만 / 2,077', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@숏스커버리' },
  { name: '유니랜드', platform: 'YouTube · IG · TikTok', subscribers: '17만 / 4,335 / 295', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@유니랜드' },
  { name: '신기+탬', platform: 'YouTube · IG · TikTok', subscribers: '14.4만 / 1,759 / 2,343', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@이쁘지고싶으면구독' },
  { name: '숏믈리에', platform: 'YouTube · IG', subscribers: '3.98만 / 419', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@숏믈리에' },
  { name: '디어랩', platform: 'YouTube · IG', subscribers: '3.85만 / 1', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@구독하면행운입니다' },
  { name: '숏픽', platform: 'YouTube · IG · TikTok', subscribers: '2.36만 / 148 / 55', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@구독을해야지' },
  { name: '두근두근', platform: 'YouTube · IG', subscribers: '1.53만 / 941', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@두근두근좋아요' },
  { name: '전국댓글자랑', platform: 'YouTube · IG', subscribers: '1.5만 / 355', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@전국댓글자랑' },
  { name: '숏플레시', platform: 'YouTube', subscribers: '3.8만', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@구독짱좋아요' },
  { name: '출석체크', platform: 'YouTube · IG', subscribers: '7.4천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@쌈플래보는채널' },
  // 일본 채널
  { name: 'ワクワク', platform: 'YouTube · IG', subscribers: '16만 / 1만', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@フォローわくわく', isJapan: true },
  { name: 'スポログ', platform: 'YouTube · IG', subscribers: '7.7만 / 1만', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@スポログ', isJapan: true },
  { name: '笑慇の一秒', platform: 'YouTube', subscribers: '3.5만', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@笑慇の一秒', isJapan: true },
  { name: 'おもしろ塾', platform: 'YouTube', subscribers: '4.5천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@おもしろ塾', isJapan: true },
  { name: '一瞬劇場', platform: 'YouTube', subscribers: '5.4천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@一瞬劇場', isJapan: true },
  { name: '絆タイム', platform: 'YouTube', subscribers: '1만', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@絆タイム', isJapan: true },
  { name: 'チーズケーキ', platform: 'YouTube', subscribers: '4천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@チーズケーキ777', isJapan: true },
  { name: 'オイシイワールド', platform: 'YouTube', subscribers: '3.5천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@オイシイワールド', isJapan: true },
  { name: 'モグモグ', platform: 'YouTube', subscribers: '6.6천', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@MoguMogu_Ham', isJapan: true },
  { name: 'トレ韓', platform: 'YouTube · IG', subscribers: '1.9만 / 856', makePrice: 65, postPrice: 30, link: 'https://www.youtube.com/@トレ韓', isJapan: true },
];

const domesticChannels = CHANNEL_PRICES.filter(ch => !ch.isJapan);
const japanChannels = CHANNEL_PRICES.filter(ch => ch.isJapan);

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

  const ChannelCard = ({ ch }: { ch: typeof CHANNEL_PRICES[0] }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border transition-all hover:shadow-md ${ch.featured ? 'border-blue-300 ring-1 ring-blue-200' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {ch.featured && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">★ BEST</span>}
          <h3 className="text-base font-bold text-slate-800">{ch.name}</h3>
        </div>
        <a href={ch.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-600 underline truncate max-w-[120px]">링크</a>
      </div>
      <p className="text-xs text-slate-400 mb-1">{ch.platform}</p>
      <p className="text-xs text-slate-500 mb-3">구독자/팔로워: {ch.subscribers}</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-xl p-2 text-center">
          <p className="text-xs text-slate-500 mb-0.5">제작+발행</p>
          <p className="text-lg font-extrabold text-blue-600">{ch.makePrice}<span className="text-xs font-medium text-slate-500">만원</span></p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2 text-center">
          <p className="text-xs text-slate-500 mb-0.5">단순발행</p>
          <p className="text-lg font-extrabold text-slate-700">{ch.postPrice}<span className="text-xs font-medium text-slate-500">만원</span></p>
        </div>
      </div>
    </div>
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
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden md:inline">{session.name}님 환영합니다</span>
            <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100">로그아웃</button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

        {/* 페이지 제목 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">채널별 단가 안내</h1>
          <p className="text-slate-500">아래 단가를 확인하시고 진행을 원하시면 세부 정보를 입력해주세요.</p>
        </div>

        {/* CTA 섹션 - 채널 목록 위, 충분한 여백 확보 */}
        <div className="mb-14 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 md:p-10 text-center shadow-xl overflow-hidden">
          <div className="mb-2">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">📋 광고 진행 문의</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">진행을 원하시나요?</h2>
          <p className="text-blue-100 mb-8 text-base">세부 정보를 입력해주시면 담당자가 곧 연락드립니다.</p>
          <a
            href="/portal/details"
            className="inline-block px-6 py-3 bg-white text-blue-700 rounded-2xl font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 whitespace-nowrap"
          >
            세부 정보 입력하기 →
          </a>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm font-medium px-2">채널 목록</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* 국내 채널 섹션 */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6 bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4">
            <span className="text-3xl">🇰🇷</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-extrabold text-blue-800">국내 채널</h2>
                <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">{domesticChannels.length}개</span>
              </div>
              <p className="text-sm text-blue-500">Korean Channels · 국내 인플루언서</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domesticChannels.map((ch) => <ChannelCard key={ch.name} ch={ch} />)}
          </div>
        </div>

        {/* 국내/일본 구분 */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm font-medium px-2">🌏 해외 채널</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* 일본 채널 섹션 */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6 bg-red-50 border border-red-200 rounded-2xl px-6 py-4">
            <span className="text-3xl">🇯🇵</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-xl font-extrabold text-red-800">일본 채널</h2>
                <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">{japanChannels.length}개</span>
              </div>
              <p className="text-sm text-red-400">Japan Channels · 일본 인플루언서</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {japanChannels.map((ch) => <ChannelCard key={ch.name} ch={ch} />)}
          </div>
        </div>

        {/* 하단 CTA 반복 */}
        <div className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-center shadow-xl">
          <h2 className="text-xl font-extrabold text-white mb-2">마음에 드는 채널을 찾으셨나요?</h2>
          <p className="text-blue-100 mb-6 text-sm">세부 정보를 입력하시면 담당자가 빠르게 연락드립니다.</p>
          <a
            href="/portal/details"
            className="inline-block px-8 py-3 bg-white text-blue-700 rounded-2xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            세부 정보 입력하기 →
          </a>
        </div>

      </section>
    </div>
  );
}
