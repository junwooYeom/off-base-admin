import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Document {
  id: string
  type: string
  url: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

interface DocumentReviewModalProps {
  isOpen: boolean
  onClose: () => void
  documents: Document[]
  onStatusChange: () => void
}

export default function DocumentReviewModal({
  isOpen,
  onClose,
  documents,
  onStatusChange
}: DocumentReviewModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleStatusChange = async (documentId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      setIsLoading(true)
      const { error } = await supabase
        .from('documents')
        .update({ status: newStatus })
        .eq('id', documentId)

      if (error) throw error
      
      onStatusChange()
    } catch (error) {
      console.error('Error updating document status:', error)
      alert('문서 상태 변경 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">문서 검토</h3>
        
        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{doc.type}</h4>
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    문서 보기
                  </a>
                </div>
                <div className="flex space-x-2">
                  {doc.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(doc.id, 'APPROVED')}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleStatusChange(doc.id, 'REJECTED')}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        거절
                      </button>
                    </>
                  )}
                  {doc.status !== 'PENDING' && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {doc.status === 'APPROVED' ? '승인됨' : '거절됨'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
} 