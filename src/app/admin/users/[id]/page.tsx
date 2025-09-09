'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { UserWithCompat, toUserWithCompat } from '@/types/compatibility'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Calendar, Shield, Building2, FileText, Eye, CheckCircle } from 'lucide-react'


export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string

  const [user, setUser] = useState<UserWithCompat | null>(null)
  const [realtorCompany, setRealtorCompany] = useState<any>(null)
  const [verificationDocs, setVerificationDocs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true)
      
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (!userError && userData) {
        setUser(toUserWithCompat(userData))
        
        // If user is a realtor, fetch additional data
        if (userData.user_type === 'REALTOR') {
          // Fetch realtor company
          if (userData.realtor_company_id) {
            const { data: companyData } = await supabase
              .from('realtor_companies')
              .select('*')
              .eq('id', userData.realtor_company_id)
              .single()
            
            if (companyData) {
              setRealtorCompany(companyData)
            }
          }
          
          // Fetch verification documents
          const { data: docsData } = await supabase
            .from('user_verification_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
          
          if (docsData) {
            setVerificationDocs(docsData)
          }
        }
      }
      
      setIsLoading(false)
    }
    fetchUser()
  }, [userId]) // Add dependency array to prevent infinite loop


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">사용자를 찾을 수 없습니다.</p>
        <Link href="/admin/users" className="text-blue-600 hover:underline mt-4 inline-block">
          ← 사용자 목록으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">사용자 상세 정보</h1>
              <p className="text-gray-600 mt-1">{user.full_name || user.email}</p>
            </div>
          </div>
          <Link 
            href={`/admin/users/${userId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            편집
          </Link>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          기본 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">이메일:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">사용자 유형:</span>
            <span className="font-medium">
              {user.user_type === 'ADMIN' ? '관리자' :
               user.user_type === 'REALTOR' ? '공인중개사' :
               user.user_type === 'LANDLORD' ? '임대인' : '세입자'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">가입일:</span>
            <span className="font-medium">{new Date(user.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>

      {/* Realtor Information - Only show for REALTOR users */}
      {user.user_type === 'REALTOR' && (
        <>
          {/* Realtor Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              공인중개사 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">공인중개사 등록번호:</span>
                <span className="font-medium ml-2">
                  {user.realtor_registration_number || '정보 없음'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">인증일:</span>
                <span className="font-medium ml-2">
                  {user.verified_at ? new Date(user.verified_at).toLocaleDateString('ko-KR') : '정보 없음'}
                </span>
              </div>
              {user.realtor_license_url && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">공인중개사 자격증:</span>
                  <a
                    href={user.realtor_license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    <span>자격증 보기</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Company Information */}
          {realtorCompany && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                소속 회사 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">회사명:</span>
                  <span className="font-medium ml-2">{realtorCompany.company_name || realtorCompany.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">사업자등록번호:</span>
                  <span className="font-medium ml-2">
                    {realtorCompany.business_registration_number || realtorCompany.registration_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">전화번호:</span>
                  <span className="font-medium ml-2">
                    {realtorCompany.phone_number || realtorCompany.phone || '정보 없음'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">주소:</span>
                  <span className="font-medium ml-2">{realtorCompany.address || '정보 없음'}</span>
                </div>
                <div>
                  <span className="text-gray-600">인증 상태:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    realtorCompany.verification_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    realtorCompany.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {realtorCompany.verification_status === 'APPROVED' ? '승인됨' :
                     realtorCompany.verification_status === 'PENDING' ? '대기중' : '거절됨'}
                  </span>
                </div>
                {realtorCompany.business_license && realtorCompany.business_license.startsWith('https://') && (
                  <div>
                    <span className="text-gray-600">사업자등록증:</span>
                    <a
                      href={realtorCompany.business_license}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 ml-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>등록증 보기</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Verification Documents */}
          {verificationDocs && verificationDocs.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                제출 서류 ({verificationDocs.length}개)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {verificationDocs.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <p className="font-medium text-sm">
                            {doc.document_type === 'ID_CARD' ? '신분증' :
                             doc.document_type === 'BUSINESS_LICENSE' ? '사업자등록증' :
                             doc.document_type === 'REALTOR_LICENSE' ? '공인중개사 자격증' :
                             doc.document_type || '기타 서류'}
                          </p>
                        </div>
                        {doc.document_name && (
                          <p className="text-xs text-gray-600 mb-1">{doc.document_name}</p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {doc.verification_status === 'APPROVED' ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">승인됨</span>
                            </>
                          ) : doc.verification_status === 'PENDING' ? (
                            <span className="text-yellow-600">대기중</span>
                          ) : (
                            <span className="text-red-600">거절됨</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(doc.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      {doc.document_url && (
                        <a
                          href={doc.document_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          <Eye className="h-3 w-3" />
                          <span>보기</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
} 