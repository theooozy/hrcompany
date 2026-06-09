'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalCompletePage() {
  const router = useRouter();

  // Prevent going back to the form to avoid duplicate submission
  useEffect(() => {
    window.history.replaceState(null, '', '/portal/complete');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">문의가 정상으로 접수되었습니다</h1>
        <p className="text-slate-500 mb-8">빠른 시일 내에 담당자가 연락드리겠습니다.</p>
        <Link
          href="/portal"
          replace
          className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all text-center"
        >
          새 문의 작성
        </Link>
      </div>
    </div>
  );
}
