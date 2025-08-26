'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Calendar, CheckCircle, XCircle, FileText, User } from 'lucide-react'
import Pagination from '@/components/Pagination'

interface RealtorCompany {
  id: string
  name: string
  registration_number: string
  representative_name: string
  phone: string
  address: string
  business_license_url?: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verified_at?: string
  created_at: string
  updated_at: string
  realtor_count?: number
}

const ITEMS_PER_PAGE = 10

export default function CompanyVerificationPage() {
  const [companies, setCompanies] = useState<RealtorCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [rejectionReason, setRejectionReason] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [actionCompanyId, setActionCompanyId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setCurrentPage(1)
    loadCompanies()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    loadCompanies()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      
      let query = supabase
        .from('realtor_companies')
        .select(`
          *,
          users:users(count)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filter !== 'ALL') {
        query = query.eq('verification_status', filter)
      }

      const { data, error, count } = await query

      if (error) throw error

      const companiesWithCount = (data || []).map(company => ({
        ...company,
        realtor_count: company.users?.length || 0
      }))

      setCompanies(companiesWithCount)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('realtor_companies')
        .update({
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_verified: true // Also update the legacy is_verified field
        })
        .eq('id', companyId)

      if (error) {
        console.error('Approval error details:', error)
        alert(`승인 실패: ${error.message}`)
        throw error
      }
      
      alert('회사가 성공적으로 승인되었습니다.')
      await loadCompanies()
    } catch (error) {
      console.error('Error approving company:', error)
    }
  }

  const handleReject = async () => {
    if (!actionCompanyId || !rejectionReason) return

    try {
      const { error } = await supabase
        .from('realtor_companies')
        .update({
          verification_status: 'REJECTED',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString(),
          is_verified: false // Also update the legacy is_verified field
        })
        .eq('id', actionCompanyId)

      if (error) {
        console.error('Rejection error details:', error)
        alert(`거절 실패: ${error.message}`)
        throw error
      }
      
      alert('회사가 거절되었습니다.')
      setShowReasonModal(false)
      setRejectionReason('')
      setActionCompanyId(null)
      await loadCompanies()
    } catch (error) {
      console.error('Error rejecting company:', error)
    }
  }

  const openRejectModal = (companyId: string) => {
    setActionCompanyId(companyId)
    setShowReasonModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">부동산 회사 검증</h1>
          <p className="text-gray-600 mt-1">부동산 회사 정보를 검토하고 승인 상태를 관리합니다</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === status
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {status === 'ALL' ? '전체' :
             status === 'PENDING' ? '대기중' :
             status === 'APPROVED' ? '승인됨' : '거절됨'}
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {filter === status ? totalCount : companies.filter(c => status === 'ALL' || c.verification_status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {company.name}
                  </CardTitle>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                    <span>사업자등록번호: {company.registration_number}</span>
                    <span>대표자: {company.representative_name}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  company.verification_status === 'APPROVED' 
                    ? 'bg-green-100 text-green-800'
                    : company.verification_status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {company.verification_status === 'APPROVED' ? '승인됨' :
                   company.verification_status === 'PENDING' ? '검토 대기' : '거절됨'}
                </span>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">주소</p>
                  <p className="font-medium">{company.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">소속 중개사</p>
                  <p className="font-medium flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {company.realtor_count}명
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">등록일</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {company.business_license_url && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">사업자등록증</p>
                  <a
                    href={company.business_license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    사업자등록증 보기
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {company.verification_status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleApprove(company.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      승인
                    </button>
                    <button
                      onClick={() => openRejectModal(company.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      거절
                    </button>
                  </>
                )}
                {company.verification_status === 'APPROVED' && (
                  <button
                    onClick={() => openRejectModal(company.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    승인 취소
                  </button>
                )}
                {company.verification_status === 'REJECTED' && (
                  <button
                    onClick={() => handleApprove(company.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    재승인
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'ALL' ? '등록된 회사가 없습니다' :
             filter === 'PENDING' ? '검토 대기 중인 회사가 없습니다' :
             filter === 'APPROVED' ? '승인된 회사가 없습니다' :
             '거절된 회사가 없습니다'}
          </p>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">거절 사유 입력</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="거절 사유를 입력해주세요..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(false)
                  setRejectionReason('')
                  setActionCompanyId(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}