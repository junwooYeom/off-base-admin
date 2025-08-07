'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, FileText, Eye } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { DocumentType } from '@/types/supabase'

interface Document {
  id: string
  document_url: string
  document_type: DocumentType
  document_name: string | null
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  rejection_reason: string | null
  verified_at: string | null
  created_at: string | null
}

interface DocumentVerificationPanelProps {
  documents: Document[]
  entityType: 'property' | 'user'
}

const documentTypeLabels: Record<DocumentType, string> = {
  PROPERTY_OWNERSHIP: '소유권 증명서',
  BUSINESS_LICENSE: '사업자 등록증',
  ID_CARD: '신분증',
  CONTRACT: '계약서',
  OTHER: '기타'
}

export default function DocumentVerificationPanel({
  documents,
  entityType
}: DocumentVerificationPanelProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({})
  const [showReasonInput, setShowReasonInput] = useState<{ [key: string]: boolean }>({})
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleApprove = async (docId: string) => {
    setProcessing(docId)
    
    try {
      const tableName = entityType === 'property' ? 'property_documents' : 'user_verification_documents'
      
      const { error } = await supabase
        .from(tableName)
        .update({
          verification_status: 'APPROVED',
          verified_at: new Date().toISOString(),
          rejection_reason: null
        })
        .eq('id', docId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Approval error:', error)
      alert('승인 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (docId: string) => {
    const reason = rejectionReason[docId]
    if (!reason || reason.trim() === '') {
      alert('거절 사유를 입력해주세요')
      return
    }

    setProcessing(docId)
    
    try {
      const tableName = entityType === 'property' ? 'property_documents' : 'user_verification_documents'
      
      const { error } = await supabase
        .from(tableName)
        .update({
          verification_status: 'REJECTED',
          verified_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', docId)

      if (error) throw error

      // Clear the reason input
      setRejectionReason(prev => ({ ...prev, [docId]: '' }))
      setShowReasonInput(prev => ({ ...prev, [docId]: false }))
      
      router.refresh()
    } catch (error) {
      console.error('Rejection error:', error)
      alert('거절 처리 중 오류가 발생했습니다')
    } finally {
      setProcessing(null)
    }
  }

  const pendingDocs = documents.filter(doc => doc.verification_status === 'PENDING')
  const verifiedDocs = documents.filter(doc => doc.verification_status !== 'PENDING')

  if (documents.length === 0) return null

  return (
    <div className="space-y-6">
      {/* Pending Documents */}
      {pendingDocs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-yellow-700">
            검토 대기 문서 ({pendingDocs.length})
          </h2>
          <div className="space-y-4">
            {pendingDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {documentTypeLabels[doc.document_type]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.document_name || '문서'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        업로드: {doc.created_at && new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>확인</span>
                    </a>
                    
                    <button
                      onClick={() => handleApprove(doc.id)}
                      disabled={processing === doc.id}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>승인</span>
                    </button>
                    
                    <button
                      onClick={() => setShowReasonInput(prev => ({ ...prev, [doc.id]: !prev[doc.id] }))}
                      disabled={processing === doc.id}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>거절</span>
                    </button>
                  </div>
                </div>
                
                {/* Rejection Reason Input */}
                {showReasonInput[doc.id] && (
                  <div className="mt-3 pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      거절 사유
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={rejectionReason[doc.id] || ''}
                        onChange={(e) => setRejectionReason(prev => ({ 
                          ...prev, 
                          [doc.id]: e.target.value 
                        }))}
                        placeholder="거절 사유를 입력하세요"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={() => handleReject(doc.id)}
                        disabled={processing === doc.id}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Documents */}
      {verifiedDocs.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">검토 완료 문서</h2>
          <div className="space-y-3">
            {verifiedDocs.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {documentTypeLabels[doc.document_type]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {doc.document_name || '문서'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {doc.verification_status === 'APPROVED' ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-600">승인됨</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-600" />
                          <span className="text-sm text-red-600">거절됨</span>
                        </>
                      )}
                    </div>
                    
                    <a
                      href={doc.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      보기
                    </a>
                  </div>
                </div>
                
                {doc.rejection_reason && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    거절 사유: {doc.rejection_reason}
                  </div>
                )}
                
                {doc.verified_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    검토일: {new Date(doc.verified_at).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}