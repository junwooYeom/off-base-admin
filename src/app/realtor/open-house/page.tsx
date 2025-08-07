'use client'

import { useState } from 'react'

interface OpenHouse {
  id: string
  property_id: string
  property_title: string
  date: string
  start_time: string
  end_time: string
  visitors: number
  notes?: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export default function OpenHousePage() {
  const [openHouses] = useState<OpenHouse[]>([])
  const [view, setView] = useState<'calendar' | 'list'>('list')

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">오픈하우스 관리</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex space-x-3">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`relative inline-flex items-center px-4 py-2 rounded-l-md border text-sm font-medium ${
                view === 'list'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              목록
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`relative -ml-px inline-flex items-center px-4 py-2 rounded-r-md border text-sm font-medium ${
                view === 'calendar'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              캘린더
            </button>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            오픈하우스 등록
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {openHouses.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">예정된 오픈하우스가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새로운 오픈하우스를 등록하세요.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {openHouses.map((openHouse) => (
                <li key={openHouse.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {openHouse.property_title}
                      </p>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          openHouse.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                          openHouse.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {openHouse.status === 'SCHEDULED' ? '예정' :
                           openHouse.status === 'COMPLETED' ? '완료' : '취소'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {openHouse.date}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {openHouse.start_time} - {openHouse.end_time}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>방문자: {openHouse.visitors}명</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
          <p className="text-center text-gray-500">캘린더 뷰는 준비 중입니다.</p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">이번 주 예정</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">이번 달 총 방문자</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0명</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">평균 방문자 수</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0명</dd>
          </div>
        </div>
      </div>
    </div>
  )
}