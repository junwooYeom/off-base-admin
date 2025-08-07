'use client'

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">매물 성과 분석</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">총 조회수</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
            <p className="mt-2 text-sm text-gray-500">지난 30일</p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">평균 클릭률</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0%</dd>
            <p className="mt-2 text-sm text-gray-500">조회 대비 클릭</p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">문의 전환율</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0%</dd>
            <p className="mt-2 text-sm text-gray-500">클릭 대비 문의</p>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">평균 등록일수</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0일</dd>
            <p className="mt-2 text-sm text-gray-500">매물 평균 등록 기간</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">매물별 성과</h2>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">분석할 매물이 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">매물을 등록하면 성과 분석을 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">인기 매물 Top 5</h2>
            <p className="text-sm text-gray-500">데이터가 없습니다.</p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">지역별 성과</h2>
            <p className="text-sm text-gray-500">데이터가 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}