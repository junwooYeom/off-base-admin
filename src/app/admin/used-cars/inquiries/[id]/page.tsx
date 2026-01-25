'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Phone,
  Mail,
  MessageSquare,
  Car,
  Calendar,
  User,
} from 'lucide-react'

interface Inquiry {
  id: string
  car_id: string
  user_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_email: string | null
  message: string | null
  inquiry_type: string
  status: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

interface CarInfo {
  id: string
  title: string
  price: number
  status: string
  dealer: { name: string } | { name: string }[] | null
}

export default function InquiryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inquiryId = params.id as string

  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [car, setCar] = useState<CarInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
  })

  const loadInquiry = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('car_inquiries')
        .select('*')
        .eq('id', inquiryId)
        .single()

      if (error) throw error

      setInquiry(data)
      setFormData({
        status: data.status,
        admin_notes: data.admin_notes || '',
      })

      // Load car info
      if (data.car_id) {
        const { data: carData } = await supabase
          .from('used_cars')
          .select(`
            id, title, price, status,
            dealer:dealers(name)
          `)
          .eq('id', data.car_id)
          .single()

        setCar(carData)
      }
    } catch (error) {
      console.error('Error loading inquiry:', error)
      alert('문의를 불러오는데 실패했습니다.')
      router.push('/admin/used-cars/inquiries')
    } finally {
      setLoading(false)
    }
  }, [inquiryId, router])

  useEffect(() => {
    loadInquiry()
  }, [loadInquiry])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('car_inquiries')
        .update({
          status: formData.status,
          admin_notes: formData.admin_notes || null,
        })
        .eq('id', inquiryId)

      if (error) throw error

      alert('저장되었습니다.')
      loadInquiry()
    } catch (error) {
      console.error('Error saving inquiry:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const quickUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('car_inquiries')
        .update({ status: newStatus })
        .eq('id', inquiryId)

      if (error) throw error

      setFormData({ ...formData, status: newStatus })
      loadInquiry()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: 'bg-red-100 text-red-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      SPAM: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: '신규',
      CONTACTED: '연락완료',
      IN_PROGRESS: '진행중',
      CLOSED: '종료',
      SPAM: '스팸',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      GENERAL: '일반문의',
      PRICE: '가격문의',
      TEST_DRIVE: '시승신청',
      PURCHASE: '구매문의',
      OTHER: '기타',
    }
    return labels[type] || type
  }

  const getCarStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      FOR_SALE: '판매중',
      SOLD: '판매완료',
      RESERVED: '예약중',
      DRAFT: '임시저장',
      HIDDEN: '숨김',
    }
    return labels[status] || status
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">문의를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/used-cars/inquiries"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">문의 상세</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(inquiry.status)}`}>
            {getStatusLabel(inquiry.status)}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">문의자 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium text-lg">{inquiry.contact_name}</p>
                </div>
              </div>
              {inquiry.contact_phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">연락처</p>
                    <a
                      href={`tel:${inquiry.contact_phone}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {inquiry.contact_phone}
                    </a>
                  </div>
                </div>
              )}
              {inquiry.contact_email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <a
                      href={`mailto:${inquiry.contact_email}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {inquiry.contact_email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">문의 내용</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {getTypeLabel(inquiry.inquiry_type)}
                </span>
                <span className="text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(inquiry.created_at)}
                </span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {inquiry.message || '메시지 내용 없음'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">관리자 메모</h2>
            <textarea
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="상담 내용, 처리 결과 등을 기록하세요..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">빠른 상태 변경</h2>
            <div className="space-y-2">
              {inquiry.status === 'NEW' && (
                <button
                  onClick={() => quickUpdateStatus('CONTACTED')}
                  className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200"
                >
                  연락 완료로 변경
                </button>
              )}
              {(inquiry.status === 'NEW' || inquiry.status === 'CONTACTED') && (
                <button
                  onClick={() => quickUpdateStatus('IN_PROGRESS')}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                >
                  진행중으로 변경
                </button>
              )}
              {inquiry.status !== 'CLOSED' && inquiry.status !== 'SPAM' && (
                <button
                  onClick={() => quickUpdateStatus('CLOSED')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  종료로 변경
                </button>
              )}
              {inquiry.status !== 'SPAM' && (
                <button
                  onClick={() => quickUpdateStatus('SPAM')}
                  className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                >
                  스팸으로 표시
                </button>
              )}
            </div>
          </div>

          {/* Status Select */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상태 변경</h2>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="NEW">신규</option>
              <option value="CONTACTED">연락완료</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="CLOSED">종료</option>
              <option value="SPAM">스팸</option>
            </select>
          </div>

          {/* Car Info */}
          {car && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">관련 차량</h2>
              <Link
                href={`/admin/used-cars/cars/${car.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <Car className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{car.title}</p>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(car.dealer) ? car.dealer[0]?.name : car.dealer?.name || '딜러 미지정'}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-blue-600 font-medium">
                        {formatPrice(car.price)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(car.status)}`}>
                        {getCarStatusLabel(car.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기록</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">문의일</span>
                <span className="text-gray-900">{formatDate(inquiry.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">수정일</span>
                <span className="text-gray-900">{formatDate(inquiry.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}