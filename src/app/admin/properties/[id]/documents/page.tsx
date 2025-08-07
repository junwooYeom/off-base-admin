import { supabaseAdmin } from '@/lib/supabase-server'
import DocumentUploader from '@/components/DocumentUploader'
import Link from 'next/link'
import { ArrowLeft, FileText, User, Building, CreditCard, Download, Eye, CheckCircle, XCircle } from 'lucide-react'
import DocumentVerificationPanel from '@/components/DocumentVerificationPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getProperty(id: string) {
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_documents (*),
      owner:owner_id (
        id,
        full_name,
        email,
        phone_number,
        user_type,
        verification_status
      ),
      creator:creator_realtor_id (
        id,
        full_name,
        email,
        phone_number,
        realtor_license_url,
        realtor_registration_number,
        user_type
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}

async function getUserDocuments(userId: string) {
  if (!userId) return []
  
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from('user_verification_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user documents:', error)
    return []
  }

  return data || []
}

async function getRealtorCompany(realtorId: string) {
  if (!realtorId) return null
  
  const supabase = supabaseAdmin
  const { data: user } = await supabase
    .from('users')
    .select('realtor_company_id')
    .eq('id', realtorId)
    .single()

  if (!user?.realtor_company_id) return null

  const { data: company } = await supabase
    .from('realtor_companies')
    .select('*')
    .eq('id', user.realtor_company_id)
    .single()

  return company
}

export default async function PropertyDocumentsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const property = await getProperty(params.id)
  
  if (!property) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">매물을 찾을 수 없습니다</p>
      </div>
    )
  }

  const ownerDocuments = property.owner ? await getUserDocuments(property.owner.id) : []
  const realtorDocuments = property.creator ? await getUserDocuments(property.creator.id) : []
  const realtorCompany = property.creator ? await getRealtorCompany(property.creator.id) : null

  const getDocumentTypeText = (type: string) => {
    switch (type) {
      case 'ID_CARD': return '신분증'
      case 'BUSINESS_LICENSE': return '사업자 등록증'
      case 'PROPERTY_OWNERSHIP': return '소유권 증명서'
      case 'CONTRACT': return '계약서'
      case 'OTHER': return '기타'
      default: return type
    }
  }

  const getVerificationStatusBadge = (status: string | null) => {
    if (!status) return null
    
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">승인됨</span>
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">대기중</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">거절됨</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/properties" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">매물 문서 관리</h1>
              <p className="text-gray-600 mt-1">{property.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property & Owner Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">매물 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">주소:</span>
              <span className="ml-2 font-medium">{property.road_address}</span>
            </div>
            <div>
              <span className="text-gray-600">거래 유형:</span>
              <span className="ml-2 font-medium">
                {property.transaction_type === 'SALE' ? '매매' : 
                 property.transaction_type === 'JEONSE' ? '전세' : '월세'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">가격:</span>
              <span className="ml-2 font-medium">
                {property.transaction_type === 'MONTHLY_RENT' 
                  ? `보증금 ${property.deposit?.toLocaleString()}원 / 월 ${property.monthly_rent?.toLocaleString()}원`
                  : `${property.price?.toLocaleString()}원`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              소유자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">이름:</span>
              <span className="ml-2 font-medium">{property.owner?.full_name || '정보 없음'}</span>
            </div>
            <div>
              <span className="text-gray-600">이메일:</span>
              <span className="ml-2 font-medium">{property.owner?.email}</span>
            </div>
            <div>
              <span className="text-gray-600">전화번호:</span>
              <span className="ml-2 font-medium">{property.owner?.phone_number || '정보 없음'}</span>
            </div>
            <div>
              <span className="text-gray-600">인증 상태:</span>
              <span className="ml-2">
                {getVerificationStatusBadge(property.owner?.verification_status)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5" />
              중개사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">이름:</span>
              <span className="ml-2 font-medium">{property.creator?.full_name || '정보 없음'}</span>
            </div>
            <div>
              <span className="text-gray-600">이메일:</span>
              <span className="ml-2 font-medium">{property.creator?.email}</span>
            </div>
            <div>
              <span className="text-gray-600">등록번호:</span>
              <span className="ml-2 font-medium">{property.creator?.realtor_registration_number || '정보 없음'}</span>
            </div>
            {realtorCompany && (
              <div>
                <span className="text-gray-600">소속:</span>
                <span className="ml-2 font-medium">{realtorCompany.company_name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Owner Verification Documents */}
      {property.owner && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              소유자 인증 문서
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownerDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownerDocuments.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">{getDocumentTypeText(doc.document_type)}</span>
                      </div>
                      {getVerificationStatusBadge(doc.verification_status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {doc.document_name || '문서명 없음'}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                        보기
                      </a>
                      <a
                        href={doc.document_url}
                        download
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        <Download className="h-4 w-4" />
                        다운로드
                      </a>
                    </div>
                    {doc.rejection_reason && (
                      <p className="mt-2 text-xs text-red-600">
                        거절 사유: {doc.rejection_reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">등록된 인증 문서가 없습니다</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Realtor Verification Documents */}
      {property.creator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              중개사 인증 문서
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Realtor License from user table */}
              {property.creator.realtor_license_url && (
                <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">부동산 중개업자 등록증</span>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      시스템 등록
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    등록번호: {property.creator.realtor_registration_number || '-'}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={property.creator.realtor_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      보기
                    </a>
                    <a
                      href={property.creator.realtor_license_url}
                      download
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4" />
                      다운로드
                    </a>
                  </div>
                </div>
              )}

              {/* Other realtor documents */}
              {realtorDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{getDocumentTypeText(doc.document_type)}</span>
                    </div>
                    {getVerificationStatusBadge(doc.verification_status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {doc.document_name || '문서명 없음'}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                      보기
                    </a>
                    <a
                      href={doc.document_url}
                      download
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      <Download className="h-4 w-4" />
                      다운로드
                    </a>
                  </div>
                  {doc.rejection_reason && (
                    <p className="mt-2 text-xs text-red-600">
                      거절 사유: {doc.rejection_reason}
                    </p>
                  )}
                </div>
              ))}

              {realtorDocuments.length === 0 && !property.creator.realtor_license_url && (
                <p className="text-gray-500 text-center py-4 col-span-3">등록된 인증 문서가 없습니다</p>
              )}
            </div>

            {/* Realtor Company Documents */}
            {realtorCompany && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">소속 회사 문서</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {realtorCompany.business_license && (
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <span className="font-medium">사업자 등록증</span>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          회사 문서
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {realtorCompany.company_name}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href={realtorCompany.business_license}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          보기
                        </a>
                        <a
                          href={realtorCompany.business_license}
                          download
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                        >
                          <Download className="h-4 w-4" />
                          다운로드
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Property Documents */}
      <Card>
        <CardHeader>
          <CardTitle>매물 관련 문서</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploader
            entityId={params.id}
            entityType="property"
            existingDocuments={property.property_documents || []}
          />
        </CardContent>
      </Card>

      {/* Document Verification Panel for Admin */}
      {property.property_documents && property.property_documents.length > 0 && (
        <DocumentVerificationPanel
          documents={property.property_documents}
          entityType="property"
        />
      )}

      {/* Document Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">문서 안내</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-1">소유자 필수 문서</h4>
            <ul className="space-y-1">
              <li>• 신분증 (ID_CARD)</li>
              <li>• 소유권 증명서</li>
              <li>• 등기부등본</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">중개사 필수 문서</h4>
            <ul className="space-y-1">
              <li>• 부동산 중개업자 등록증</li>
              <li>• 사업자 등록증</li>
              <li>• 신분증</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-1">매물 관련 문서</h4>
            <ul className="space-y-1">
              <li>• 임대차 계약서</li>
              <li>• 시설물 점검 확인서</li>
              <li>• 관리비 내역서</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}