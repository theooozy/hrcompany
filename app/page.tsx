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
    <main className="min-h-screen bg-[#0f0f12] text-white overflow-x-hidden">

      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f12]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-black tracking-widest text-white">HR</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="text-sm px-5 py-2 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-300"
            >
              광고 문의
            </button>
            <button
              onClick={() => router.push('/admin/login')}
              className="text-sm px-5 py-2 border border-white/10 rounded-full text-gray-500 hover:text-white hover:border-white/30 transition-all duration-300"
            >
              관리자
            </button>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f12] via-[#13131a] to-[#0f0f12]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-400 tracking-widest">DIGITAL CONTENTS MARKETING</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            <span className="text-white">우리는</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              광고대행사가
            </span>
            <br />
            <span className="text-white">아닙니다.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-4">
            우리는 <span className="text-gray-200 font-semibold">49개의 자체 숏폼 채널</span>,{' '}
            <span className="text-gray-200 font-semibold">500만 구독자</span>,{' '}
            <span className="text-gray-200 font-semibold">월 15억 조회수</span> 규모의
            자체 트래픽을 바탕으로
          </p>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto mb-4">
            기획부터 제작, 집행까지 모든 광고 과정을 직접 실행합니다.
          </p>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-12">
            브랜드가 유저에게 자연스럽게 스며드는 콘텐츠를 만들고,
            콘텐츠를 통해 브랜드 가치를 극대화하는
            <br />
            <span className="text-white font-semibold">디지털 콘텐츠 마케팅 파트너</span>입니다.
          </p>

          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            {[
              { num: '49', label: '자체 숏폼 채널' },
              { num: '500만', label: '총 구독자' },
              { num: '15억+', label: '월 조회수' },
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-sm">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.num}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-white">브랜드 광고 문의하기</span>
            <span className="relative text-white text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-600 tracking-widest">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
        </div>
      </section>

      {/* 핵심 차별점 섹션 */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f12] via-[#14141e] to-[#0f0f12]" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm tracking-widest text-blue-400 font-semibold">WHY HR</span>
            <h2 className="text-4xl md:text-5xl font-black mt-4 text-white">핵심 차별점</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: '영업 없이\n콘텐츠에 집중',
                desc: '오직 콘텐츠 본질과 광고 성과에만 집중합니다. 불필요한 영업 프로세스 없이 결과로 증명합니다.',
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-500/8 to-cyan-500/8',
                border: 'border-blue-500/25',
              },
              {
                num: '02',
                title: '외주 없이\n인하우스로 제작',
                desc: '기획, 촬영, 편집까지 모든 과정을 내부 팀이 직접 진행합니다. 일관된 퀄리티와 빠른 실행력을 보장합니다.',
                gradient: 'from-purple-500 to-pink-500',
                bg: 'from-purple-500/8 to-pink-500/8',
                border: 'border-purple-500/25',
              },
              {
                num: '03',
                title: '직접 제작으로\n품질 보장',
                desc: '모든 과정을 직접 제작하여 최상의 품질을 보장합니다. 자체 채널 운영 노하우가 광고에 그대로 적용됩니다.',
                gradient: 'from-orange-500 to-red-500',
                bg: 'from-orange-500/8 to-red-500/8',
                border: 'border-orange-500/25',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${item.bg} border ${item.border} backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}
              >
                <div className={`text-6xl font-black bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-6`}>
                  {item.num}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 whitespace-pre-line leading-tight">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                <div className={`absolute bottom-0 left-0 w-full h-1 rounded-b-3xl bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            지금 바로<br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              브랜드 성장을 시작하세요
            </span>
          </h2>
          <p className="text-gray-500 mb-10 text-lg">
            자체 트래픽과 검증된 콘텐츠 제작 역량으로 브랜드의 가치를 높여드립니다.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-full text-lg font-bold overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
            <span className="relative text-white">브랜드 광고 문의하기</span>
            <span className="relative text-white text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-gray-600 text-sm">
        © 2026 HR Company. All rights reserved.
      </footer>

      {/* 문의 모달 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#13131a] border border-white/15 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => { setShowForm(false); setSubmitted(false) }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-white mb-2">문의가 접수되었습니다!</h3>
                <p className="text-gray-400">빠른 시일 내에 연락드리겠습니다.</p>
                <button
                  onClick={() => { setShowForm(false); setSubmitted(false) }}
                  className="mt-6 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                  닫기
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white mb-2">브랜드 광고 문의</h3>
                <p className="text-gray-500 mb-6 text-sm">문의 내용을 남겨주시면 빠르게 연락드리겠습니다.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { key: 'company', label: '회사명', placeholder: '회사명을 입력해주세요' },
                    { key: 'name', label: '담당자 이름', placeholder: '이름을 입력해주세요' },
                    { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
                    { key: 'email', label: '이메일', placeholder: 'example@company.com' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm text-gray-500 mb-1">{field.label}</label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        required
                        value={formData[field.key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">문의 내용</label>
                    <textarea
                      placeholder="광고 목적, 제품/서비스, 예산 등을 자유롭게 적어주세요"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-700 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
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