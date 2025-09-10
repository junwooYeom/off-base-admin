'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[UserDocumentUploader] Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      })
      
      if (session?.user?.id) {
        setCurrentUserId(session.user.id)
        
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
        
        const userIsAdmin = adminCheck?.user_type === 'ADMIN'
        setIsAdmin(userIsAdmin)
        
        console.log('[UserDocumentUploader] Auth state:', {
          currentUserId: session.user.id,
          userType: adminCheck?.user_type,
          isAdmin: userIsAdmin,
          uploadingForUserId: userId
        })
      }
    }
    
    checkAuth()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('[UserDocumentUploader] No file selected')
      return
    }

    console.log('[UserDocumentUploader] File upload started:', {
      name: file.name,
      type: file.type,
      size: file.size,
      selectedType: selectedType,
      uploadingForUserId: userId,
      currentUserId: currentUserId,
      isAdmin: isAdmin,
      pathWillBe: `${userId}/documentation/${selectedType}`
    })
    
    // For admin pages, we'll use the admin API regardless of auth status
    // Check if we're in an admin page by checking the URL
    const isAdminPage = window.location.pathname.startsWith('/admin/')
    
    if (!isAdminPage) {
      // Only check authentication for non-admin pages
      if (!currentUserId) {
        console.error('[UserDocumentUploader] No authenticated user found!')
        alert('인증 세션이 만료되었습니다. 페이지를 새로고침해주세요.')
        return
      }
      
      // Verify admin status if uploading for another user
      if (userId !== currentUserId && !isAdmin) {
        console.error('[UserDocumentUploader] Non-admin trying to upload for another user')
        alert('다른 사용자의 문서를 업로드할 권한이 없습니다.')
        return
      }
    } else {
      console.log('[UserDocumentUploader] Admin page detected, will use admin API')
    }

    // Check if document type already exists
    const existingDoc = documents.find(doc => doc.document_type === selectedType)
    if (existingDoc) {
      console.log('[UserDocumentUploader] Existing document found:', existingDoc)
      if (!confirm(`이미 ${documentTypeLabels[selectedType]}이(가) 등록되어 있습니다. 교체하시겠습니까?`)) {
        return
      }
      // Delete existing document first
      await handleDelete(existingDoc.id, existingDoc.document_url)
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      console.log('[UserDocumentUploader] Invalid file type:', file.type)
      alert('PDF, JPG, PNG 파일만 업로드 가능합니다')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('[UserDocumentUploader] File too large:', file.size)
      alert('파일 크기는 10MB 이하여야 합니다')
      return
    }

    setUploading(true)
    console.log('[UserDocumentUploader] Starting upload...')

    try {
      let publicUrl: string
      let docData: any
      
      // Check if we should use admin API 
      // Use admin API if:
      // 1. We're on an admin page (regardless of auth)
      // 2. No auth session exists
      // 3. Uploading for a different user
      const isAdminPageUpload = window.location.pathname.startsWith('/admin/')
      const useAdminApi = isAdminPageUpload || !currentUserId || (currentUserId && userId !== currentUserId)
      
      if (useAdminApi) {
        console.log('[UserDocumentUploader] Using admin API for upload', {
          isAdminPageUpload,
          currentUserId,
          userId,
          useAdminApi
        })
        
        // Use admin API route
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId)
        formData.append('documentType', selectedType)
        formData.append('bucket', 'role-upgrade-documents')
        
        console.log('[UserDocumentUploader] Calling admin API...')
        const response = await fetch('/api/admin/upload/document', {
          method: 'POST',
          body: formData
        })
        
        console.log('[UserDocumentUploader] Admin API response status:', response.status)
        
        if (!response.ok) {
          let errorMessage = 'Upload failed'
          try {
            const error = await response.json()
            console.error('[UserDocumentUploader] Admin API error response:', error)
            errorMessage = error.error || errorMessage
          } catch (e) {
            console.error('[UserDocumentUploader] Failed to parse error response:', e)
          }
          throw new Error(errorMessage)
        }
        
        const result = await response.json()
        console.log('[UserDocumentUploader] Admin API response data:', result)
        
        publicUrl = result.data.publicUrl
        docData = result.data.document
        
        console.log('[UserDocumentUploader] Admin API upload successful:', {
          publicUrl,
          docData
        })
      } else {
        console.log('[UserDocumentUploader] Using regular upload (user uploading own document)')
        
        // Regular user upload - use Supabase client
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/documentation/${selectedType}.${fileExt}`
        
        console.log('[UserDocumentUploader] Upload config:', {
          bucket: 'role-upgrade-documents',
          fileName: fileName,
          fileExt: fileExt
        })

        // Delete old file if exists
        try {
          console.log('[UserDocumentUploader] Attempting to delete old file...')
          const { error: removeError } = await supabase.storage
            .from('role-upgrade-documents')
            .remove([`${userId}/documentation/${selectedType}`])
          if (removeError) {
            console.log('[UserDocumentUploader] Delete old file error (non-fatal):', removeError)
          }
        } catch (e) {
          console.log('[UserDocumentUploader] Delete old file exception (non-fatal):', e)
        }

        // Upload to Supabase Storage
        console.log('[UserDocumentUploader] Uploading file to storage...')
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('role-upgrade-documents')
          .upload(fileName, file, { upsert: true })

        if (uploadError) {
          console.log('[UserDocumentUploader] Upload error:', uploadError)
          throw uploadError
        }
        
        console.log('[UserDocumentUploader] Upload successful:', uploadData)
        
        // Get public URL
        const { data: { publicUrl: url } } = supabase.storage
          .from('role-upgrade-documents')
          .getPublicUrl(fileName)
        
        publicUrl = url
        
        // Save to database for regular users
        const dbDocumentType = selectedType === 'business_registration' ? 'BUSINESS_LICENSE' : 
                               selectedType === 'id_card' ? 'ID_CARD' : 'OTHER'
        
        console.log('[UserDocumentUploader] Saving to database:', {
          user_id: userId,
          document_type: dbDocumentType,
          document_name: file.name,
          file_size: file.size
        })
        
        const { data: doc, error: dbError } = await supabase
          .from('user_verification_documents')
          .insert({
            user_id: userId,
            document_url: publicUrl,
            document_type: dbDocumentType,
            document_name: file.name,
            file_size: file.size,
            verification_status: 'PENDING'
          })
          .select()
          .single()

        if (dbError) {
          console.log('[UserDocumentUploader] Database error:', dbError)
          throw dbError
        }
        
        docData = doc
        console.log('[UserDocumentUploader] Database save successful:', docData)

        // Update user URLs based on document type
        if (selectedType === 'realtor_license') {
          console.log('[UserDocumentUploader] Updating realtor_license_url in users table')
          const { error: updateError } = await supabase
            .from('users')
            .update({ realtor_license_url: publicUrl })
            .eq('id', userId)
          if (updateError) {
            console.log('[UserDocumentUploader] Error updating realtor_license_url:', updateError)
          }
        } else if (selectedType === 'id_card') {
          console.log('[UserDocumentUploader] Updating id_card_url in users table')
          const { error: updateError } = await supabase
            .from('users')
            .update({ id_card_url: publicUrl })
            .eq('id', userId)
          if (updateError) {
            console.log('[UserDocumentUploader] Error updating id_card_url:', updateError)
          }
        }
      }

      // Add document to state (docData comes from either admin API or regular upload)
      if (docData) {
        setDocuments(prev => [...prev, docData])
      }
      
      if (onUploadComplete) onUploadComplete()
      
      // Reset input
      e.target.value = ''
      console.log('[UserDocumentUploader] Upload process completed successfully')
    } catch (error) {
      console.warn('[UserDocumentUploader] Upload error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`문서 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
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
      const filePath = `${userId}/documentation/${docType}`

      // Delete from storage
      await supabase.storage
        .from('role-upgrade-documents')
        .remove([filePath])

      // Delete from database
      await supabase
        .from('user_verification_documents')
        .delete()
        .eq('id', docId)

      // Clear user URLs based on document type
      if (docType === 'realtor_license') {
        await supabase
          .from('users')
          .update({ realtor_license_url: null })
          .eq('id', userId)
      } else if (docType === 'id_card') {
        await supabase
          .from('users')
          .update({ id_card_url: null })
          .eq('id', userId)
      }

      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      
      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.warn('Delete error:', error)
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