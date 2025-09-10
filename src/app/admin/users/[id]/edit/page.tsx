import { supabase } from '@/lib/supabase'
import ProfileImageUploader from '@/components/ProfileImageUploader'
import UserDocumentUploader from '@/components/UserDocumentUploader'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function getUser(id: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      *,
      realtor_company:realtor_companies (
        id,
        company_name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  // Get user documents
  const { data: documents } = await supabase
    .from('user_verification_documents')
    .select('*')
    .eq('user_id', id)

  return { ...user, documents: documents || [] }
}

export default async function UserEditPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">사용자를 찾을 수 없습니다</p>
      </div>
    )
  }

  const isRealtor = user.user_type === 'REALTOR'

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
              <h1 className="text-2xl font-bold text-gray-900">사용자 프로필 편집</h1>
              <p className="text-gray-600 mt-1">{user.full_name} ({user.email})</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">사용자 유형:</span>
            <span className="ml-2 font-medium">
              {user.user_type === 'ADMIN' ? '관리자' :
               user.user_type === 'REALTOR' ? '공인중개사' :
               user.user_type === 'TENANT' ? '세입자' : '임대인'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">전화번호:</span>
            <span className="ml-2 font-medium">{user.phone_number || '-'}</span>
          </div>
          <div>
            <span className="text-gray-600">가입일:</span>
            <span className="ml-2 font-medium">
              {user.created_at && new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
          {isRealtor && user.realtor_company && (
            <div className="md:col-span-2">
              <span className="text-gray-600">소속 회사:</span>
              <span className="ml-2 font-medium">{user.realtor_company.company_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Image */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">프로필 이미지</h2>
        <ProfileImageUploader
          userId={id}
          currentImageUrl={user.profile_image_url}
        />
      </div>

      {/* Documents Section - Only for Realtors */}
      {isRealtor && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">인증 서류</h2>
          <UserDocumentUploader
            userId={id}
            existingDocuments={user.documents}
          />
        </div>
      )}

      {/* Additional Info for Realtors */}
      {isRealtor && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">공인중개사 정보</h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-600">중개사 등록번호:</span>
              <span className="ml-2 font-medium">
                {user.realtor_registration_number || '미등록'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">자격증 URL:</span>
              {user.realtor_license_url ? (
                <a 
                  href={user.realtor_license_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  자격증 보기
                </a>
              ) : (
                <span className="ml-2 text-gray-400">미등록</span>
              )}
            </div>
            <div>
              <span className="text-gray-600">등록 매물 수:</span>
              <span className="ml-2 font-medium">{user.properties_count || 0}개</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">연락처 정보</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">이메일:</span>
            <span className="ml-2 font-medium">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-600">전화번호:</span>
            <span className="ml-2 font-medium">{user.phone_number || '미등록'}</span>
          </div>
          <div>
            <span className="text-gray-600">카카오톡 ID:</span>
            <span className="ml-2 font-medium">{user.kakao_id || '미등록'}</span>
          </div>
          <div>
            <span className="text-gray-600">WhatsApp:</span>
            <span className="ml-2 font-medium">{user.whatsapp_number || '미등록'}</span>
          </div>
        </div>
      </div>

      {/* Activity Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">활동 정보</h2>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-gray-600">계정 상태:</span>
            <span className={`ml-2 font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
              {user.is_active ? '활성' : '비활성'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">마지막 로그인:</span>
            <span className="ml-2 font-medium">
              {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '기록 없음'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">업데이트:</span>
            <span className="ml-2 font-medium">
              {user.updated_at ? new Date(user.updated_at).toLocaleString() : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}