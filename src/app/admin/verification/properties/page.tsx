'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Property, PropertyDocument, PropertyMedia } from '@/types/supabase'
import { CheckCircle, XCircle, FileText, Home, Clock, AlertCircle, Image as ImageIcon, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface PropertyWithDetails extends Property {
  property_documents: PropertyDocument[]
  property_media: PropertyMedia[]
  owner: {
    id: string
    full_name: string
    email: string
    user_type: string
  }
}

export default function PropertyVerificationPage() {
  const [properties, setProperties] = useState<PropertyWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACTIVE' | 'INACTIVE'>('PENDING')
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [showReasonInput, setShowReasonInput] = useState<{ [key: string]: boolean }>({})
  
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    loadProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const loadProperties = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_documents (*),
          property_media (*),
          owner:users!properties_owner_id_fkey (
            id,
            full_name,
            email,
            user_type
          )
        `)
        .order('created_at', { ascending: false })

      if (filter === 'PENDING') {
        query = query.eq('is_active', false)
      } else if (filter === 'ACTIVE') {
        query = query.eq('is_active', true)
      } else if (filter === 'INACTIVE') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveProperty = async (propertyId: string) => {
    setProcessing(propertyId)
    
    try {
      // Update property status
      const { error: propError } = await supabase
        .from('properties')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (propError) throw propError

      // Approve all pending documents
      const { error: docsError } = await supabase
        .from('property_documents')
        .update({
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString()
        })
        .eq('property_id', propertyId)
        .eq('verification_status', 'PENDING')

      if (docsError) throw docsError

      await loadProperties()
      alert('매물 승인이 완료되었습니다')
    } catch (error) {
      console.error('Approval error:', error)
      alert('승인 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectProperty = async (propertyId: string) => {
    const reason = rejectionReasons[propertyId]
    if (!reason || reason.trim() === '') {
      alert('거절 사유를 입력해주세요')
      return
    }

    setProcessing(propertyId)
    
    try {
      // Update property status
      const { error: propError } = await supabase
        .from('properties')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)

      if (propError) throw propError

      // Reject all documents with reason
      const { error: docsError } = await supabase
        .from('property_documents')
        .update({
          verification_status: 'REJECTED',
          rejection_reason: reason,
          verified_at: new Date().toISOString()
        })
        .eq('property_id', propertyId)

      if (docsError) throw docsError

      setRejectionReasons(prev => ({ ...prev, [propertyId]: '' }))
      setShowReasonInput(prev => ({ ...prev, [propertyId]: false }))
      
      await loadProperties()
      alert('매물 거절이 완료되었습니다')
    } catch (error) {
      console.error('Rejection error:', error)
      alert('거절 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'PROPERTY_OWNERSHIP': return '소유권 증명서'
      case 'BUSINESS_LICENSE': return '사업자 등록증'
      case 'ID_CARD': return '신분증'
      case 'CONTRACT': return '계약서'
      case 'OTHER': return '기타'
      default: return type
    }
  }

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'APARTMENT': return '아파트'
      case 'OFFICETEL': return '오피스텔'
      case 'VILLA': return '빌라'
      case 'HOUSE': return '주택'
      case 'STUDIO': return '원룸'
      default: return type
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'SALE': return '매매'
      case 'JEONSE': return '전세'
      case 'MONTHLY_RENT': return '월세'
      default: return type
    }
  }

  const formatPrice = (property: Property) => {
    if (property.transaction_type === 'SALE') {
      return `매매 ${(property.price / 100000000).toFixed(1)}억원`
    } else if (property.transaction_type === 'JEONSE') {
      return `전세 ${(property.price / 10000).toFixed(0)}만원`
    } else {
      return `월세 ${(property.deposit! / 10000).toFixed(0)}/${(property.monthly_rent! / 10000).toFixed(0)}만원`
    }
  }

  const pendingCount = properties.filter(p => !p.is_active).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">매물 인증 관리</h1>
            <p className="text-gray-600 mt-1">
              매물 서류를 검토하고 게시를 승인/거절합니다
            </p>
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
      </div>

      {/* Filter Tabs */}
      <div className="bg-white shadow rounded-lg px-6 py-3">
        <div className="flex space-x-4">
          {(['PENDING', 'ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
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
               status === 'ACTIVE' ? '활성' : '비활성'}
            </button>
          ))}
        </div>
      </div>

      {/* Property List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">검토할 매물이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => (
            <div key={property.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Property Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Thumbnail */}
                    {property.thumbnail_url ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={property.thumbnail_url}
                          alt={property.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{property.road_address}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {getPropertyTypeLabel(property.property_type)}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {getTransactionTypeLabel(property.transaction_type)}
                        </span>
                        <span className="font-semibold">{formatPrice(property)}</span>
                        <span className="text-gray-500">{property.size_info}평</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>소유자: {property.owner.full_name} ({property.owner.email})</span>
                        <span>
                          {property.owner.user_type === 'REALTOR' ? '공인중개사' : 
                           property.owner.user_type === 'LANDLORD' ? '임대인' : '개인'}
                        </span>
                      </div>
                      
                      <div className="mt-2">
                        {property.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            활성
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            대기중
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/properties/${property.id}/media`)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    
                    {!property.is_active && (
                      <>
                        <button
                          onClick={() => handleApproveProperty(property.id)}
                          disabled={processing === property.id}
                          className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>승인</span>
                        </button>
                        <button
                          onClick={() => setShowReasonInput(prev => ({ 
                            ...prev, 
                            [property.id]: !prev[property.id] 
                          }))}
                          disabled={processing === property.id}
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
                {showReasonInput[property.id] && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      거절 사유
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={rejectionReasons[property.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({ 
                          ...prev, 
                          [property.id]: e.target.value 
                        }))}
                        placeholder="거절 사유를 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={() => handleRejectProperty(property.id)}
                        disabled={processing === property.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Media & Documents Section */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Media Section */}
                <div className="p-6 border-r">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    매물 이미지 ({property.property_media.length}개)
                  </h4>
                  
                  {property.property_media.length === 0 ? (
                    <p className="text-sm text-gray-500">등록된 이미지가 없습니다</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {property.property_media.slice(0, 6).map((media) => (
                        <div key={media.id} className="relative aspect-square rounded overflow-hidden">
                          <Image
                            src={media.media_url}
                            alt="Property"
                            fill
                            className="object-cover"
                          />
                          {media.is_main_image && (
                            <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                              대표
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {property.property_media.length > 6 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{property.property_media.length - 6}개 더보기
                    </p>
                  )}
                </div>

                {/* Documents Section */}
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    제출 서류 ({property.property_documents.length}개)
                  </h4>
                  
                  {property.property_documents.length === 0 ? (
                    <p className="text-sm text-gray-500">제출된 서류가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {property.property_documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {getDocumentTypeLabel(doc.document_type)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {doc.document_name || '문서'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {doc.verification_status === 'APPROVED' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : doc.verification_status === 'REJECTED' ? (
                              <XCircle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-600" />
                            )}
                            
                            <a
                              href={doc.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              보기
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Required Documents Checklist */}
                  <div className="mt-3 p-2 bg-blue-50 rounded">
                    <h5 className="text-xs font-semibold text-blue-900 mb-1">필수 서류</h5>
                    <div className="space-y-0.5">
                      {['PROPERTY_OWNERSHIP', 'ID_CARD'].map((docType) => {
                        const hasDoc = property.property_documents.some(
                          d => d.document_type === docType
                        )
                        
                        return (
                          <div key={docType} className="flex items-center space-x-1 text-xs">
                            {hasDoc ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
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
              </div>

              {/* Additional Info */}
              <div className="px-6 py-3 bg-gray-100 text-xs text-gray-600">
                등록일: {new Date(property.created_at!).toLocaleDateString()} | 
                조회수: {property.view_count || 0} | 
                방: {property.room_count || 0} | 욕실: {property.bathroom_count || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}