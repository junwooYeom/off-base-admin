'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  User,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react'

interface ItemDetail {
  id: string
  title: string
  description: string
  price: number
  currency: string
  status: string
  moderation_status: string
  moderation_notes: string | null
  rejection_reason: string | null
  condition: string
  location_type: string
  meetup_location: string | null
  shipping_available: boolean
  is_negotiable: boolean
  is_urgent: boolean
  is_featured: boolean
  view_count: number
  favorite_count: number
  inquiry_count: number
  risk_score: number
  created_at: string
  updated_at: string
  seller: { id: string; name: string; email: string; phone: string } | null
  category: { id: string; name: string; name_ko: string } | null
  images: { id: string; image_url: string; is_primary: boolean; display_order: number }[]
}

interface SellerProfile {
  marketplace_status: string
  seller_rating: number | null
  total_sales: number
  completed_transactions: number
  is_verified_seller: boolean
  warning_count: number
  risk_score: number
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [item, setItem] = useState<ItemDetail | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    loadItem()
  }, [id])

  const loadItem = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          seller:users(id, name, email, phone),
          category:marketplace_categories(id, name, name_ko),
          images:marketplace_item_images(id, image_url, is_primary, display_order)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setItem(data)

      // Load seller profile
      if (data.seller?.id) {
        const { data: profile } = await supabase
          .from('marketplace_user_profiles')
          .select('*')
          .eq('user_id', data.seller.id)
          .single()

        setSellerProfile(profile)
      }
    } catch (error) {
      console.error('Error loading item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, reason?: string) => {
    setActionLoading(true)
    try {
      let updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

      switch (action) {
        case 'approve':
          updateData = { ...updateData, moderation_status: 'APPROVED', status: 'ACTIVE' }
          break
        case 'reject':
          updateData = {
            ...updateData,
            moderation_status: 'REJECTED',
            status: 'HIDDEN',
            rejection_reason: reason,
            moderation_notes: reason,
          }
          break
        case 'hide':
          updateData = { ...updateData, status: 'HIDDEN' }
          break
        case 'unhide':
          updateData = { ...updateData, status: 'ACTIVE' }
          break
        case 'delete':
          updateData = { ...updateData, status: 'DELETED', deleted_at: new Date().toISOString() }
          break
        case 'feature':
          updateData = { ...updateData, is_featured: !item?.is_featured }
          break
        default:
          return
      }

      const { error } = await supabase
        .from('marketplace_items')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      setShowRejectModal(false)
      setRejectReason('')
      loadItem()
    } catch (error) {
      console.error('Error performing action:', error)
      alert('작업 중 오류가 발생했습니다.')
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      SOLD: 'bg-blue-100 text-blue-800',
      RESERVED: 'bg-purple-100 text-purple-800',
      HIDDEN: 'bg-gray-100 text-gray-800',
      DELETED: 'bg-red-100 text-red-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getModerationBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      FLAGGED: 'bg-orange-100 text-orange-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      NEW: '새 상품',
      LIKE_NEW: '거의 새것',
      GOOD: '양호',
      FAIR: '보통',
      POOR: '하자 있음',
    }
    return labels[condition] || condition
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">아이템을 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                {item.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getModerationBadge(item.moderation_status)}`}>
                {item.moderation_status}
              </span>
              {item.is_featured && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {item.moderation_status === 'PENDING' && (
            <>
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> 승인
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> 거절
              </button>
            </>
          )}
          {item.status === 'ACTIVE' ? (
            <button
              onClick={() => handleAction('hide')}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4 mr-2" /> 숨김
            </button>
          ) : item.status === 'HIDDEN' && (
            <button
              onClick={() => handleAction('unhide')}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" /> 숨김 해제
            </button>
          )}
          <button
            onClick={() => handleAction('feature')}
            disabled={actionLoading}
            className={`flex items-center px-4 py-2 border rounded-lg disabled:opacity-50 ${
              item.is_featured
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item.is_featured ? '추천 해제' : '추천'}
          </button>
          <button
            onClick={() => {
              if (confirm('정말 삭제하시겠습니까?')) {
                handleAction('delete')
              }
            }}
            disabled={actionLoading}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" /> 삭제
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">이미지</h2>
            {item.images && item.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.images
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((image) => (
                    <div key={image.id} className="relative">
                      <img
                        src={image.image_url}
                        alt="Item image"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      {image.is_primary && (
                        <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                          대표
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                이미지가 없습니다
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상품 설명</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description || '설명이 없습니다.'}</p>
          </div>

          {/* Rejection Reason */}
          {item.moderation_status === 'REJECTED' && item.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-medium text-red-800 mb-2">거절 사유</h2>
              <p className="text-red-700">{item.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Item Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">상품 정보</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">가격</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900">
                  {formatPrice(item.price, item.currency)}
                  {item.is_negotiable && (
                    <span className="ml-2 text-sm font-normal text-gray-500">(협의 가능)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">카테고리</dt>
                <dd className="mt-1 text-gray-900">{item.category?.name_ko || item.category?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1 text-gray-900">{getConditionLabel(item.condition)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">지역</dt>
                <dd className="mt-1 text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {item.location_type}
                  {item.meetup_location && ` · ${item.meetup_location}`}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">배송</dt>
                <dd className="mt-1 text-gray-900">{item.shipping_available ? '가능' : '불가'}</dd>
              </div>
              {item.is_urgent && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <span className="text-orange-800 font-medium">급매</span>
                </div>
              )}
            </dl>
          </div>

          {/* Stats */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">통계</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex justify-center">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.view_count}</p>
                <p className="text-xs text-gray-500">조회</p>
              </div>
              <div>
                <div className="flex justify-center">
                  <Heart className="w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.favorite_count}</p>
                <p className="text-xs text-gray-500">찜</p>
              </div>
              <div>
                <div className="flex justify-center">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.inquiry_count}</p>
                <p className="text-xs text-gray-500">문의</p>
              </div>
            </div>
            {item.risk_score > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">위험 점수: {item.risk_score}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">판매자 정보</h2>
            {item.seller ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{item.seller.name}</p>
                    <p className="text-sm text-gray-500">{item.seller.email}</p>
                  </div>
                </div>
                {sellerProfile && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">평점</span>
                      <span className="text-gray-900">
                        {sellerProfile.seller_rating ? `${sellerProfile.seller_rating.toFixed(1)} / 5.0` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">거래 완료</span>
                      <span className="text-gray-900">{sellerProfile.completed_transactions}건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">상태</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        sellerProfile.marketplace_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sellerProfile.marketplace_status}
                      </span>
                    </div>
                    {sellerProfile.is_verified_seller && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        인증된 판매자
                      </div>
                    )}
                    {sellerProfile.warning_count > 0 && (
                      <div className="flex items-center text-yellow-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        경고 {sellerProfile.warning_count}회
                      </div>
                    )}
                  </div>
                )}
                <Link
                  href={`/admin/marketplace/users/${item.seller.id}`}
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  판매자 프로필 보기
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">판매자 정보 없음</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">시간 정보</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">등록일</dt>
                <dd className="text-gray-900">{formatDate(item.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">수정일</dt>
                <dd className="text-gray-900">{formatDate(item.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">아이템 거절</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력하세요..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => handleAction('reject', rejectReason)}
                disabled={!rejectReason.trim() || actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                거절
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}