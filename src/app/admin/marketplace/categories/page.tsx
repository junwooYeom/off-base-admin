'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  name_ko: string | null
  slug: string
  parent_id: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  requires_verification: boolean
  created_at: string
  children?: Category[]
}

export default function MarketplaceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Category>>({})
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    name_ko: '',
    slug: '',
    icon: '',
    is_active: true,
    requires_verification: false,
    parent_id: null,
  })

  const loadCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .order('display_order')

      if (error) throw error

      // Build tree structure
      const categoryMap = new Map<string, Category>()
      const rootCategories: Category[] = []

      // First pass: create map
      data?.forEach((cat: Category) => {
        categoryMap.set(cat.id, { ...cat, children: [] })
      })

      // Second pass: build tree
      data?.forEach((cat: Category) => {
        const category = categoryMap.get(cat.id)!
        if (cat.parent_id && categoryMap.has(cat.parent_id)) {
          categoryMap.get(cat.parent_id)!.children!.push(category)
        } else {
          rootCategories.push(category)
        }
      })

      setCategories(rootCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      alert('이름과 슬러그는 필수입니다.')
      return
    }

    try {
      // Get max display order
      const { data: maxOrder } = await supabase
        .from('marketplace_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)
        .single()

      const { error } = await supabase
        .from('marketplace_categories')
        .insert({
          ...newCategory,
          display_order: (maxOrder?.display_order || 0) + 1,
        })

      if (error) throw error

      setShowAddModal(false)
      setNewCategory({
        name: '',
        name_ko: '',
        slug: '',
        icon: '',
        is_active: true,
        requires_verification: false,
        parent_id: null,
      })
      loadCategories()
    } catch (error) {
      console.error('Error adding category:', error)
      alert('카테고리 추가 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateCategory = async (id: string) => {
    if (!editForm.name) {
      alert('이름은 필수입니다.')
      return
    }

    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .update({
          name: editForm.name,
          name_ko: editForm.name_ko,
          slug: editForm.slug,
          icon: editForm.icon,
          is_active: editForm.is_active,
          requires_verification: editForm.requires_verification,
        })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      setEditForm({})
      loadCategories()
    } catch (error) {
      console.error('Error updating category:', error)
      alert('카테고리 수정 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 하위 카테고리도 함께 삭제됩니다.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('카테고리 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('marketplace_categories')
        .update({ is_active: !isActive })
        .eq('id', id)

      if (error) throw error

      loadCategories()
    } catch (error) {
      console.error('Error toggling category:', error)
    }
  }

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditForm({
      name: category.name,
      name_ko: category.name_ko,
      slug: category.slug,
      icon: category.icon,
      is_active: category.is_active,
      requires_verification: category.requires_verification,
    })
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const isEditing = editingId === category.id

    return (
      <div key={category.id}>
        <div
          className={`flex items-center py-3 px-4 hover:bg-gray-50 ${
            level > 0 ? 'pl-12' : ''
          }`}
          style={{ paddingLeft: level > 0 ? `${level * 40 + 16}px` : undefined }}
        >
          <GripVertical className="w-4 h-4 text-gray-400 mr-3 cursor-grab" />

          {level > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
          )}

          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Name (EN)"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={editForm.name_ko || ''}
                onChange={(e) => setEditForm({ ...editForm, name_ko: e.target.value })}
                placeholder="이름 (KO)"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={editForm.slug || ''}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                placeholder="slug"
                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <input
                type="text"
                value={editForm.icon || ''}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                placeholder="icon"
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={editForm.is_active || false}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="mr-1"
                />
                활성
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={editForm.requires_verification || false}
                  onChange={(e) => setEditForm({ ...editForm, requires_verification: e.target.checked })}
                  className="mr-1"
                />
                인증필요
              </label>
              <button
                onClick={() => handleUpdateCategory(category.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingId(null)
                  setEditForm({})
                }}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center">
                  {category.icon && (
                    <span className="mr-2 text-lg">{category.icon}</span>
                  )}
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.name_ko && (
                    <span className="ml-2 text-gray-500">({category.name_ko})</span>
                  )}
                </div>
                <div className="text-xs text-gray-400">/{category.slug}</div>
              </div>

              <div className="flex items-center gap-2">
                {category.requires_verification && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                    인증필요
                  </span>
                )}
                <button
                  onClick={() => handleToggleActive(category.id, category.is_active)}
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    category.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {category.is_active ? '활성' : '비활성'}
                </button>
                <button
                  onClick={() => startEditing(category)}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Render children */}
        {category.children && category.children.length > 0 && (
          <div>
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" /> 카테고리 추가
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center text-xs font-medium text-gray-500 uppercase">
            <div className="w-8"></div>
            <div className="flex-1">카테고리</div>
            <div className="w-48 text-right">작업</div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {categories.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              카테고리가 없습니다
            </div>
          ) : (
            categories.map((category) => renderCategory(category))
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">카테고리 추가</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (영문) *
                </label>
                <input
                  type="text"
                  value={newCategory.name || ''}
                  onChange={(e) => {
                    setNewCategory({
                      ...newCategory,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 (한글)
                </label>
                <input
                  type="text"
                  value={newCategory.name_ko || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, name_ko: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="전자기기"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  슬러그 *
                </label>
                <input
                  type="text"
                  value={newCategory.slug || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="electronics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이콘 (이모지)
                </label>
                <input
                  type="text"
                  value={newCategory.icon || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="📱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  상위 카테고리
                </label>
                <select
                  value={newCategory.parent_id || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, parent_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">없음 (최상위)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_ko || cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCategory.is_active}
                    onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  활성화
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCategory.requires_verification}
                    onChange={(e) => setNewCategory({ ...newCategory, requires_verification: e.target.checked })}
                    className="mr-2"
                  />
                  인증 필요
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewCategory({
                    name: '',
                    name_ko: '',
                    slug: '',
                    icon: '',
                    is_active: true,
                    requires_verification: false,
                    parent_id: null,
                  })
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}