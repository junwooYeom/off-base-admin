import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import DashboardStats from './DashboardStats'

export default async function AdminDashboard() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">시스템 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      {/* Verification Center - Priority Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-white">🔍 인증 센터</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/verification/realtors">
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-black">공인중개사 인증</h3>
                  <p className="text-sm text-black opacity-90 mt-1">서류 검토 및 계정 승인</p>
                </div>
                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  대기중
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/verification/companies">
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-black">부동산 회사 인증</h3>
                  <p className="text-sm text-black opacity-90 mt-1">회사 등록 및 검증</p>
                </div>
                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  대기중
                </div>
              </div>
            </div>
          </Link>
          
          <Link href="/admin/verification/properties">
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-4 hover:bg-opacity-30 transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-black">매물 인증</h3>
                  <p className="text-sm text-black opacity-90 mt-1">매물 서류 검토 및 게시 승인</p>
                </div>
                <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  대기중
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/users?filter=PENDING">
            <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              사용자 관리
            </button>
          </Link>
          <Link href="/admin/properties">
            <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              매물 관리
            </button>
          </Link>
          <Link href="/admin/verification/realtors">
            <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              공인중개사 인증
            </button>
          </Link>
          <Link href="/admin/verification/properties">
            <button className="w-full px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              매물 인증
            </button>
          </Link>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>추가 지표</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">이번 달 신규 매물</span>
                </div>
                <span className="text-sm font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">대기중인 문서</span>
                </div>
                <span className="text-sm font-semibold">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">데이터베이스</span>
                <span className="text-sm font-semibold text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">스토리지</span>
                <span className="text-sm font-semibold text-green-600">정상</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API 상태</span>
                <span className="text-sm font-semibold text-green-600">정상</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>사용자 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">데이터 로딩중...</p>
        </CardContent>
      </Card>
    </div>
  )
}