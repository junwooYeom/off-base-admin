'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Loader2, Eye, X, Building2 } from 'lucide-react'

export default function CompanyEditPage() {
  const params = useParams()
  const router = useRouter()
  const companyId = params.id as string

  const [company, setCompany] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [companyId])

  const fetchCompany = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('realtor_companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!error && data) {
      setCompany(data)
    }
    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      alert('PDF, JPG, PNG 파일만 업로드 가능합니다')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다')
      return
    }

    setIsUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `companies/${companyId}/business_license.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('role-upgrade-documents')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('role-upgrade-documents')
        .getPublicUrl(fileName)

      // Update company with new business license URL
      const { error: updateError } = await supabase
        .from('realtor_companies')
        .update({ 
          business_license: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (updateError) throw updateError

      setCompany((prev: any) => ({ ...prev, business_license: publicUrl }))
      alert('사업자등록증이 업로드되었습니다')
    } catch (error) {
      console.error('Upload error:', error)
      alert('파일 업로드 중 오류가 발생했습니다')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async () => {
    if (!confirm('사업자등록증을 삭제하시겠습니까?')) return

    try {
      // Update company to remove business license
      const { error } = await supabase
        .from('realtor_companies')
        .update({ 
          business_license: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (error) throw error

      setCompany((prev: any) => ({ ...prev, business_license: null }))
      alert('사업자등록증이 삭제되었습니다')
    } catch (error) {
      console.error('Delete error:', error)
      alert('삭제 중 오류가 발생했습니다')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const { error } = await supabase
        .from('realtor_companies')
        .update({
          company_name: company.company_name,
          business_registration_number: company.business_registration_number,
          phone_number: company.phone_number,
          address: company.address,
          ceo_name: company.ceo_name,
          representative_name: company.representative_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)

      if (error) throw error

      alert('회사 정보가 업데이트되었습니다')
      router.push('/admin/verification/companies')
    } catch (error) {
      console.error('Save error:', error)
      alert('저장 중 오류가 발생했습니다')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-red-600">회사를 찾을 수 없습니다.</p>
        <Link href="/admin/verification/companies" className="text-blue-600 hover:underline mt-4 inline-block">
          ← 회사 목록으로 돌아가기
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
            <Link href="/admin/verification/companies" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">회사 정보 편집</h1>
              <p className="text-gray-600 mt-1">{company.company_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          회사 정보
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회사명
            </label>
            <input
              type="text"
              value={company.company_name || ''}
              onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자등록번호
            </label>
            <input
              type="text"
              value={company.business_registration_number || ''}
              onChange={(e) => setCompany({ ...company, business_registration_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              전화번호
            </label>
            <input
              type="text"
              value={company.phone_number || ''}
              onChange={(e) => setCompany({ ...company, phone_number: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              주소
            </label>
            <input
              type="text"
              value={company.address || ''}
              onChange={(e) => setCompany({ ...company, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표자명
            </label>
            <input
              type="text"
              value={company.ceo_name || company.representative_name || ''}
              onChange={(e) => setCompany({ ...company, ceo_name: e.target.value, representative_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              인증 상태
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              company.verification_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              company.verification_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {company.verification_status === 'APPROVED' ? '승인됨' :
               company.verification_status === 'PENDING' ? '대기중' : '거절됨'}
            </span>
          </div>
        </div>
      </div>

      {/* Business License */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          사업자등록증
        </h2>
        
        {company.business_license ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">사업자등록증</p>
                <p className="text-xs text-gray-500">업로드됨</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={company.business_license}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                보기
              </a>
              <button
                onClick={handleDeleteDocument}
                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              id="business-license-upload"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="business-license-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <span className="text-sm text-gray-600">
                {isUploading ? '업로드 중...' : '클릭하여 사업자등록증 업로드'}
              </span>
              <span className="text-xs text-gray-500">
                PDF, JPG, PNG (최대 10MB)
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3">
        <Link
          href="/admin/verification/companies"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          취소
        </Link>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}