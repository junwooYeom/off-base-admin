'use client'

import { useState, useEffect } from 'react'
import { Upload, User, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface ProfileImageUploaderProps {
  userId: string
  currentImageUrl?: string | null
  onUploadComplete?: (newImageUrl: string) => void
}

export default function ProfileImageUploader({
  userId,
  currentImageUrl,
  onUploadComplete
}: ProfileImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const router = useRouter()
  
  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[ProfileImageUploader] Session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      })
      
      if (session?.user?.id) {
        setCurrentUserId(session.user.id)
        
        // Check if user is admin
        const { data: adminCheck } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
        
        const userIsAdmin = adminCheck?.user_type === 'ADMIN'
        setIsAdmin(userIsAdmin)
        
        console.log('[ProfileImageUploader] Auth state:', {
          currentUserId: session.user.id,
          userType: adminCheck?.user_type,
          isAdmin: userIsAdmin,
          uploadingForUserId: userId
        })
      }
    }
    
    checkAuth()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('[ProfileImageUploader] No file selected')
      return
    }

    console.log('[ProfileImageUploader] File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      uploadingForUserId: userId,
      currentUserId: currentUserId,
      isAdmin: isAdmin
    })
    
    // For admin pages, we'll use the admin API regardless of auth status
    const isAdminPage = window.location.pathname.startsWith('/admin/')
    
    if (!isAdminPage) {
      // Only check authentication for non-admin pages
      if (!currentUserId) {
        console.error('[ProfileImageUploader] No authenticated user found!')
        alert('인증 세션이 만료되었습니다. 페이지를 새로고침해주세요.')
        return
      }
      
      // Verify admin status if uploading for another user
      if (userId !== currentUserId && !isAdmin) {
        console.error('[ProfileImageUploader] Non-admin trying to upload for another user')
        alert('다른 사용자의 프로필 이미지를 업로드할 권한이 없습니다.')
        return
      }
    } else {
      console.log('[ProfileImageUploader] Admin page detected, will use admin API')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('[ProfileImageUploader] Invalid file type:', file.type)
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log('[ProfileImageUploader] File too large:', file.size)
      alert('이미지 크기는 2MB 이하여야 합니다')
      return
    }

    setUploading(true)
    console.log('[ProfileImageUploader] Starting upload...')

    try {
      // Check if we should use admin API
      // Use admin API if:
      // 1. We're on an admin page (regardless of auth)
      // 2. No auth session exists  
      // 3. Uploading for a different user
      const isAdminPageUpload = window.location.pathname.startsWith('/admin/')
      const useAdminApi = isAdminPageUpload || !currentUserId || (currentUserId && userId !== currentUserId)
      
      if (useAdminApi) {
        console.log('[ProfileImageUploader] Using admin API for upload')
        
        // Use admin API route
        const formData = new FormData()
        formData.append('file', file)
        formData.append('userId', userId)
        
        const response = await fetch('/api/admin/upload/profile-image', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.log('[ProfileImageUploader] Admin API error:', error)
          throw new Error(error.error || 'Upload failed')
        }
        
        const result = await response.json()
        const publicUrl = result.data.publicUrl
        
        console.log('[ProfileImageUploader] Admin API upload successful:', result)
        
        setImageUrl(publicUrl)
        setPreviewUrl(null)
        
        if (onUploadComplete) {
          onUploadComplete(publicUrl)
        }
        
        router.refresh()
        
        // Reset input
        e.target.value = ''
        console.log('[ProfileImageUploader] Upload process completed successfully')
        return
      }
      
      // Regular user upload continues below
      console.log('[ProfileImageUploader] Using regular upload (user uploading own image)')
      // Delete old profile images first
      if (currentImageUrl) {
        try {
          console.log('[ProfileImageUploader] Listing existing profile images...')
          // List all files in the profile_image directory
          const { data: files, error: listError } = await supabase.storage
            .from('users')
            .list(`${userId}/profile_image`)
          
          if (listError) {
            console.log('[ProfileImageUploader] List error:', listError)
          } else {
            console.log('[ProfileImageUploader] Found files:', files)
          }

          // Delete all existing profile images
          if (files && files.length > 0) {
            const filePaths = files.map(file => `${userId}/profile_image/${file.name}`)
            console.log('[ProfileImageUploader] Deleting old files:', filePaths)
            const { error: removeError } = await supabase.storage
              .from('users')
              .remove(filePaths)
            if (removeError) {
              console.log('[ProfileImageUploader] Remove error:', removeError)
            }
          }
        } catch (e) {
          console.log('[ProfileImageUploader] No existing profile images to delete:', e)
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/profile_image/${Date.now()}.${fileExt}`
      
      console.log('[ProfileImageUploader] Upload config:', {
        bucket: 'users',
        fileName: fileName,
        fileExt: fileExt
      })

      console.log('[ProfileImageUploader] Uploading file to storage...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('users')
        .upload(fileName, file)

      if (uploadError) {
        console.log('[ProfileImageUploader] Upload error:', uploadError)
        throw uploadError
      }
      
      console.log('[ProfileImageUploader] Upload successful:', uploadData)

      // Get public URL
      console.log('[ProfileImageUploader] Getting public URL...')
      const { data: { publicUrl } } = supabase.storage
        .from('users')
        .getPublicUrl(fileName)
      
      console.log('[ProfileImageUploader] Public URL:', publicUrl)

      // Update user profile
      console.log('[ProfileImageUploader] Updating user profile with image URL...')
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId)

      if (updateError) {
        console.log('[ProfileImageUploader] Database update error:', updateError)
        throw updateError
      }
      
      console.log('[ProfileImageUploader] Database update successful')

      setImageUrl(publicUrl)
      setPreviewUrl(null)
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }
      
      router.refresh()
      
      // Reset input
      e.target.value = ''
      console.log('[ProfileImageUploader] Upload process completed successfully')
    } catch (error) {
      console.warn('[ProfileImageUploader] Upload error details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      alert(`프로필 이미지 업로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('프로필 이미지를 삭제하시겠습니까?')) return

    setUploading(true)

    try {
      // Delete all profile images from storage
      const { data: files } = await supabase.storage
        .from('users')
        .list(`${userId}/profile_image`)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${userId}/profile_image/${file.name}`)
        await supabase.storage
          .from('users')
          .remove(filePaths)
      }

      // Update user profile to remove image URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: null })
        .eq('id', userId)

      if (updateError) throw updateError

      setImageUrl(null)
      setPreviewUrl(null)
      
      if (onUploadComplete) {
        onUploadComplete('')
      }
      
      router.refresh()
    } catch (error) {
      console.warn('Remove error:', error)
      alert('프로필 이미지 삭제 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Current/Preview Image */}
      <div className="flex justify-center">
        <div className="relative">
          {previewUrl || imageUrl ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
              <Image
                src={previewUrl || imageUrl || ''}
                alt="Profile"
                fill
                className="object-cover"
              />
              {!uploading && (
                <button
                  onClick={handleRemove}
                  className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                  title="삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <div className="text-center">
        <input
          type="file"
          id="profile-upload"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        <label
          htmlFor="profile-upload"
          className={`inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>업로드 중...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>프로필 이미지 변경</span>
            </>
          )}
        </label>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-gray-500">
        JPG, PNG 형식 (최대 2MB)
      </div>
    </div>
  )
}