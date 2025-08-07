'use client'

import { useState } from 'react'
import { Upload, User, Loader2, X } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  const supabase = createClientComponentClient()
  const router = useRouter()

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
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('이미지 크기는 2MB 이하여야 합니다')
      return
    }

    setUploading(true)

    try {
      // Delete old profile images first
      if (currentImageUrl) {
        try {
          // List all files in the profile_image directory
          const { data: files } = await supabase.storage
            .from('users')
            .list(`users/${userId}/profile_image`)

          // Delete all existing profile images
          if (files && files.length > 0) {
            const filePaths = files.map(file => `users/${userId}/profile_image/${file.name}`)
            await supabase.storage
              .from('users')
              .remove(filePaths)
          }
        } catch (e) {
          console.log('No existing profile images to delete')
        }
      }

      // Upload new image
      const fileExt = file.name.split('.').pop()
      const fileName = `users/${userId}/profile_image/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('users')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('users')
        .getPublicUrl(fileName)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setImageUrl(publicUrl)
      setPreviewUrl(null)
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }
      
      router.refresh()
      
      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      alert('프로필 이미지 업로드 중 오류가 발생했습니다')
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
        .list(`users/${userId}/profile_image`)

      if (files && files.length > 0) {
        const filePaths = files.map(file => `users/${userId}/profile_image/${file.name}`)
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
      console.error('Remove error:', error)
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