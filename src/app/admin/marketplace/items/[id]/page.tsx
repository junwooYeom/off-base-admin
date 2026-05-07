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
  Heart,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react'

interface Seller {
  id: string
  full_name: string | null
  email: string
  phone_number: string | null
}

interface ItemImage {
  id: string
  image_url: string
  display_order: number
}

interface ItemDetail {
  id: string
  title: string
  description: string
  price: number
  status: string
  moderation_status: string
  rejection_reason: string | null
  approved_at: string | null
  rejected_at: string | null
  condition: string
  category: string
  location: string | null
  is_negotiable: boolean
  is_featured: boolean | null
  view_count: number
  chat_count: number
  favorite_count: number
  created_at: string
  updated_at: string
  seller: Seller | Seller[] | null
  images: ItemImage[]
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

const CATEGORY_LABELS: Record<string, string> = {
  electronics: '전자기기',
  furniture: '가구',
  clothing: '의류',
  home_appliances: '가전',
  sports: '스포츠',
  books: '도서',
  toys: '장난감',
  beauty: '뷰티',
  pets: '반려동물',
  vehicles: '차량',
  other: '기타',
}

const CONDITION_LABELS: Record<string, string> = {
  new: '새상품',
  like_new: '거의 새것',
  good: '좋음',
  fair: '보통',
  poor: '나쁨',
}

const STATUS_LABELS: Record<string, string> = {
  active: '활성',
  reserved: '예약중',
  sold: '판매완료',
  hidden: '숨김',
}

function pickSeller(seller: Seller | Seller[] | null): Seller | null {
  if (!seller) return null
  return Array.isArray(seller) ? seller[0] ?? null : seller
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadItem = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          id, title, description, price, status, moderation_status, rejection_reason,
          approved_at, rejected_at, condition, category, location, is_negotiable,
          is_featured, view_count, chat_count, favorite_count, created_at, updated_at,
          seller:users(id, full_name, email, phone_number),
          images:marketplace_item_images(id, image_url, display_order)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setItem(data as unknown as ItemDetail)

      const seller = pickSeller(data?.seller as Seller | Seller[] | null)
      if (seller?.id) {
        const { data: profile } = await supabase
          .from('marketplace_user_profiles')
          .select('marketplace_status, seller_rating, total_sales, completed_transactions, is_verified_seller, warning_count, risk_score')
          .eq('user_id', seller.id)
          .maybeSingle()

        setSellerProfile(profile as SellerProfile | null)
      } else {
        setSellerProfile(null)
      }
    } catch (error) {
      console.error('Error loading item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string, reason?: string) => {
    if (!item) return
    setActionLoading(true)
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('marketplace_items')
          .delete()
          .eq('id', id)
        if (error) throw error
        router.push('/admin/marketplace/items')
        return
      }

      const nowIso = new Date().toISOString()
      let updateData: Record<string, unknown> = { updated_at: nowIso }

      switch (action) {
        case 'approve':
          updateData = {
            ...updateData,
            moderation_status: 'APPROVED',
            status: 'active',
            approved_at: nowIso,
            rejection_reason: null,
          }
          break
        case 'reject':
          updateData = {
            ...updateData,
            moderation_status: 'REJECTED',
            status: 'hidden',
            rejection_reason: reason ?? null,
            rejected_at: nowIso,
          }
          break
        case 'hide':
          updateData = { ...updateData, status: 'hidden' }
          break
        case 'unhide':
          updateData = { ...updateData, status: 'active' }
          break
        case 'feature':
          updateData = { ...updateData, is_featured: !item.is_featured }
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price)

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ko-KR')

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      reserved: 'bg-purple-100 text-purple-800',
      sold: 'bg-blue-100 text-blue-800',
      hidden: 'bg-gray-100 text-gray-800',
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

  const seller = pickSeller(item.seller)
  const sortedImages = [...(item.images || [])].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.title}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(item.status)}`}>
                {STATUS_LABELS[item.status] || item.status}
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
          {item.status === 'active' ? (
            <button
              onClick={() => handleAction('hide')}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4 mr-2" /> 숨김
            </button>
          ) : item.status === 'hidden' ? (
            <button
              onClick={() => handleAction('unhide')}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 mr-2" /> 숨김 해제
            </button>
          ) : null}
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
              if (confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
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
            {sortedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sortedImages.map((image, idx) => (
                  <div key={image.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image_url}
                      alt="Item image"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                        대표
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">이미지가 없습니다</div>
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
                  {formatPrice(item.price)}
                  {item.is_negotiable && (
                    <span className="ml-2 text-sm font-normal text-gray-500">(협의 가능)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">카테고리</dt>
                <dd className="mt-1 text-gray-900">{CATEGORY_LABELS[item.category] || item.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">상태</dt>
                <dd className="mt-1 text-gray-900">{CONDITION_LABELS[item.condition] || item.condition}</dd>
              </div>
              {item.location && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">지역</dt>
                  <dd className="mt-1 text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                    {item.location}
                  </dd>
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
                <p className="mt-1 text-2xl font-bold text-gray-900">{item.chat_count}</p>
                <p className="text-xs text-gray-500">채팅</p>
              </div>
            </div>
            {sellerProfile && sellerProfile.risk_score > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                  <span className="text-yellow-800 font-medium">판매자 위험 점수: {sellerProfile.risk_score}</span>
                </div>
              </div>
            )}
          </div>

          {/* Seller Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">판매자 정보</h2>
            {seller ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{seller.full_name || '(이름 없음)'}</p>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                    {seller.phone_number && (
                      <p className="text-xs text-gray-400">{seller.phone_number}</p>
                    )}
                  </div>
                </div>
                {sellerProfile && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">평점</span>
                      <span className="text-gray-900">
                        {sellerProfile.seller_rating ? `${Number(sellerProfile.seller_rating).toFixed(1)} / 5.0` : '-'}
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
                  href={`/admin/marketplace/users`}
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  판매자 목록 보기
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
              {item.approved_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">승인일</dt>
                  <dd className="text-gray-900">{formatDate(item.approved_at)}</dd>
                </div>
              )}
              {item.rejected_at && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">거절일</dt>
                  <dd className="text-gray-900">{formatDate(item.rejected_at)}</dd>
                </div>
              )}
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