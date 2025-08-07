import { supabase } from '@/lib/supabase'
import ImageUploader from '@/components/ImageUploader'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      property_media (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}

export default async function PropertyMediaPage({ 
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
              <h1 className="text-2xl font-bold text-gray-900">매물 이미지 관리</h1>
              <p className="text-gray-600 mt-1">{property.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">매물 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">주소:</span>
            <span className="ml-2 font-medium">{property.road_address}</span>
          </div>
          <div>
            <span className="text-gray-600">가격:</span>
            <span className="ml-2 font-medium">
              {property.transaction_type === 'SALE' 
                ? `매매 ${(property.price / 100000000).toFixed(1)}억원`
                : property.transaction_type === 'JEONSE'
                ? `전세 ${(property.price / 10000).toFixed(0)}만원`
                : `월세 ${(property.deposit / 10000).toFixed(0)}/${(property.monthly_rent / 10000).toFixed(0)}만원`
              }
            </span>
          </div>
          <div>
            <span className="text-gray-600">면적:</span>
            <span className="ml-2 font-medium">{property.size_info}평</span>
          </div>
        </div>
      </div>

      {/* Image Uploader */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">이미지 관리</h2>
        <ImageUploader 
          propertyId={params.id}
          existingImages={property.property_media || []}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">이미지 업로드 팁</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 첫 번째 이미지가 자동으로 대표 이미지로 설정됩니다</li>
          <li>• 이미지 위에 마우스를 올리면 대표 이미지 설정 및 삭제가 가능합니다</li>
          <li>• 최대 10개의 이미지를 업로드할 수 있습니다</li>
          <li>• 고품질 이미지를 사용하면 매물이 더 매력적으로 보입니다</li>
        </ul>
      </div>
    </div>
  )
}