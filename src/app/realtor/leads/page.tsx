'use client'

import { useState, useEffect } from 'react'
import { realtorQueries } from '@/lib/supabase-realtor'
import { Lead, LeadInsert } from '@/types/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filter, setFilter] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadLeads()
    }
  }, [user, filter])

  const loadLeads = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      const { data, error } = await realtorQueries.leads.getAll(user.id, {
        status: filter === 'ALL' ? undefined : filter
      })
      if (error) throw error
      setLeads(data || [])
    } catch (error) {
      console.error('Error loading leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLead = async (lead: LeadInsert) => {
    if (!user) return
    
    try {
      const { error } = await realtorQueries.leads.create(user.id, lead)
      if (error) throw error
      await loadLeads()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding lead:', error)
    }
  }

  const handleStatusUpdate = async (leadId: string, status: string) => {
    try {
      const { error } = await realtorQueries.leads.update(leadId, { status: status as any })
      if (error) throw error
      await loadLeads()
    } catch (error) {
      console.error('Error updating lead status:', error)
    }
  }

  const statusColors = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-purple-100 text-purple-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    CLOSED: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    NEW: '신규',
    CONTACTED: '연락됨',
    QUALIFIED: '적격',
    NEGOTIATION: '협상중',
    CLOSED: '성사',
    LOST: '실패'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">리드 관리 CRM</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            리드 추가
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NEGOTIATION', 'CLOSED', 'LOST'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                  ${filter === status
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {status === 'ALL' ? '전체' : statusLabels[status as keyof typeof statusLabels]}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {leads.length === 0 ? (
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">리드가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">새로운 리드를 추가하여 시작하세요.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <li key={lead.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate">{lead.name}</p>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[lead.status]}`}>
                          {statusLabels[lead.status]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <button className="text-sm text-gray-500 hover:text-gray-700">상세보기</button>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {lead.email}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        {lead.phone}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>출처: {lead.source}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}