export default function RealtorDashboard() {
  return (
    <div className="px-4 sm:px-0">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Realtor Dashboard</h2>
          
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">전체 리드</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">활성 매물</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
              </div>
            </div>
            
            <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">이번 달 수수료</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">$0</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}