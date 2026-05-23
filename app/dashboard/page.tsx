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
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #060B18 0%, #0A1628 50%, #080E1F 100%)' }}>

      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/[0.06]" style={{ background: 'rgba(6,11,24,0.85)' }}>
        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
          <span className="text-2xl font-black tracking-[0.2em] text-white">HR</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowForm(true)} className="text-sm px-6 py-2.5 bg-white text-[#060B18] rounded-full font-bold hover:bg-blue-50 transition-all duration-300">
              광고 문의
            </button>
            <button onClick={() => router.push('/admin/login')} className="text-sm px-5 py-2.5 border border-white/20 rounded-full text-gray-400 hover:text-white hover:border-white/40 transition-all duration-300">
              관리자
            </button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] opacity-30" style={{ background: 'radial-gradient(circle, #1E40AF 0%, #3B1FA8 50%, transparent 70%)' }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-[80px] opacity-20" style={{ background: '#60A5FA' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-blue-400/30 bg-blue-500/10 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs text-blue-300 tracking-[0.2em] font-medium">DIGITAL CONTENTS MARKETING</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6">
            <span className="text-white/60">우리는</span><br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>광고대행사가</span><br />
            <span className="text-white">아닙니다.</span>
          </h1>

          <div className="w-20 h-px mx-auto mb-8" style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA)' }} />

          <div className="max-w-2xl mx-auto space-y-4 mb-12">
            <p className="text-lg text-blue-100/80 leading-relaxed">
              <span className="text-white font-semibold">49개의 자체 숏폼 채널</span>{' '}·{' '}
              <span className="text-white font-semibold">500만 구독자</span>{' '}·{' '}
              <span className="text-white font-semibold">월 15억 조회수</span>
            </p>
            <p className="text-lg text-blue-100/60 leading-relaxed">
              자체 트래픽을 바탕으로 기획부터 제작, 집행까지<br />모든 광고 과정을 직접 실행합니다.
            </p>
            <p className="text-base text-blue-200/40 leading-relaxed">
              브랜드가 유저에게 자연스럽게 스며드는 콘텐츠,<br />콘텐츠로 브랜드 가치를 극대화하는{' '}
              <span className="text-blue-200/70 font-medium">디지털 콘텐츠 마케팅 파트너</span>입니다.
            </p>
          </div>

          <div className="flex justify-center gap-10 mb-12">
            {[{ num: '49', label: '자체 채널' }, { num: '500만', label: '구독자' }, { num: '15억+', label: '월 조회수' }].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-white">{stat.num}</div>
                <div className="text-xs text-blue-300/50 mt-1 tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setShowForm(true)} className="group inline-flex items-center gap-3 px-9 py-4 rounded-full text-base font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #DB2777)', boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
            브랜드 광고 문의하기
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </button>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="w-px h-10 mx-auto" style={{ background: 'linear-gradient(to bottom, rgba(96,165,250,0.5), transparent)' }} />
        </div>
      </section>

      <section className="py-32 px-6" style={{ background: 'linear-gradient(180deg, #060B18, #070D1C)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-blue-400 font-semibold">WHY HR</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 text-white">핵심 차별점</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: '영업 없이\n콘텐츠에 집중', desc: '오직 콘텐츠 본질과 광고 성과에만 집중합니다. 불필요한 영업 없이 결과로 증명합니다.', gradient: 'linear-gradient(135deg, rgba(30,58,138,0.2), rgba(30,64,175,0.1))', border: 'rgba(59,130,246,0.2)', numColor: 'linear-gradient(90deg, #60A5FA, #34D399)' },
              { num: '02', title: '외주 없이\n인하우스로 제작', desc: '기획, 촬영, 편집까지 내부 팀이 직접 진행합니다. 일관된 퀄리티와 빠른 실행력을 보장합니다.', gradient: 'linear-gradient(135deg, rgba(46,16,101,0.3), rgba(30,27,75,0.1))', border: 'rgba(139,92,246,0.2)', numColor: 'linear-gradient(90deg, #A78BFA, #F472B6)' },
              { num: '03', title: '직접 제작으로\n품질 보장', desc: '자체 채널 운영 노하우가 그대로 적용됩니다. 모든 과정을 직접 제작하여 최상의 품질을 보장합니다.', gradient: 'linear-gradient(135deg, rgba(28,25,23,0.3), rgba(30,58,47,0.1))', border: 'rgba(52,211,153,0.2)', numColor: 'linear-gradient(90deg, #34D399, #60A5FA)' },
            ].map((item, i) => (
              <div key={i} className="p-8 rounded-2xl hover:scale-[1.02] transition-all duration-300" style={{ background: item.gradient, border: `1px solid ${item.border}` }}>
                <div className="text-5xl font-black mb-6" style={{ background: item.numColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{item.num}</div>
                <h3 className="text-xl font-bold text-white mb-3 whitespace-pre-line leading-snug">{item.title}</h3>
                <p className="text-blue-200/40 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 text-center relative overflow-hidden" style={{ background: '#060B18' }}>
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at center, #1E40AF 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            지금 바로<br />
            <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>브랜드 성장을 시작하세요</span>
          </h2>
          <p className="text-blue-200/40 mb-10">자체 트래픽과 검증된 콘텐츠 제작 역량으로 브랜드의 가치를 높여드립니다.</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-3 px-9 py-4 rounded-full font-bold text-white hover:scale-105 transition-all duration-300" style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #DB2777)', boxShadow: '0 0 40px rgba(124,58,237,0.3)' }}>
            브랜드 광고 문의하기 →
          </button>
        </div>
      </section>

      <footer className="py-8 px-6 text-center text-blue-900/60 text-sm border-t border-white/[0.04]" style={{ background: '#060B18' }}>
        © 2026 HR Company. All rights reserved.
      </footer>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(6,11,24,0.85)' }}>
          <div className="relative w-full max-w-lg rounded-2xl p-8 shadow-2xl border" style={{ background: '#0A1628', borderColor: 'rgba(59,130,246,0.2)' }}>
            <button onClick={() => { setShowForm(false); setSubmitted(false) }} className="absolute top-5 right-5 text-blue-300/40 hover:text-white transition-colors text-xl">✕</button>
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <span className="text-emerald-400 text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">문의가 접수되었습니다!</h3>
                <p className="text-blue-200/50 text-sm">빠른 시일 내에 연락드리겠습니다.</p>
                <button onClick={() => { setShowForm(false); setSubmitted(false) }} className="mt-6 px-6 py-2.5 rounded-full text-white text-sm border border-white/10 hover:border-white/20 transition-all">닫기</button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-1">브랜드 광고 문의</h3>
                <p className="text-blue-200/50 text-sm mb-6">문의 내용을 남겨주시면 빠르게 연락드리겠습니다.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {[
                    { key: 'company', label: '회사명', placeholder: '회사명을 입력해주세요' },
                    { key: 'name', label: '담당자 이름', placeholder: '이름을 입력해주세요' },
                    { key: 'phone', label: '연락처', placeholder: '010-0000-0000' },
                    { key: 'email', label: '이메일', placeholder: 'example@company.com' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-blue-300/50 mb-1.5">{field.label}</label>
                      <input type="text" placeholder={field.placeholder} required value={formData[field.key as keyof typeof formData]} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-colors" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs text-blue-300/50 mb-1.5">문의 내용</label>
                    <textarea placeholder="광고 목적, 제품/서비스, 예산 등을 자유롭게 적어주세요" rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-colors resize-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }} />
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #DB2777)' }}>문의 보내기</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}