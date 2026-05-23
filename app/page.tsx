import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">브랜드 요청 시스템</h1>
      <div className="flex gap-4">
        <Link href="/login">
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            사용자 로그인
          </button>
        </Link>
        <Link href="/admin/login">
          <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800">
            관리자 로그인
          </button>
        </Link>
      </div>
    </main>
  )
}