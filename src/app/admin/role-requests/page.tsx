'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, UserVerificationDocument } from '@/types/supabase'
import { CheckCircle, XCircle, FileText, Eye, User as UserIcon, Clock, AlertCircle, Phone, Mail, Building, CreditCard, MapPin, Hash, MessageCircle, ArrowRight, Calendar, Briefcase } from 'lucide-react'
import Image from 'next/image'
import Pagination from '@/components/Pagination'

interface RoleUpgradeRequest {
  id: string
  user_id: string
  target_role: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'cancelled' | 'requires_update'
  company_name?: string
  company_phone?: string
  company_address?: string
  company_registration_number?: string
  realtor_registration_number?: string
  documents?: any
  business_license_url?: string
  realtor_license_url?: string
  reviewed_by?: string
  rejection_reason?: string
  admin_notes?: string
  created_at: string
  updated_at: string
  approved_at?: string
  
  // User details
  user: User & {
    user_verification_documents?: UserVerificationDocument[]
  }
}

const ITEMS_PER_PAGE = 10

export default function RoleRequestsPage() {
  const [requests, setRequests] = useState<RoleUpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('pending')
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
        .from('role_upgrade_requests')
        .select(`
          *,
          user:users!role_upgrade_requests_user_id_fkey (
            *,
            user_verification_documents (*)
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filter !== 'ALL') {
        query = query.eq('status', filter)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error loading role upgrade requests:', error)
        setRequests([])
        setTotalCount(0)
      } else {
        setRequests(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Error loading role upgrade requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (request: RoleUpgradeRequest) => {
    if (!confirm('이 요청을 승인하시겠습니까? 사용자는 즉시 공인중개사로 활동할 수 있게 됩니다.')) {
      return
    }

    setProcessing(request.id)
    
    try {
      // 1. Update role upgrade request status
      const { error: requestError } = await supabase
        .from('role_upgrade_requests')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id)

      if (requestError) throw requestError

      // 2. Update user role to REALTOR and add realtor information
      const userUpdateData: any = {
        user_type: 'REALTOR',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Add realtor-specific fields if provided
      if (request.realtor_registration_number) {
        userUpdateData.realtor_registration_number = request.realtor_registration_number
      }
      if (request.realtor_license_url) {
        userUpdateData.realtor_license_url = request.realtor_license_url
      }

      const { error: userError } = await supabase
        .from('users')
        .update(userUpdateData)
        .eq('id', request.user_id)

      if (userError) {
        console.warn('User update error details:', userError)
        throw new Error(`사용자 정보 업데이트 실패: ${userError.message}`)
      }

      // 3. Approve all pending documents and migrate them to proper buckets
      const { data: userDocs } = await supabase
        .from('user_verification_documents')
        .select('*')
        .eq('user_id', request.user_id)
        .eq('verification_status', 'PENDING')

      if (userDocs && userDocs.length > 0) {
        for (const doc of userDocs) {
          // Update document status to APPROVED
          await supabase
            .from('user_verification_documents')
            .update({
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString()
            })
            .eq('id', doc.id)
        }
      }

      // 4. If company information exists, create or update realtor company
      if (request.company_name && request.company_registration_number) {
        // Check if company already exists
        const { data: existingCompany } = await supabase
          .from('realtor_companies')
          .select('id')
          .eq('business_registration_number', request.company_registration_number)
          .single()

        let companyId: string

        if (existingCompany) {
          // Update existing company
          companyId = existingCompany.id
          await supabase
            .from('realtor_companies')
            .update({
              company_name: request.company_name,
              phone_number: request.company_phone,
              address: request.company_address,
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', companyId)
        } else {
          // Create new company
          const { data: newCompany, error: companyError } = await supabase
            .from('realtor_companies')
            .insert({
              company_name: request.company_name,
              business_registration_number: request.company_registration_number,
              phone_number: request.company_phone || '',
              address: request.company_address,
              business_license: request.company_registration_number,
              business_license_url: request.business_license_url,
              verification_status: 'APPROVED',
              verified_at: new Date().toISOString(),
              is_verified: true
            })
            .select('id')
            .single()

          if (companyError) throw companyError
          companyId = newCompany.id
        }

        // Link user to company
        await supabase
          .from('users')
          .update({ realtor_company_id: companyId })
          .eq('id', request.user_id)
      }

      // Delete the role upgrade request after successful approval
      const { error: deleteError } = await supabase
        .from('role_upgrade_requests')
        .delete()
        .eq('id', request.id)
      
      if (deleteError) {
        console.warn('Failed to delete role upgrade request:', deleteError)
      }

      await loadRequests()
      alert('✅ 역할 변경 요청이 승인되었습니다. 사용자는 이제 공인중개사로 활동할 수 있습니다.')
    } catch (error: any) {
      console.warn('Approval error:', error)
      const errorMessage = error?.message || '승인 처리 중 오류가 발생했습니다'
      alert(`오류: ${errorMessage}`)
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
      // Update role upgrade request status with rejection reason
      const { error: requestError } = await supabase
        .from('role_upgrade_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      // Delete the role upgrade request after rejection
      const { error: deleteError } = await supabase
        .from('role_upgrade_requests')
        .delete()
        .eq('id', requestId)
      
      if (deleteError) {
        console.warn('Failed to delete role upgrade request:', deleteError)
      }

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
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">승인됨</span>
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">거절됨</span>
      case 'in_review':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">검토중</span>
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">취소됨</span>
      case 'requires_update':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">보완필요</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">대기중</span>
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
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

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">역할 변경 요청 (통합 관리)</h1>
            <p className="text-gray-600 mt-1">
              세입자→공인중개사 역할 변경을 한 번에 승인/거절합니다
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

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">통합 승인 시스템</p>
            <p className="mt-1">승인 버튼 클릭 시 다음이 자동으로 처리됩니다:</p>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>사용자 역할을 공인중개사로 변경</li>
              <li>제출된 모든 서류 승인</li>
              <li>회사 정보가 있을 경우 회사 등록 및 연결</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg px-6 py-3">
        <div className="flex space-x-4">
          {(['pending', 'ALL', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'pending' ? '대기중' :
               status === 'ALL' ? '전체' :
               status === 'approved' ? '승인됨' : '거절됨'}
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
                        {getRoleBadge(request.user?.user_type || 'TENANT')}
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        {getRoleBadge(request.target_role)}
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
                            <span className="font-medium">공인중개사 등록번호: {request.realtor_registration_number}</span>
                          </div>
                        )}
                        {request.company_name && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>소속: {request.company_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Company Info Section */}
                      {request.company_registration_number && (
                        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Briefcase className="h-4 w-4 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-purple-900">회사 정보</p>
                              <div className="mt-1 space-y-1">
                                <p className="text-xs text-purple-700">사업자등록번호: {request.company_registration_number}</p>
                                {request.company_phone && (
                                  <p className="text-xs text-purple-700">전화: {request.company_phone}</p>
                                )}
                                {request.company_address && (
                                  <p className="text-xs text-purple-700">주소: {request.company_address}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Admin Notes */}
                      {request.admin_notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">관리자 메모:</span> {request.admin_notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-3 flex items-center space-x-4">
                        {getStatusBadge(request.status)}
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>요청일: {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                        {request.approved_at && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>처리일: {new Date(request.approved_at).toLocaleDateString()}</span>
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
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request)}
                          disabled={processing === request.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>통합 승인</span>
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

              {/* License Documents Section */}
              <div className="px-6 py-4 border-b bg-green-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">제출된 자격증</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {request.realtor_license_url && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">공인중개사 자격증</p>
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
                  )}
                  {request.business_license_url && (
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">사업자 등록증</p>
                          <p className="text-xs text-gray-500">번호: {request.company_registration_number || '미등록'}</p>
                        </div>
                      </div>
                      <a
                        href={request.business_license_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                      >
                        <Eye className="h-4 w-4" />
                        <span>보기</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Documents Section */}
              {request.user?.user_verification_documents && request.user.user_verification_documents.length > 0 && (
                <div className="p-6 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    추가 제출 서류 ({request.user.user_verification_documents.length}개)
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