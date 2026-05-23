'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    company: '', name: '', phone: '', email: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-[#111118] text-white overflow-x-hidden">

      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 bg-[#111118]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <span className="text-2xl font-black tracking-[0.2em] text-white">HR</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-6 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              광고 문의
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="text-sm px-5 py-2.5 border border-white/20 rounded-full text-gray-400 hover:text-white hover:border-white/40 transition-all duration-300"
            >
              관리자
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="absolute inset-0 bg-[#111118]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 배지 */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/[0.04]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-400 tracking-[0.2em] font-medium">DIGITAL CONTENTS MARKETING</span>
            </div>
          </div>

          {/* 메인 헤드라인 - 왼쪽 정렬 */}
          <div className="mb-10">
            <p className="text-lg text-gray-500 mb-3 font-medium">우리는</p>
            <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-3">
              <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                광고대행사가
              </span>
            </h1>
            <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight text-white">
              아닙니다.
            </h1>
          </div>

          {/* 구분선 */}
          <div className="w-16 h-px bg-gradient-to-r from-blue-400 to-purple-400 mb-10" />

          {/* 본문 */}
          <div className="max-w-2xl space-y-4 mb-14">
            <p className="text-xl text-gray-300 leading-relaxed">
              <span className="text-white font-semibold">49개의 자체 숏폼 채널</span>,{' '}
              <span className="text-white font-semibold">500만 구독자</span>,{' '}
              <span className="text-white font-semibold">월 15억 조회수</span>
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              자체 트래픽을 바탕으로 기획부터 제작, 집행까지<br />
              모든 광고 과정을 직접 실행합니다.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed">
              브랜드가 유저에게 자연스럽게 스며드는 콘텐츠,<br />
              콘텐츠로 브랜드 가치를 극대화하는
              {' '}<span className="text-gray-300 font-medium">디지털 콘텐츠 마케팅 파트너</span>입니다.
            </p>
          </div>

          {/* 통계 + CTA */}
          <div className="flex flex-wrap items-center gap-6">
            {[
              { num: '49', label: '자체 채널' },
              { num: '500만', label: '구독자' },
              { num: '15억+', label: '월 조회수' },
            ].map((stat, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{stat.num}</span>
                <span className="text-sm text-gray-500">{stat.label}</span>
                {i < 2 && <span className="text-gray-700 ml-4">|</span>}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <button
              onClick={() => setShowForm(true)}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
            >
              브랜드 광고 문의하기
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-600 to-transparent animate-pulse" />
        </div>
      </section>

      {/* 핵심 차별점 */}
      <section className="py-32 px-6 relative bg-[#0e0e15]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <span className="text-xs tracking-[0.3em] text-blue-400 font-semibold">WHY HR</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-white">핵심 차별점</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: '영업 없이\n콘텐츠에 집중',
                desc: '오직 콘텐츠 본질과 광고 성과에만 집중합니다. 불필요한 영업 없이 결과로 증명합니다.',
                color: 'from-blue-400 to-cyan-400',
                glow: 'group-hover:shadow-blue-500/20',
              },
              {
                num: '02',
                title: '외주 없이\n인하우스로 제작',
                desc: '기획, 촬영, 편집까지 내부 팀이 직접 진행합니다. 일관된 퀄리티와 빠른 실행력을 보장합니다.',
                color: 'from-violet-400 to-pink-400',
                glow: 'group-hover:shadow-violet-500/20',
              },
              {
                num: '03',
                title: '직접 제작으로\n품질 보장',
                desc: '자체 채널 운영 노하우가 그대로 적용됩니다. 모든 과정을 직접 제작하여 최상의 품질을 보장합니다.',
                color: 'from-orange-400 to-red-400',
                glow: 'group-hover:shadow-orange-500/20',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`group p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/15 hover:shadow-xl ${item.glow} transition-all duration-300`}
              >
                <div className={`text-5xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-6`}>
                  {item.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 whitespace-pre-line leading-snug">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-32 px-6 bg-[#111118] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-pink-600/10" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            지금 바로<br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              브랜드 성장을 시작하세요
            </span>
          </h2>
          <p className="text-gray-500 mb-10">
            자체 트래픽과 검증된 콘텐츠 제작 역량으로 브랜드의 가치를 높여드립니다.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300"
          >
            브랜드 광고 문의하기 →
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 px-6 text-center text-gray-700 text-sm bg-[#0e0e15]">
        © 2026 HR Company. All rights reserved.
      </footer>

      {/* 문의 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#16161f] border border-white/10 rounded-2xl p-8 shadow-2xl">
            <button
              onClick={() => { setShowForm(false); setSubmitted(false) }}
              className="absolute top-5 right-5 text-gray-600 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">문의가 접수되었습니다!</h3>
                <p className="text-gray-500 text-sm">빠른 시일 내에 연락드리겠습니다.</p>
                <button
                  onClick={() => { setShowForm(false); setSubmitted(false) }}
                  className="mt-6 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm transition-all"
                >
                  닫기
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-1">브랜드 광고 문의</h3>
                <p className="text-gray-500 text-sm mb-6">문의 내용을 남겨주시면 빠르게 연락드리겠습니다.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {[
                    { key: 'company', label: '회사명', placeholder: '회사명을 입력해주세요' },
                    { key: 'name', label: '담당자 이름', placeholder: '이름을 입력해주세요' },
                    { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
                    { key: 'email', label: '이메일', placeholder: 'example@company.com' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-gray-500 mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        required
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors text-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">문의 내용</label>
                    <textarea
                      placeholder="광고 목적, 제품/서비스, 예산 등을 자유롭게 적어주세요"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-700 focus:outline-none focus:border-violet-500/50 transition-colors resize-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 hover:opacity-90 transition-opacity"
                  >
                    문의 보내기
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}