'use client'

import { useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type DocumentType = 'business_registration' | 'id_card' | 'realtor_license'

interface UserDocumentUploaderProps {
  userId: string
  existingDocuments?: Array<{
    id: string
    document_url: string
    document_type: string
    document_name: string | null
    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
    created_at: string | null
  }>
  onUploadComplete?: () => void
}

const documentTypeLabels: Record<DocumentType, string> = {
  business_registration: '사업자 등록증',
  id_card: '신분증',
  realtor_license: '공인중개사 자격증'
}

export default function UserDocumentUploader({
  userId,
  existingDocuments = [],
  onUploadComplete
}: UserDocumentUploaderProps) {
  const [documents, setDocuments] = useState(existingDocuments)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('id_card')
  const supabase = createClientComponentClient()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if document type already exists
    const existingDoc = documents.find(doc => doc.document_type === selectedType)
    if (existingDoc) {
      if (!confirm(`이미 ${documentTypeLabels[selectedType]}이(가) 등록되어 있습니다. 교체하시겠습니까?`)) {
        return
      }
      // Delete existing document first
      await handleDelete(existingDoc.id, existingDoc.document_url)
    }

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

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `users/${userId}/documentation/${selectedType}.${fileExt}`

      // Delete old file if exists
      try {
        await supabase.storage
          .from('users')
          .remove([`users/${userId}/documentation/${selectedType}`])
      } catch (e) {
        // Ignore if file doesn't exist
      }

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('users')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('users')
        .getPublicUrl(fileName)

      // Save to database
      const { data: docData, error: dbError } = await supabase
        .from('user_verification_documents')
        .insert({
          user_id: userId,
          document_url: publicUrl,
          document_type: selectedType === 'business_registration' ? 'BUSINESS_LICENSE' : 
                        selectedType === 'id_card' ? 'ID_CARD' : 'OTHER',
          document_name: file.name,
          file_size: file.size,
          verification_status: 'PENDING'
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Update realtor_license_url if it's a realtor license
      if (selectedType === 'realtor_license') {
        await supabase
          .from('users')
          .update({ realtor_license_url: publicUrl })
          .eq('id', userId)
      }

      setDocuments(prev => [...prev, docData])
      
      if (onUploadComplete) onUploadComplete()
      
      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      alert('문서 업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: string, docUrl: string) => {
    if (!confirm('문서를 삭제하시겠습니까?')) return

    try {
      // Extract document type from URL
      const urlParts = docUrl.split('/')
      const docType = urlParts[urlParts.length - 1].split('.')[0]
      const filePath = `users/${userId}/documentation/${docType}`

      // Delete from storage
      await supabase.storage
        .from('users')
        .remove([filePath])

      // Delete from database
      await supabase
        .from('user_verification_documents')
        .delete()
        .eq('id', docId)

      // Clear realtor_license_url if it's a realtor license
      if (docType === 'realtor_license') {
        await supabase
          .from('users')
          .update({ realtor_license_url: null })
          .eq('id', userId)
      }

      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      
      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.error('Delete error:', error)
      alert('문서 삭제 중 오류가 발생했습니다')
    }
  }

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case 'APPROVED':
        return '승인됨'
      case 'REJECTED':
        return '거절됨'
      default:
        return '검토 대기'
    }
  }

  const getDocumentTypeFromDBType = (dbType: string): DocumentType | null => {
    switch (dbType) {
      case 'BUSINESS_LICENSE':
        return 'business_registration'
      case 'ID_CARD':
        return 'id_card'
      case 'OTHER':
        return 'realtor_license'
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Document Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          문서 유형
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          disabled={uploading}
        >
          {Object.entries(documentTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          id="user-document-upload"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="user-document-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {uploading ? '업로드 중...' : '문서를 클릭하여 업로드'}
          </span>
          <span className="text-xs text-gray-500">
            PDF, JPG, PNG (최대 10MB)
          </span>
        </label>
      </div>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">업로드된 문서</h3>
          {documents.map((doc) => {
            const docType = getDocumentTypeFromDBType(doc.document_type)
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {docType ? documentTypeLabels[docType] : doc.document_type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {doc.document_name || '문서'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(doc.verification_status)}
                    <span className="text-xs text-gray-600">
                      {getStatusLabel(doc.verification_status)}
                    </span>
                  </div>
                  
                  <a
                    href={doc.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    보기
                  </a>
                  
                  <button
                    onClick={() => handleDelete(doc.id, doc.document_url)}
                    className="text-red-600 hover:text-red-800"
                    title="삭제"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Required Documents Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-xs font-semibold text-blue-900 mb-1">필수 서류 안내</h4>
        <ul className="text-xs text-blue-800 space-y-0.5">
          <li>• <strong>사업자 등록증</strong>: 중개사무소 사업자 등록증</li>
          <li>• <strong>신분증</strong>: 주민등록증 또는 운전면허증</li>
          <li>• <strong>공인중개사 자격증</strong>: 공인중개사 자격증 사본</li>
        </ul>
      </div>
    </div>
  )
}