'use client'

import { useState } from 'react'

export default function BulkUploadPage() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload here
      console.log('Files:', e.dataTransfer.files)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">매물 대량 등록</h1>
      
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">CSV 파일 업로드</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>여러 매물을 한 번에 등록할 수 있습니다. CSV 파일 형식을 사용하세요.</p>
          </div>
          
          <div className="mt-5">
            <div
              className={`max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>파일 선택</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".csv" />
                  </label>
                  <p className="pl-1">또는 드래그 앤 드롭</p>
                </div>
                <p className="text-xs text-gray-500">CSV 파일만 가능 (최대 10MB)</p>
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              업로드
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">CSV 템플릿</h3>
          <div className="mt-2 text-sm text-gray-500">
            <p>아래 형식에 맞춰 CSV 파일을 작성하세요:</p>
            <div className="mt-3 bg-gray-50 rounded-md p-4">
              <code className="text-xs">
                제목,설명,가격,위치,침실수,욕실수,면적,주소,연락처
              </code>
            </div>
          </div>
          <div className="mt-5">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              템플릿 다운로드
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">최근 업로드 내역</h3>
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">업로드 내역이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}