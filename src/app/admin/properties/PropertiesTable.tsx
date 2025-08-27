'use client'

import {Property} from '@/types'
import {toPropertyWithCompat} from '@/types/compatibility'
import {supabase} from '@/lib/supabase'
import {useRouter} from 'next/navigation'
import {useState} from 'react'

interface PropertiesTableProps {
    properties: Property[]
    onUpdate?: () => Promise<void>
}

export default function PropertiesTable({properties, onUpdate}: PropertiesTableProps) {
    const router = useRouter()
    const [processingId, setProcessingId] = useState<string | null>(null)
    
    // Convert properties to compatible format
    const compatProperties = properties.map(toPropertyWithCompat)

    const handleApprove = async (propertyId: string) => {
        console.log('승인 버튼 클릭됨 - propertyId:', propertyId)
        
        if (!confirm('이 매물을 승인하시겠습니까?')) {
            return
        }

        setProcessingId(propertyId)
        
        try {
            console.log('Supabase 업데이트 시작...')
            const {data, error} = await supabase
                .from('properties')
                .update({
                    status: 'APPROVED',
                    is_active: true,
                    approval_date: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', propertyId)
                .select()

            console.log('Supabase 응답:', { data, error })

            if (error) {
                console.error('승인 오류:', error)
                alert(`승인 실패: ${error.message}`)
                setProcessingId(null)
                return
            }

            alert('매물이 승인되었습니다.')
            
            // onUpdate 콜백이 있으면 호출, 없으면 페이지 새로고침
            if (onUpdate) {
                await onUpdate()
            } else {
                window.location.reload()
            }
        } catch (err) {
            console.error('승인 중 오류:', err)
            alert('승인 중 오류가 발생했습니다.')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (propertyId: string) => {
        console.log('거절 버튼 클릭됨 - propertyId:', propertyId)
        
        if (!confirm('이 매물을 거절하시겠습니까?')) {
            return
        }

        setProcessingId(propertyId)
        
        try {
            console.log('Supabase 업데이트 시작...')
            const {data, error} = await supabase
                .from('properties')
                .update({
                    status: 'REJECTED',
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', propertyId)
                .select()

            console.log('Supabase 응답:', { data, error })

            if (error) {
                console.error('거절 오류:', error)
                alert(`거절 실패: ${error.message}`)
                setProcessingId(null)
                return
            }

            alert('매물이 거절되었습니다.')
            
            // onUpdate 콜백이 있으면 호출, 없으면 페이지 새로고침
            if (onUpdate) {
                await onUpdate()
            } else {
                window.location.reload()
            }
        } catch (err) {
            console.error('거절 중 오류:', err)
            alert('거절 중 오류가 발생했습니다.')
        } finally {
            setProcessingId(null)
        }
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
                        {processingId === property.id ? (
                            <span className="text-gray-400">처리 중...</span>
                        ) : (
                            <>
                                {property.status === 'PENDING' && (
                                    <>
                                        <button
                                            className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                                            onClick={() => handleApprove(property.id)}
                                            disabled={processingId !== null}
                                        >
                                            승인
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            onClick={() => handleReject(property.id)}
                                            disabled={processingId !== null}
                                        >
                                            거절
                                        </button>
                                    </>
                                )}
                                {property.status === 'APPROVED' && (
                                    <button
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        onClick={() => handleReject(property.id)}
                                        disabled={processingId !== null}
                                    >
                                        승인 취소
                                    </button>
                                )}
                                {property.status === 'REJECTED' && (
                                    <button
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        onClick={() => handleApprove(property.id)}
                                        disabled={processingId !== null}
                                    >
                                        재승인
                                    </button>
                                )}
                            </>
                        )}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}