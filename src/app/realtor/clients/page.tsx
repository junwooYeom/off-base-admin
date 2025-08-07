'use client'

import { useState } from 'react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  type: 'BUYER' | 'SELLER' | 'BOTH'
  status: 'ACTIVE' | 'INACTIVE'
  last_interaction: string
  total_transactions: number
  notes?: string
  tags: string[]
}

interface Interaction {
  id: string
  client_id: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'SHOWING' | 'OTHER'
  date: string
  notes: string
}

export default function ClientsPage() {
  const [clients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">고객 관계 추적</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            고객 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">전체 고객</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">활성 고객</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">이번 주 상호작용</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">평균 거래 횟수</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">고객 목록</h3>
          </div>
          {clients.length === 0 ? (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">고객이 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새로운 고객을 추가하세요.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li 
                  key={client.id} 
                  className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        client.type === 'BUYER' ? 'bg-blue-100 text-blue-800' :
                        client.type === 'SELLER' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {client.type === 'BUYER' ? '구매자' :
                         client.type === 'SELLER' ? '판매자' : '구매/판매'}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">거래: {client.total_transactions}건</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {selectedClient ? selectedClient.name : '고객 상세 정보'}
            </h3>
          </div>
          {selectedClient ? (
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">이메일</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClient.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClient.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">고객 유형</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedClient.type === 'BUYER' ? '구매자' :
                     selectedClient.type === 'SELLER' ? '판매자' : '구매/판매'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">상태</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedClient.status === 'ACTIVE' ? '활성' : '비활성'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">마지막 상호작용</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClient.last_interaction}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">총 거래 횟수</dt>
                  <dd className="mt-1 text-sm text-gray-900">{selectedClient.total_transactions}건</dd>
                </div>
              </dl>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">태그</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700"
                >
                  상호작용 기록
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500">고객을 선택하면 상세 정보를 볼 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}