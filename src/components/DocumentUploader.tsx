'use client'

import { useState } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DocumentType } from '@/types/supabase'

interface DocumentUploaderProps {
  entityId: string // Can be property_id or user_id
  entityType: 'property' | 'user'
  existingDocuments?: Array<{
    id: string
    document_url: string
    document_type: DocumentType
    document_name: string | null
    verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
    created_at: string | null
  }>
  onUploadComplete?: () => void
}

const documentTypeLabels: Record<DocumentType, string> = {
  PROPERTY_OWNERSHIP: '소유권 증명서',
  BUSINESS_LICENSE: '사업자 등록증',
  ID_CARD: '신분증',
  CONTRACT: '계약서',
  OTHER: '기타'
}

export default function DocumentUploader({
  entityId,
  entityType,
  existingDocuments = [],
  onUploadComplete
}: DocumentUploaderProps) {
  const [documents, setDocuments] = useState(existingDocuments)
  const [uploading, setUploading] = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('OTHER')
  const supabase = createClientComponentClient()

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

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${entityType}/${entityId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Save to appropriate table
      const tableName = entityType === 'property' ? 'property_documents' : 'user_verification_documents'
      const idField = entityType === 'property' ? 'property_id' : 'user_id'

      const { data: docData, error: dbError } = await supabase
        .from(tableName)
        .insert({
          [idField]: entityId,
          document_url: publicUrl,
          document_type: selectedType,
          document_name: file.name,
          file_size: file.size,
          verification_status: 'PENDING'
        })
        .select()
        .single()

      if (dbError) throw dbError

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
      // Extract file path from URL
      const urlParts = docUrl.split('/storage/v1/object/public/documents/')
      const filePath = urlParts[1]

      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([filePath])

      // Delete from database
      const tableName = entityType === 'property' ? 'property_documents' : 'user_verification_documents'
      await supabase
        .from(tableName)
        .delete()
        .eq('id', docId)

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
          id="document-upload"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        <label
          htmlFor="document-upload"
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
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {documentTypeLabels[doc.document_type as DocumentType]}
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
          ))}
        </div>
      )}
    </div>
  )
}