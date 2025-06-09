'use client'

import {Property} from '@/types'
import {supabase} from '@/lib/supabase'
import {useRouter} from 'next/navigation'

interface PropertiesTableProps {
    properties: Property[]
}

export default function PropertiesTable({properties}: PropertiesTableProps) {
    const router = useRouter()

    const handleApprove = async (propertyId: string) => {
        const {error} = await supabase
            .from('properties')
            .update({status: 'APPROVED'})
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
            .update({status: 'REJECTED'})
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
            {properties.map((property) => (
                <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.price.toLocaleString()}원
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
                        {new Date(property.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                            onClick={() => handleViewDetail(property.id)}
                        >
                            상세보기
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
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}