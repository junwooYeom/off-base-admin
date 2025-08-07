'use client'

import {Property} from '@/types'
import {toPropertyWithCompat} from '@/types/compatibility'
import {supabase} from '@/lib/supabase'
import {useRouter} from 'next/navigation'

interface PropertiesTableProps {
    properties: Property[]
}

export default function PropertiesTable({properties}: PropertiesTableProps) {
    const router = useRouter()
    
    // Convert properties to compatible format
    const compatProperties = properties.map(toPropertyWithCompat)

    const handleApprove = async (propertyId: string) => {
        const {error} = await supabase
            .from('properties')
            .update({
                status: 'APPROVED',
                is_active: true,
                approval_date: new Date().toISOString()
            })
            .eq('id', propertyId)

        if (error) {
            alert('승인 실패')
            return
        }

        router.refresh()
    }

    const handleReject = async (propertyId: string) => {
        const {error} = await supabase
            .from('properties')
            .update({
                status: 'REJECTED',
                is_active: false
            })
            .eq('id', propertyId)

        if (error) {
            alert('거절 실패')
            return
        }

        router.refresh()
    }

    const handleViewDetail = (propertyId: string) => {
        router.push(`/admin/properties/${propertyId}`)
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead>
            <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래유형
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위치
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {compatProperties.map((property) => (
                <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${property.transaction_type === 'SALE' ? 'bg-blue-100 text-blue-800' :
                              property.transaction_type === 'JEONSE' ? 'bg-purple-100 text-purple-800' :
                              'bg-orange-100 text-orange-800'}`}>
                            {property.transaction_type === 'SALE' ? '매매' :
                             property.transaction_type === 'JEONSE' ? '전세' : '월세'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.transaction_type === 'MONTHLY_RENT' 
                            ? <div className="text-xs">
                                <div>보증금: {property.deposit?.toLocaleString() || 0}원</div>
                                <div>월세: {property.monthly_rent?.toLocaleString() || 0}원</div>
                              </div>
                            : `${property.price?.toLocaleString() || 0}원`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${property.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  property.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                {property.status === 'APPROVED' ? '승인' :
                    property.status === 'REJECTED' ? '거절' : '대기중'}
              </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.created_at ? new Date(property.created_at).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                            onClick={() => handleViewDetail(property.id)}
                        >
                            상세보기
                        </button>
                        <button
                            className="text-purple-600 hover:text-purple-900 mr-2"
                            onClick={() => router.push(`/admin/properties/${property.id}/media`)}
                        >
                            이미지
                        </button>
                        <button
                            className="text-yellow-600 hover:text-yellow-900 mr-2"
                            onClick={() => router.push(`/admin/properties/${property.id}/documents`)}
                        >
                            문서
                        </button>
                        {property.status === 'PENDING' && (
                            <>
                                <button
                                    className="text-green-600 hover:text-green-900 mr-4"
                                    onClick={() => handleApprove(property.id)}
                                >
                                    승인
                                </button>
                                <button
                                    className="text-red-600 hover:text-red-900"
                                    onClick={() => handleReject(property.id)}
                                >
                                    거절
                                </button>
                            </>
                        )}
                        {property.status === 'APPROVED' && (
                            <button
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleReject(property.id)}
                            >
                                승인 취소
                            </button>
                        )}
                        {property.status === 'REJECTED' && (
                            <button
                                className="text-green-600 hover:text-green-900"
                                onClick={() => handleApprove(property.id)}
                            >
                                재승인
                            </button>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}