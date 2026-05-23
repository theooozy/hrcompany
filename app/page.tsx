'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

export default function Home() {
      const router = useRouter()
      const [showForm, setShowForm] = useState(false)
      const [formData, setFormData] = useState({ company: '', name: '', phone: '', email: '', message: '' })
      const [submitted, setSubmitted] = useState(false)
      const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          setSubmitting(true)
          await supabase.from('inquiries').insert([{
                    company: formData.company,
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    message: formData.message,
          }])
          setSubmitted(true)
          setSubmitting(false)
  }

  const stats = [
      { num: '49', label: '자체 채널' },
      { num: '500만', label: '구독자' },
      { num: '15억+', label: '월 조회수' },
        ]

  const features = [
      { icon: '🎯', title: '영업 없이 콘텐츠에 집중', desc: '불필요한 영업 과정 없이 콘텐츠 품질에만 집중합니다.' },
      { icon: '🏠', title: '외주 없이 인하우스 제작', desc: '모든 제작을 내부 팀이 직접 진행합니다.' },
      { icon: '✅', title: '전 과정 직접 실행', desc: '기획부터 제작, 집행까지 모든 과정을 직접 관리합니다.' },
        ]

  const formFields = [
      { label: '회사명', key: 'company', placeholder: '회사 또는 브랜드명', type: 'text' },
      { label: '담당자 이름', key: 'name', placeholder: '홍길동', type: 'text' },
      { label: '연락처', key: 'phone', placeholder: '010-0000-0000', type: 'tel' },
      { label: '이메일', key: 'email', placeholder: 'contact@example.com', type: 'email' },
        ]

  return (
          <main className="min-h-screen bg-[#111118] text-white overflow-x-hidden">
                <nav className="fixed top-0 w-full z-50 bg-[#111118]/90 backdrop-blur-md border-b border-white/[0.08]">
                        <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
                                  <span className="text-2xl font-black tracking-[0.2em] text-white">HR</span>span>
                                  <div className="flex items-center gap-3">
                                              <button onClick={() => setShowForm(true)}
                                                                className="text-sm px-6 py-2.5 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all duration-300">
                                                            광고 문의
                                              </button>button>
                                              <button onClick={() => router.push('/admin/login')}
                                                                className="text-sm px-5 py-2.5 border border-white/20 rounded-full text-gray-400 hover:text-white hover:border-white/40 transition-all duration-300">
                                                            관리자
                                              </button>button>
                                  </div>div>
                        </div>div>
                </nav>nav>
          
                <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
                        <div className="absolute inset-0 bg-[#111118]" />
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-[120px]" />
                        <div className="relative z-10 max-w-4xl mx-auto">
                                  <div className="flex justify-center mb-10">
                                              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 bg-white/[0.04]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                            <span className="text-xs text-gray-400 tracking-[0.2em] font-medium">DIGITAL CONTENTS MARKETING</span>span>
                                              </div>div>
                                  </div>div>
                                  <div className="mb-10">
                                              <p className="text-lg text-gray-500 mb-3 font-medium">우리는</p>p>
                                              <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight mb-3">
                                                            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">광고대행사가</span>span>
                                              </h1>h1>
                                              <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight text-white">아닙니다.</h1>h1>
                                  </div>div>
                                  <div className="w-16 h-px bg-gradient-to-r from-blue-400 to-purple-400 mb-10" />
                                  <div className="max-w-2xl space-y-4 mb-14">
                                              <p className="text-xl text-gray-300 leading-relaxed">
                                                            <span className="text-white font-semibold">49개의 자체 숏폼 채널</span>span>,{' '}
                                                            <span className="text-white font-semibold">500만 구독자</span>span>,{' '}
                                                            <span className="text-white font-semibold">월 15억 조회수</span>span>
                                              </p>p>
                                              <p className="text-xl text-gray-300 leading-relaxed">
                                                            자체 트래픽을 바탕으로 기획부터 제작, 집행까지<br />모든 광고 과정을 직접 실행합니다.
                                              </p>p>
                                              <p className="text-lg text-gray-500 leading-relaxed">
                                                            브랜드가 유저에게 자연스럽게 스며드는 콘텐츠,<br />
                                                            콘텐츠로 브랜드 가치를 극대화하는{' '}
                                                            <span className="text-gray-300 font-medium">디지털 콘텐츠 마케팅 파트너</span>span>입니다.
                                              </p>p>
                                  </div>div>
                                  <div className="flex flex-wrap items-center gap-6 mb-10">
                                      {stats.map((stat, i) => (
                            <div key={i} className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-white">{stat.num}</span>span>
                                            <span className="text-sm text-gray-500">{stat.label}</span>span>
                                {i < 2 && <span className="text-gray-700 ml-4">/</span>span>}
                            </div>div>
                          ))}
                                  </div>div>
                                  <button onClick={() => setShowForm(true)}
                                                  className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300">
                                              브랜드 광고 문의하기
                                              <span className="group-hover:translate-x-1 transition-transform duration-300">-&gt;</span>span>
                                  </button>button>
                        </div>div>
                </section>section>
          
                <section className="py-32 px-6 relative">
                        <div className="max-w-5xl mx-auto">
                                  <div className="text-center mb-16">
                                              <p className="text-xs tracking-[0.3em] text-gray-500 mb-4 font-medium">WHY HR</p>p>
                                              <h2 className="text-4xl md:text-5xl font-black text-white">우리가 다른 이유</h2>h2>
                                  </div>div>
                                  <div className="grid md:grid-cols-3 gap-6">
                                      {features.map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300">
                                            <div className="text-3xl mb-4">{item.icon}</div>div>
                                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>p>
                            </div>div>
                          ))}
                                  </div>div>
                        </div>div>
                </section>section>
          
              {showForm && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative">
                                            <button onClick={() => { setShowForm(false); setSubmitted(false) }}
                                                              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all">x</button>button>
                                    {submitted ? (
                                        <div className="text-center py-8">
                                                        <div className="text-5xl mb-4">🎉</div>div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">문의가 접수되었습니다!</h3>h3>
                                                        <p className="text-gray-500 text-sm">빠른 시일 내에 연락드리겠습니다.</p>p>
                                                        <button onClick={() => { setShowForm(false); setSubmitted(false) }}
                                                                              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold text-sm">
                                                                          닫기
                                                        </button>button>
                                        </div>div>
                                      ) : (
                                        <div>
                                                        <h2 className="text-xl font-bold text-gray-900 mb-1">브랜드 광고 문의</h2>h2>
                                                        <p className="text-gray-400 text-sm mb-6">담당자가 확인 후 빠르게 연락드립니다</p>p>
                                                        <form onSubmit={handleSubmit} className="space-y-4">
                                                            {formFields.map(field => (
                                                                <div key={field.key}>
                                                                                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>label>
                                                                                      <input type={field.type} placeholder={field.placeholder} required
                                                                                                                  value={formData[field.key as keyof typeof formData]}
                                                                                                                  onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                                                                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all" />
                                                                </div>div>
                                                              ))}
                                                                          <div>
                                                                                              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                                                                                    문의 내용 <span className="text-gray-400 font-normal">(선택)</span>span>
                                                                                                  </label>label>
                                                                                              <textarea placeholder="광고 목적, 예산, 일정 등을 간략히 적어주세요" rows={3}
                                                                                                                        value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                                                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all resize-none" />
                                                                          </div>div>
                                                                          <button type="submit" disabled={submitting}
                                                                                                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:scale-[1.01] transition-all text-sm disabled:opacity-60">
                                                                              {submitting ? '전송 중...' : '문의 보내기'}
                                                                          </button>button>
                                                        </form>form>
                                        </div>div>
                                            )}
                                </div>div>
                      </div>div>
                )}
          </main>main>
        )
}</main>
