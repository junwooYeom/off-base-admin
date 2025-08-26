'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, UserVerificationDocument } from '@/types/supabase'
import { CheckCircle, XCircle, FileText, Eye, User as UserIcon, Clock, AlertCircle, Phone, Mail, Building, CreditCard, MapPin, Hash, MessageCircle, ArrowRight, Calendar } from 'lucide-react'
import Image from 'next/image'
import Pagination from '@/components/Pagination'

interface RoleChangeRequest {
  id: string
  user_id: string
  from_role: string
  to_role: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reason?: string
  rejection_reason?: string
  requested_at: string
  processed_at?: string
  processed_by?: string
  
  // User details
  user: User & {
    user_verification_documents?: UserVerificationDocument[]
  }
  
  // Realtor specific information
  realtor_registration_number?: string
  realtor_license_url?: string
  realtor_company_id?: string
  realtor_company?: {
    id: string
    company_name: string
    company_address: string
    business_license: string
  }
}

const ITEMS_PER_PAGE = 10

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState<RoleChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [showReasonInput, setShowReasonInput] = useState<{ [key: string]: boolean }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    setCurrentPage(1)
    loadRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    loadRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('role_change_requests')
        .select(`
          *,
          user:users!role_change_requests_user_id_fkey (
            *,
            user_verification_documents (*)
          ),
          realtor_company:realtor_companies (
            id,
            company_name,
            company_address,
            business_license
          )
        `, { count: 'exact' })
        .order('requested_at', { ascending: false })
        .range(from, to)

      if (filter !== 'ALL') {
        query = query.eq('status', filter)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error loading role change requests:', error)
        // If table doesn't exist, show empty state
        if (error.code === '42P01') {
          setRequests([])
          setTotalCount(0)
        }
      } else {
        setRequests(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading role change requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: string, userId: string) => {
    setProcessing(requestId)
    
    try {
      // Update role change request status
      const { error: requestError } = await supabase
        .from('role_change_requests')
        .update({ 
          status: 'APPROVED',
          processed_at: new Date().toISOString(),
          processed_by: 'admin' // You might want to get actual admin ID
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      // Update user role to REALTOR
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          user_type: 'REALTOR',
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (userError) throw userError

      // Approve all pending documents
      const { error: docsError } = await supabase
        .from('user_verification_documents')
        .update({
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('verification_status', 'PENDING')

      if (docsError) throw docsError

      await loadRequests()
      alert('역할 변경 요청이 승인되었습니다')
    } catch (error) {
      console.error('Approval error:', error)
      alert('승인 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const reason = rejectionReasons[requestId]
    if (!reason || reason.trim() === '') {
      alert('거절 사유를 입력해주세요')
      return
    }

    setProcessing(requestId)
    
    try {
      // Update role change request status with rejection reason
      const { error: requestError } = await supabase
        .from('role_change_requests')
        .update({ 
          status: 'REJECTED',
          rejection_reason: reason,
          processed_at: new Date().toISOString(),
          processed_by: 'admin' // You might want to get actual admin ID
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      setRejectionReasons(prev => ({ ...prev, [requestId]: '' }))
      setShowReasonInput(prev => ({ ...prev, [requestId]: false }))
      
      await loadRequests()
      alert('역할 변경 요청이 거절되었습니다')
    } catch (error) {
      console.error('Rejection error:', error)
      alert('거절 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'BUSINESS_LICENSE': return '사업자 등록증'
      case 'ID_CARD': return '신분증'
      case 'OTHER': return '공인중개사 자격증'
      default: return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">승인됨</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">거절됨</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">대기중</span>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'TENANT':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">세입자</span>
      case 'REALTOR':
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">공인중개사</span>
      case 'LANDLORD':
        return <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">집주인</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{role}</span>
    }
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">역할 변경 요청 관리</h1>
            <p className="text-gray-600 mt-1">
              사용자의 역할 변경 요청을 검토하고 승인/거절합니다
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingCount}건 대기중
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg px-6 py-3">
        <div className="flex space-x-4">
          {(['PENDING', 'ALL', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'PENDING' ? '대기중' :
               status === 'ALL' ? '전체' :
               status === 'APPROVED' ? '승인됨' : '거절됨'}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">검토할 역할 변경 요청이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Request Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {request.user?.profile_image_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={request.user.profile_image_url}
                          alt={request.user.full_name || ''}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.user?.full_name || '이름 미등록'}
                      </h3>
                      
                      {/* Role Change Info */}
                      <div className="flex items-center space-x-2 mt-2">
                        {getRoleBadge(request.from_role)}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        {getRoleBadge(request.to_role)}
                      </div>
                      
                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{request.user?.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{request.user?.phone_number || '전화번호 미등록'}</span>
                        </div>
                        {request.realtor_registration_number && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="font-medium">등록번호: {request.realtor_registration_number}</span>
                          </div>
                        )}
                        {request.realtor_company && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>소속: {request.realtor_company.company_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Request Reason */}
                      {request.reason && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">요청 사유:</span> {request.reason}
                          </p>
                        </div>
                      )}
                      
                      {/* Company Address if exists */}
                      {request.realtor_company?.company_address && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <div className="flex items-start space-x-2 text-xs text-blue-800">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{request.realtor_company.company_address}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center space-x-4">
                        {getStatusBadge(request.status)}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>요청일: {new Date(request.requested_at).toLocaleDateString()}</span>
                        </div>
                        {request.processed_at && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>처리일: {new Date(request.processed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Rejection Reason Display */}
                      {request.rejection_reason && (
                        <div className="mt-3 p-2 bg-red-50 rounded">
                          <p className="text-sm text-red-700">
                            <span className="font-medium">거절 사유:</span> {request.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request.id, request.user_id)}
                          disabled={processing === request.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>승인</span>
                        </button>
                        <button
                          onClick={() => setShowReasonInput(prev => ({ 
                            ...prev, 
                            [request.id]: !prev[request.id] 
                          }))}
                          disabled={processing === request.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>거절</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Rejection Reason Input */}
                {showReasonInput[request.id] && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 사유
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={rejectionReasons[request.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({ 
                          ...prev, 
                          [request.id]: e.target.value 
                        }))}
                        placeholder="거절 사유를 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={processing === request.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Realtor License if exists */}
              {request.realtor_license_url && (
                <div className="px-6 py-4 border-b bg-green-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">공인중개사 자격증</h4>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">부동산 중개업자 등록증</p>
                        <p className="text-xs text-gray-500">등록번호: {request.realtor_registration_number || '미등록'}</p>
                      </div>
                    </div>
                    <a
                      href={request.realtor_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>보기</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Documents Section */}
              {request.user?.user_verification_documents && request.user.user_verification_documents.length > 0 && (
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    제출 서류 ({request.user.user_verification_documents.length}개)
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {request.user.user_verification_documents.map((doc) => (
                      <div key={doc.id} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-2">
                            <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {getDocumentTypeLabel(doc.document_type)}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.document_name || '문서'}
                              </p>
                              <div className="mt-2">
                                {doc.verification_status === 'APPROVED' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : doc.verification_status === 'REJECTED' ? (
                                  <XCircle className="h-4 w-4 text-red-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-yellow-600" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            <span>보기</span>
                          </a>
                        </div>
                        
                        {doc.rejection_reason && (
                          <p className="text-xs text-red-600 mt-2">
                            거절: {doc.rejection_reason}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Required Documents Checklist */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-xs font-semibold text-blue-900 mb-2">필수 서류 체크리스트</h5>
                    <div className="space-y-1">
                      {['BUSINESS_LICENSE', 'ID_CARD', 'OTHER'].map((docType) => {
                        const hasDoc = request.user.user_verification_documents?.some(
                          d => d.document_type === docType
                        )
                        const isApproved = request.user.user_verification_documents?.some(
                          d => d.document_type === docType && d.verification_status === 'APPROVED'
                        )
                        
                        return (
                          <div key={docType} className="flex items-center space-x-2 text-xs">
                            {isApproved ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : hasDoc ? (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={hasDoc ? 'text-gray-700' : 'text-gray-400'}>
                              {getDocumentTypeLabel(docType)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="px-6 py-3 bg-gray-100 text-xs text-gray-600">
                <div className="flex flex-wrap items-center gap-3">
                  <span>사용자 ID: {request.user_id.slice(0, 8)}...</span>
                  <span>•</span>
                  <span>요청 ID: {request.id.slice(0, 8)}...</span>
                  {request.user?.created_at && (
                    <>
                      <span>•</span>
                      <span>가입일: {new Date(request.user.created_at).toLocaleDateString()}</span>
                    </>
                  )}
                  {request.user?.last_login_at && (
                    <>
                      <span>•</span>
                      <span>마지막 로그인: {new Date(request.user.last_login_at).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}