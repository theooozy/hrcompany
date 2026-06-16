'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PortalLoginPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, name, email, brand, status')
        .eq('name', name.trim())
        .eq('email', email.trim())
        .limit(1);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) {
        setError('문의 내역을 찾을 수 없습니다. 이름과 이메일을 다시 확인해주세요.');
        setLoading(false);
        return;
      }
      if (data[0].status !== 'approved') {
        if (data[0].status === 'rejected') {
          setError('문의가 거절되었습니다. 자세한 사항은 관리자에게 문의해주세요.');
        } else {
          setError('관리자 승인 대기 중입니다. 승인 후 이용하실 수 있습니다.');
        }
        setLoading(false);
        return;
      }

      const inquiry = data[0];
      localStorage.setItem('portal_session', JSON.stringify({ name: inquiry.name, email: inquiry.email, brand: inquiry.brand || '' }));
      router.push('/portal');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md mb-3">
            <span className="text-white font-bold">HR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">고객 로그인</h1>
          <p className="text-sm text-slate-500">승인된 문의 내역으로 로그인하세요.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="문의 시 입력한 이름"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@company.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-slate-700">← 홈으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
