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
  User,
  Car,
  Calendar,
  DollarSign,
  MapPin,
  Fuel,
  Settings,
} from 'lucide-react'

interface CarRequest {
  id: string
  user_id: string | null
  contact_name: string
  contact_phone: string | null
  contact_email: string | null
  preferred_make: string | null
  preferred_model: string | null
  preferred_year_min: number | null
  preferred_year_max: number | null
  budget_min: number | null
  budget_max: number | null
  preferred_fuel_type: string | null
  preferred_transmission: string | null
  preferred_location: string | null
  description: string | null
  status: string
  admin_notes: string | null
  matched_car_id: string | null
  created_at: string
  updated_at: string
}

interface MatchedCar {
  id: string
  title: string
  price: number
  status: string
}

export default function CarRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [request, setRequest] = useState<CarRequest | null>(null)
  const [matchedCar, setMatchedCar] = useState<MatchedCar | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
  })

  const loadRequest = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('car_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (error) throw error

      setRequest(data)
      setFormData({
        status: data.status,
        admin_notes: data.admin_notes || '',
      })

      // Load matched car if exists
      if (data.matched_car_id) {
        const { data: carData } = await supabase
          .from('used_cars')
          .select('id, title, price, status')
          .eq('id', data.matched_car_id)
          .single()

        setMatchedCar(carData)
      }
    } catch (error) {
      console.error('Error loading car request:', error)
      alert('요청을 불러오는데 실패했습니다.')
      router.push('/admin/used-cars/requests')
    } finally {
      setLoading(false)
    }
  }, [requestId, router])

  useEffect(() => {
    loadRequest()
  }, [loadRequest])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('car_requests')
        .update({
          status: formData.status,
          admin_notes: formData.admin_notes || null,
        })
        .eq('id', requestId)

      if (error) throw error

      alert('저장되었습니다.')
      loadRequest()
    } catch (error) {
      console.error('Error saving car request:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const quickUpdateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('car_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

      if (error) throw error

      setFormData({ ...formData, status: newStatus })
      loadRequest()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      MATCHED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: '대기중',
      IN_PROGRESS: '진행중',
      MATCHED: '매칭됨',
      COMPLETED: '완료',
      CANCELLED: '취소',
    }
    return labels[status] || status
  }

  const getFuelTypeLabel = (type: string | null) => {
    if (!type) return '-'
    const labels: Record<string, string> = {
      GASOLINE: '가솔린',
      DIESEL: '디젤',
      HYBRID: '하이브리드',
      ELECTRIC: '전기',
      LPG: 'LPG',
    }
    return labels[type] || type
  }

  const getTransmissionLabel = (type: string | null) => {
    if (!type) return '-'
    const labels: Record<string, string> = {
      AUTOMATIC: '자동',
      MANUAL: '수동',
      CVT: 'CVT',
      DCT: 'DCT',
    }
    return labels[type] || type
  }

  const getLocationLabel = (location: string | null) => {
    if (!location) return '-'
    const labels: Record<string, string> = {
      PYEONGTAEK: '평택',
      OSAN: '오산',
      DONGDUCHEON: '동두천',
      HUMPHREYS: '험프리스',
    }
    return labels[location] || location
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
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

  if (!request) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">요청을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/used-cars/requests"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">차량 요청 상세</h1>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(request.status)}`}>
            {getStatusLabel(request.status)}
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">요청자 정보</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">이름</p>
                  <p className="font-medium text-lg">{request.contact_name}</p>
                </div>
              </div>
              {request.contact_phone && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">연락처</p>
                    <a
                      href={`tel:${request.contact_phone}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {request.contact_phone}
                    </a>
                  </div>
                </div>
              )}
              {request.contact_email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">이메일</p>
                    <a
                      href={`mailto:${request.contact_email}`}
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {request.contact_email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">희망 조건</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start">
                <Car className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">희망 차량</p>
                  <p className="font-medium">
                    {request.preferred_make || '제조사 무관'} {request.preferred_model || ''}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">희망 연식</p>
                  <p className="font-medium">
                    {request.preferred_year_min || request.preferred_year_max
                      ? `${request.preferred_year_min || '?'} - ${request.preferred_year_max || '?'}년`
                      : '연식 무관'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <DollarSign className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">예산</p>
                  <p className="font-medium">
                    {request.budget_min || request.budget_max
                      ? `${formatPrice(request.budget_min)} ~ ${formatPrice(request.budget_max)}`
                      : '예산 무관'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">희망 지역</p>
                  <p className="font-medium">{getLocationLabel(request.preferred_location)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Fuel className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">희망 연료</p>
                  <p className="font-medium">{getFuelTypeLabel(request.preferred_fuel_type)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Settings className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">변속기</p>
                  <p className="font-medium">{getTransmissionLabel(request.preferred_transmission)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">추가 요청사항</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          )}

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
              {request.status === 'PENDING' && (
                <button
                  onClick={() => quickUpdateStatus('IN_PROGRESS')}
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                >
                  진행중으로 변경
                </button>
              )}
              {(request.status === 'PENDING' || request.status === 'IN_PROGRESS') && (
                <button
                  onClick={() => quickUpdateStatus('MATCHED')}
                  className="w-full px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200"
                >
                  매칭됨으로 변경
                </button>
              )}
              {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && (
                <button
                  onClick={() => quickUpdateStatus('COMPLETED')}
                  className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200"
                >
                  완료로 변경
                </button>
              )}
              {request.status !== 'CANCELLED' && (
                <button
                  onClick={() => quickUpdateStatus('CANCELLED')}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  취소로 변경
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
              <option value="PENDING">대기중</option>
              <option value="IN_PROGRESS">진행중</option>
              <option value="MATCHED">매칭됨</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELLED">취소</option>
            </select>
          </div>

          {/* Matched Car */}
          {matchedCar && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">매칭된 차량</h2>
              <Link
                href={`/admin/used-cars/cars/${matchedCar.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start">
                  <Car className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{matchedCar.title}</p>
                    <p className="text-blue-600 font-medium mt-1">
                      {formatPrice(matchedCar.price)}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Find Matching Cars */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">차량 찾기</h2>
            <Link
              href={`/admin/used-cars/cars?${new URLSearchParams({
                ...(request.preferred_make ? { make: request.preferred_make } : {}),
                status: 'FOR_SALE',
              }).toString()}`}
              className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700"
            >
              조건에 맞는 차량 검색
            </Link>
          </div>

          {/* Timestamps */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">기록</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">요청일</span>
                <span className="text-gray-900">{formatDate(request.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">수정일</span>
                <span className="text-gray-900">{formatDate(request.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}