'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, UserVerificationDocument } from '@/types/supabase'
import { CheckCircle, XCircle, FileText, Eye, User as UserIcon, Clock, AlertCircle, Phone, Mail, Building, CreditCard, MapPin, Hash, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Pagination from '@/components/Pagination'

interface RealtorWithDocuments extends User {
  user_verification_documents: UserVerificationDocument[]
  realtor_company?: {
    id: string
    company_name: string
    company_address: string
    business_license: string
  }
}

const ITEMS_PER_PAGE = 10

export default function RealtorVerificationPage() {
  const [realtors, setRealtors] = useState<RealtorWithDocuments[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [showReasonInput, setShowReasonInput] = useState<{ [key: string]: boolean }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    setCurrentPage(1)
    loadRealtors()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    loadRealtors()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadRealtors = async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from('users')
        .select(`
          *,
          user_verification_documents (*),
          realtor_company:realtor_companies!fk_users_realtor_company (
            id,
            company_name,
            company_address,
            business_license
          )
        `, { count: 'exact' })
        .eq('user_type', 'REALTOR')
        .order('created_at', { ascending: false })
        .range(from, to)

      if (filter !== 'ALL') {
        query = query.eq('verification_status', filter)
      }

      const { data, error, count } = await query

      if (error) throw error
      setRealtors(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error loading realtors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRealtor = async (realtorId: string) => {
    setProcessing(realtorId)
    
    try {
      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', realtorId)

      if (userError) throw userError

      // Approve all pending documents
      const { error: docsError } = await supabase
        .from('user_verification_documents')
        .update({
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString()
        })
        .eq('user_id', realtorId)
        .eq('verification_status', 'PENDING')

      if (docsError) throw docsError

      await loadRealtors()
      alert('공인중개사 승인이 완료되었습니다')
    } catch (error) {
      console.error('Approval error:', error)
      alert('승인 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectRealtor = async (realtorId: string) => {
    const reason = rejectionReasons[realtorId]
    if (!reason || reason.trim() === '') {
      alert('거절 사유를 입력해주세요')
      return
    }

    setProcessing(realtorId)

    try {
      // Update user verification status
      const { error: userError } = await supabase
        .from('users')
        .update({
          verification_status: 'REJECTED',
          updated_at: new Date().toISOString()
        })
        .eq('id', realtorId)

      if (userError) throw userError

      // Reject all documents with reason
      const { error: docsError } = await supabase
        .from('user_verification_documents')
        .update({
          verification_status: 'REJECTED',
          rejection_reason: reason,
          verified_at: new Date().toISOString()
        })
        .eq('user_id', realtorId)

      if (docsError) throw docsError

      setRejectionReasons(prev => ({ ...prev, [realtorId]: '' }))
      setShowReasonInput(prev => ({ ...prev, [realtorId]: false }))

      await loadRealtors()
      alert('공인중개사 거절이 완료되었습니다')
    } catch (error) {
      console.error('Rejection error:', error)
      alert('거절 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeleteRealtor = async (realtorId: string) => {
    if (!confirm('이 공인중개사 계정을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setDeletingId(realtorId)

    try {
      // Delete user verification documents first
      const { error: docsError } = await supabase
        .from('user_verification_documents')
        .delete()
        .eq('user_id', realtorId)

      if (docsError) {
        console.error('Documents deletion error:', docsError)
      }

      // Delete the user account
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', realtorId)

      if (userError) throw userError

      await loadRealtors()
      alert('공인중개사 계정이 성공적으로 삭제되었습니다')
    } catch (error) {
      console.error('Deletion error:', error)
      alert('삭제 처리 중 오류가 발생했습니다')
    } finally {
      setDeletingId(null)
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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">승인됨</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">거절됨</span>
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">대기중</span>
    }
  }

  const pendingCount = realtors.filter(r => r.verification_status === 'PENDING').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">공인중개사 인증 관리</h1>
            <p className="text-gray-600 mt-1">
              공인중개사 서류를 검토하고 계정을 승인/거절합니다
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2 bg-yellow-100 px-3 py-2 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {pendingCount}명 대기중
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

      {/* Realtor List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : realtors.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">검토할 공인중개사가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {realtors.map((realtor) => (
            <div key={realtor.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Realtor Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {realtor.profile_image_url ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={realtor.profile_image_url}
                          alt={realtor.full_name}
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
                        {realtor.full_name || '이름 미등록'}
                      </h3>
                      
                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{realtor.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span>{realtor.phone_number || '전화번호 미등록'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium">등록번호: {realtor.realtor_registration_number || '미등록'}</span>
                        </div>
                        {realtor.realtor_company && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span>소속: {realtor.realtor_company.company_name}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Social Media & Contact Methods */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <div className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          <Hash className="inline h-3 w-3 mr-1" />
                          ID: {realtor.id.slice(0, 8)}...
                        </div>
                        {realtor.kakao_id && (
                          <div className="px-2 py-1 bg-yellow-50 rounded text-xs text-gray-600">
                            <MessageCircle className="inline h-3 w-3 mr-1" />
                            카카오: {realtor.kakao_id}
                          </div>
                        )}
                        {realtor.whatsapp_number && (
                          <div className="px-2 py-1 bg-green-50 rounded text-xs text-gray-600">
                            <Phone className="inline h-3 w-3 mr-1" />
                            WhatsApp: {realtor.whatsapp_number}
                          </div>
                        )}
                        {realtor.telegram_id && (
                          <div className="px-2 py-1 bg-blue-50 rounded text-xs text-gray-600">
                            <MessageCircle className="inline h-3 w-3 mr-1" />
                            Telegram: {realtor.telegram_id}
                          </div>
                        )}
                      </div>
                      
                      {/* Company Address if exists */}
                      {realtor.realtor_company && realtor.realtor_company.company_address && (
                        <div className="mt-3 p-2 bg-blue-50 rounded">
                          <div className="flex items-start space-x-2 text-xs text-blue-800">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{realtor.realtor_company.company_address}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        {getStatusBadge(realtor.verification_status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {realtor.verification_status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleApproveRealtor(realtor.id)}
                          disabled={processing === realtor.id || deletingId === realtor.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>전체 승인</span>
                        </button>
                        <button
                          onClick={() => setShowReasonInput(prev => ({
                            ...prev,
                            [realtor.id]: !prev[realtor.id]
                          }))}
                          disabled={processing === realtor.id || deletingId === realtor.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>거절</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteRealtor(realtor.id)}
                      disabled={processing === realtor.id || deletingId === realtor.id}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>

                {/* Rejection Reason Input */}
                {showReasonInput[realtor.id] && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 사유
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={rejectionReasons[realtor.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({ 
                          ...prev, 
                          [realtor.id]: e.target.value 
                        }))}
                        placeholder="거절 사유를 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={() => handleRejectRealtor(realtor.id)}
                        disabled={processing === realtor.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Realtor License if exists */}
              {realtor.realtor_license_url && (
                <div className="px-6 py-4 border-b bg-green-50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">공인중개사 자격증</h4>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">부동산 중개업자 등록증</p>
                        <p className="text-xs text-gray-500">등록번호: {realtor.realtor_registration_number || '미등록'}</p>
                      </div>
                    </div>
                    <a
                      href={realtor.realtor_license_url}
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
              <div className="p-6 bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  제출 서류 ({realtor.user_verification_documents.length}개)
                </h4>
                
                {realtor.user_verification_documents.length === 0 ? (
                  <p className="text-sm text-gray-500">제출된 서류가 없습니다</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {realtor.user_verification_documents.map((doc) => (
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
                )}

                {/* Required Documents Checklist */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">필수 서류 체크리스트</h5>
                  <div className="space-y-1">
                    {['BUSINESS_LICENSE', 'ID_CARD', 'OTHER'].map((docType) => {
                      const hasDoc = realtor.user_verification_documents.some(
                        d => d.document_type === docType
                      )
                      const isApproved = realtor.user_verification_documents.some(
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

              {/* Additional Info */}
              <div className="px-6 py-3 bg-gray-100 text-xs text-gray-600">
                <div className="flex flex-wrap items-center gap-3">
                  <span>가입일: {new Date(realtor.created_at!).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>마지막 로그인: {realtor.last_login_at ? new Date(realtor.last_login_at).toLocaleDateString() : '없음'}</span>
                  <span>•</span>
                  <span>사용자 유형: {realtor.user_type}</span>
                  {realtor.verified_at && (
                    <>
                      <span>•</span>
                      <span className="text-green-600 font-medium">인증일: {new Date(realtor.verified_at).toLocaleDateString()}</span>
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