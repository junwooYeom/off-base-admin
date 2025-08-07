import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Home, MapPin, DollarSign, Calendar, User, Building, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getProperty(id: string) {
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      owner:owner_id (
        id,
        email,
        full_name,
        phone_number
      ),
      creator:creator_realtor_id (
        id,
        email,
        full_name,
        phone_number
      ),
      realtor_company:realtor_company_id (
        id,
        company_name,
        phone_number
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return property
}

async function getPropertyMedia(propertyId: string) {
  const { data, error } = await supabase
    .from('property_media')
    .select('*')
    .eq('property_id', propertyId)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data || []
}

async function getPropertyDocuments(propertyId: string) {
  const { data, error } = await supabase
    .from('property_documents')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const property = await getProperty(params.id)
  const media = await getPropertyMedia(params.id)
  const documents = await getPropertyDocuments(params.id)

  if (!property) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">매물을 찾을 수 없습니다</h2>
        <Link href="/admin/properties" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
          매물 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'SALE': return '매매'
      case 'JEONSE': return '전세'
      case 'MONTHLY_RENT': return '월세'
      default: return type
    }
  }

  const getPropertyTypeText = (type: string) => {
    switch (type) {
      case 'APARTMENT': return '아파트'
      case 'OFFICETEL': return '오피스텔'
      case 'VILLA': return '빌라'
      case 'HOUSE': return '단독주택'
      case 'STUDIO': return '원룸'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/properties" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/properties/${params.id}/media`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            이미지 관리
          </Link>
          <Link
            href={`/admin/properties/${params.id}/documents`}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            문서 관리
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
          property.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {property.is_active ? '활성' : '비활성'}
        </span>
        {property.is_featured && (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
            추천 매물
          </span>
        )}
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              매물 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">거래 유형</p>
                <p className="font-semibold">{getTransactionTypeText(property.transaction_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">매물 유형</p>
                <p className="font-semibold">{getPropertyTypeText(property.property_type)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">가격</p>
                <p className="font-semibold text-lg">
                  {property.transaction_type === 'MONTHLY_RENT' 
                    ? `보증금 ${property.deposit?.toLocaleString()}원 / 월 ${property.monthly_rent?.toLocaleString()}원`
                    : `${property.price.toLocaleString()}원`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">관리비</p>
                <p className="font-semibold">
                  {property.management_fee ? `${property.management_fee.toLocaleString()}원` : '없음'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">크기</p>
                <p className="font-semibold">{property.size_info}평</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">방/욕실</p>
                <p className="font-semibold">
                  {property.room_count || 0}개 / {property.bathroom_count || 0}개
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">층수</p>
                <p className="font-semibold">
                  {property.current_floor || '-'} / {property.total_floors || '-'}층
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">입주 가능일</p>
                <p className="font-semibold">
                  {property.move_in_date ? new Date(property.move_in_date).toLocaleDateString() : '즉시'}
                </p>
              </div>
            </div>

            {property.description && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">설명</p>
                <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              위치 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">도로명 주소</p>
                <p className="font-semibold">{property.road_address}</p>
              </div>
              {property.detail_address && (
                <div>
                  <p className="text-sm text-gray-500">상세 주소</p>
                  <p className="font-semibold">{property.detail_address}</p>
                </div>
              )}
              {property.jibun_address && (
                <div>
                  <p className="text-sm text-gray-500">지번 주소</p>
                  <p className="font-semibold">{property.jibun_address}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">시/도</p>
                  <p className="font-semibold">{property.sido || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">시/군/구</p>
                  <p className="font-semibold">{property.sigungu || '-'}</p>
                </div>
              </div>
              {(property.latitude && property.longitude) && (
                <div>
                  <p className="text-sm text-gray-500">좌표</p>
                  <p className="font-semibold text-xs">
                    {property.latitude}, {property.longitude}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Owner Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              소유자 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.owner ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-semibold">{property.owner.full_name || '정보 없음'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-semibold">{property.owner.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">전화번호</p>
                  <p className="font-semibold">{property.owner.phone_number || '정보 없음'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">소유자 정보가 없습니다</p>
            )}
            
            {property.landlord_name && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">임대인 정보</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="font-semibold">{property.landlord_name}</p>
                  </div>
                  {property.landlord_phone && (
                    <div>
                      <p className="text-sm text-gray-500">전화번호</p>
                      <p className="font-semibold">{property.landlord_phone}</p>
                    </div>
                  )}
                  {property.landlord_email && (
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-semibold">{property.landlord_email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Realtor Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              중개사 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {property.creator ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">담당 중개사</p>
                  <p className="font-semibold">{property.creator.full_name || property.creator.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-semibold">{property.creator.email}</p>
                </div>
                {property.creator.phone_number && (
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-semibold">{property.creator.phone_number}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">중개사 정보가 없습니다</p>
            )}

            {property.realtor_company && (
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">중개사무소</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">회사명</p>
                    <p className="font-semibold">{property.realtor_company.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-semibold">{property.realtor_company.phone_number}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>이미지 ({media.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.slice(0, 8).map((item) => (
                <div key={item.id} className="relative aspect-square">
                  <img
                    src={item.media_url}
                    alt={item.alt_text || '매물 이미지'}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {item.is_main_image && (
                    <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                      대표
                    </span>
                  )}
                </div>
              ))}
            </div>
            {media.length > 8 && (
              <Link
                href={`/admin/properties/${params.id}/media`}
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
              >
                모든 이미지 보기 →
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>문서 ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{doc.document_name || doc.document_type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.verification_status === 'APPROVED' 
                      ? 'bg-green-100 text-green-800'
                      : doc.verification_status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.verification_status === 'APPROVED' ? '승인됨' :
                     doc.verification_status === 'REJECTED' ? '거절됨' : '대기중'}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href={`/admin/properties/${params.id}/documents`}
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
            >
              문서 관리 →
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>추가 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">조회수</p>
              <p className="font-semibold">{property.view_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">등록일</p>
              <p className="font-semibold">
                {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">수정일</p>
              <p className="font-semibold">
                {property.updated_at ? new Date(property.updated_at).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">주차</p>
              <p className="font-semibold">{property.parking_spaces || '정보 없음'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">반려동물</p>
              <p className="font-semibold">{property.pets_allowed ? '가능' : '불가'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">가구</p>
              <p className="font-semibold">{property.is_furnished ? '풀옵션' : '없음'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">협상 가능</p>
              <p className="font-semibold">{property.is_negotiable ? '가능' : '불가'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}