'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Calendar, CheckCircle, XCircle, FileText, User, UserPlus, AlertCircle } from 'lucide-react'
import Pagination from '@/components/Pagination'

interface RealtorCompany {
  id: string
  name?: string
  company_name?: string
  registration_number?: string
  business_registration_number?: string
  representative_name?: string
  ceo_name?: string
  phone?: string
  phone_number?: string
  address: string
  business_license_url?: string
  business_license?: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verified_at?: string
  created_at: string
  updated_at: string
  realtor_count?: number
  from_role_request?: boolean // Flag to identify if this is from role_upgrade_requests
  role_request_id?: string // Associated role upgrade request ID
  user_name?: string // User requesting the upgrade
  user_email?: string
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
      
      // First, get ALL companies to check for duplicates (not paginated)
      const { data: allExistingCompanies } = await supabase
        .from('realtor_companies')
        .select('business_registration_number')
      
      const existingRegistrationNumbers = new Set(
        allExistingCompanies?.map(c => c.business_registration_number) || []
      )
      
      // Load existing companies from realtor_companies table (paginated)
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

      const { data: existingCompanies, error: companiesError } = await query

      if (companiesError) {
        console.warn('Error loading companies:', companiesError)
      }

      // Load companies from role_upgrade_requests
      let roleRequestsQuery = supabase
        .from('role_upgrade_requests')
        .select(`
          *,
          user:users!role_upgrade_requests_user_id_fkey(
            id,
            full_name,
            email
          )
        `)
        .not('company_registration_number', 'is', null)
        .eq('status', 'pending')

      const { data: roleRequests, error: roleRequestsError } = await roleRequestsQuery

      if (roleRequestsError) {
        console.warn('Error loading role requests:', roleRequestsError)
      }

      // Combine and format the data
      const allCompanies: RealtorCompany[] = []

      // Add existing companies
      if (existingCompanies) {
        existingCompanies.forEach(company => {
          allCompanies.push({
            ...company,
            realtor_count: company.users?.length || 0,
            from_role_request: false
          })
        })
      }

      // Add companies from role upgrade requests (only if not already in realtor_companies)
      if (roleRequests && (filter === 'PENDING' || filter === 'ALL')) {
        roleRequests.forEach(request => {
          // Check if this company already exists in realtor_companies
          const companyAlreadyExists = existingRegistrationNumbers.has(request.company_registration_number)
          
          if (!companyAlreadyExists && request.company_name && request.company_registration_number) {
            allCompanies.push({
              id: `role_request_${request.id}`,
              company_name: request.company_name,
              business_registration_number: request.company_registration_number,
              phone_number: request.company_phone || '',
              address: request.company_address || '',
              business_license: request.business_license_url,
              verification_status: 'PENDING',
              created_at: request.created_at,
              updated_at: request.updated_at,
              from_role_request: true,
              role_request_id: request.id,
              user_name: request.user?.full_name || request.user?.email?.split('@')[0] || '이름 없음',
              user_email: request.user?.email,
              realtor_count: 0
            })
          }
        })
      }

      // Sort by created_at
      allCompanies.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      // Apply pagination
      const paginatedCompanies = allCompanies.slice(from, to + 1)

      setCompanies(paginatedCompanies)
      setTotalCount(allCompanies.length)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (companyId: string) => {
    try {
      // Check if this is from a role upgrade request
      if (companyId.startsWith('role_request_')) {
        const roleRequestId = companyId.replace('role_request_', '')
        const company = companies.find(c => c.id === companyId)
        
        if (!company) {
          alert('회사 정보를 찾을 수 없습니다.')
          return
        }

        // First, check if company already exists
        const { data: existingCompany } = await supabase
          .from('realtor_companies')
          .select('id')
          .eq('business_registration_number', company.business_registration_number)
          .single()

        let newCompany
        
        if (existingCompany) {
          // Update existing company to APPROVED
          const { data: updatedCompany, error: updateError } = await supabase
            .from('realtor_companies')
            .update({
              company_name: company.company_name,
              phone_number: company.phone_number,
              address: company.address,
              business_license: company.business_license,
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString(),
              is_verified: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCompany.id)
            .select()
            .single()

          if (updateError) {
            console.error('Company update error:', updateError)
            alert(`회사 업데이트 실패: ${updateError.message}`)
            return
          }
          
          newCompany = updatedCompany
        } else {
          // Create new company
          const { data: createdCompany, error: createError } = await supabase
            .from('realtor_companies')
            .insert({
              company_name: company.company_name,
              business_registration_number: company.business_registration_number,
              phone_number: company.phone_number,
              address: company.address,
              business_license: company.business_license,
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString(),
              is_verified: true
            })
            .select()
            .single()

          if (createError) {
            console.error('Company creation error:', createError)
            alert(`회사 생성 실패: ${createError.message}`)
            return
          }
          
          newCompany = createdCompany
        }

        // Update the role upgrade request to link to the new company
        const { error: updateError } = await supabase
          .from('role_upgrade_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', roleRequestId)

        if (updateError) {
          console.error('Role request update error:', updateError)
        }

        // Update the user to REALTOR and link to the company
        const { data: roleRequestData } = await supabase
          .from('role_upgrade_requests')
          .select('user_id, realtor_registration_number, realtor_license_url, documents')
          .eq('id', roleRequestId)
          .single()

        if (roleRequestData) {
          // Update user role and link to company
          await supabase
            .from('users')
            .update({
              user_type: 'REALTOR',
              realtor_company_id: newCompany.id,
              realtor_registration_number: roleRequestData.realtor_registration_number,
              realtor_license_url: roleRequestData.realtor_license_url,
              verified_at: new Date().toISOString()
            })
            .eq('id', roleRequestData.user_id)
          
          // Approve all pending user verification documents
          await supabase
            .from('user_verification_documents')
            .update({
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString()
            })
            .eq('user_id', roleRequestData.user_id)
            .eq('verification_status', 'PENDING')
        }

        // Update the role upgrade request status to approved
        await supabase
          .from('role_upgrade_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', roleRequestId)

        alert('회사와 역할 변경이 성공적으로 승인되었습니다.')
      } else {
        // Handle existing company approval
        const { error } = await supabase
          .from('realtor_companies')
          .update({
            verification_status: 'APPROVED',
            verified_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_verified: true
          })
          .eq('id', companyId)

        if (error) {
          console.error('Approval error details:', error)
          alert(`승인 실패: ${error.message}`)
          throw error
        }
        
        alert('회사가 성공적으로 승인되었습니다.')
      }
      
      await loadCompanies()
    } catch (error) {
      console.error('Error approving company:', error)
    }
  }

  const handleReject = async () => {
    if (!actionCompanyId || !rejectionReason) return

    try {
      // Check if this is from a role upgrade request
      if (actionCompanyId.startsWith('role_request_')) {
        const roleRequestId = actionCompanyId.replace('role_request_', '')
        
        // Update the role upgrade request
        const { error } = await supabase
          .from('role_upgrade_requests')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString()
          })
          .eq('id', roleRequestId)

        if (error) {
          console.error('Role request rejection error:', error)
          alert(`거절 실패: ${error.message}`)
          throw error
        }
        
        // Update the role upgrade request status to rejected
        await supabase
          .from('role_upgrade_requests')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', roleRequestId)
        
        alert('역할 변경 요청이 거절되었습니다.')
      } else {
        // Handle existing company rejection
        const { error } = await supabase
          .from('realtor_companies')
          .update({
            verification_status: 'REJECTED',
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString(),
            is_verified: false
          })
          .eq('id', actionCompanyId)

        if (error) {
          console.error('Rejection error details:', error)
          alert(`거절 실패: ${error.message}`)
          throw error
        }
        
        alert('회사가 거절되었습니다.')
      }
      
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
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    )
  }

  const pendingCount = companies.filter(c => c.verification_status === 'PENDING').length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">회사 인증 관리</CardTitle>
              <CardDescription className="mt-2">
                중개 회사 정보를 검토하고 승인/거절합니다.
                <br />
                <span className="text-blue-600 font-medium">
                  역할 변경 요청에서 제출된 회사 정보도 함께 표시됩니다.
                </span>
              </CardDescription>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {pendingCount}개 대기중
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {status === 'PENDING' ? '대기중' :
                 status === 'ALL' ? '전체' :
                 status === 'APPROVED' ? '승인됨' : '거절됨'}
              </button>
            ))}
          </div>

          {companies.length === 0 ? (
            <p className="text-gray-500 text-center py-8">검토할 회사가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {companies.map((company) => (
                <Card key={company.id} className={company.from_role_request ? 'border-blue-300 bg-blue-50/50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-gray-500" />
                          <h3 className="font-semibold text-lg">
                            {company.company_name || company.name || '회사명 미등록'}
                          </h3>
                          {company.from_role_request && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              역할 변경 요청
                            </span>
                          )}
                        </div>

                        {company.from_role_request && company.user_name && (
                          <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded">
                            <UserPlus className="h-4 w-4" />
                            <span>
                              요청자: <strong>{company.user_name}</strong> ({company.user_email})
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">사업자등록번호:</span>
                            <p className="font-medium">
                              {company.business_registration_number || company.registration_number || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">대표자:</span>
                            <p className="font-medium">
                              {company.ceo_name || company.representative_name || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">전화번호:</span>
                            <p className="font-medium">
                              {company.phone_number || company.phone || '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">주소:</span>
                            <p className="font-medium">{company.address || '-'}</p>
                          </div>
                          {!company.from_role_request && (
                            <div>
                              <span className="text-gray-500">소속 중개사:</span>
                              <p className="font-medium">
                                <User className="inline h-4 w-4 mr-1" />
                                {company.realtor_count || 0}명
                              </p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">등록일:</span>
                            <p className="font-medium">
                              <Calendar className="inline h-4 w-4 mr-1" />
                              {new Date(company.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>

                        {company.business_license && company.business_license.startsWith('https://') && (
                          <div className="pt-2">
                            <a
                              href={company.business_license}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                            >
                              <FileText className="h-4 w-4" />
                              <span>사업자등록증 보기</span>
                            </a>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2">
                          {company.verification_status === 'APPROVED' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              승인됨
                            </span>
                          ) : company.verification_status === 'REJECTED' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              <XCircle className="h-4 w-4 mr-1" />
                              거절됨
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              대기중
                            </span>
                          )}
                          {company.verified_at && (
                            <span className="text-sm text-gray-500">
                              {new Date(company.verified_at).toLocaleDateString('ko-KR')} 처리
                            </span>
                          )}
                        </div>
                      </div>

                      {company.verification_status === 'PENDING' && (
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleApprove(company.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => openRejectModal(company.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">거절 사유 입력</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows={4}
              placeholder="거절 사유를 입력하세요..."
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowReasonModal(false)
                  setRejectionReason('')
                  setActionCompanyId(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={!rejectionReason}
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