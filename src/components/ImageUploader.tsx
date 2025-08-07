'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'

interface ImageUploaderProps {
  propertyId: string
  existingImages?: Array<{
    id: string
    media_url: string
    is_main_image: boolean
    display_order: number
  }>
  onUploadComplete?: () => void
  maxImages?: number
}

export default function ImageUploader({ 
  propertyId, 
  existingImages = [], 
  onUploadComplete,
  maxImages = 10 
}: ImageUploaderProps) {
  const [images, setImages] = useState(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const supabase = createClientComponentClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )

    if (validFiles.length === 0) {
      alert('이미지 파일만 업로드 가능합니다 (최대 5MB)')
      return
    }

    if (images.length + validFiles.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드 가능합니다`)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const fileExt = file.name.split('.').pop()
        const mediaId = `${Date.now()}_${Math.random().toString(36).substring(7)}`
        const fileName = `properties/${propertyId}/photos/${mediaId}.${fileExt}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-media')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-media')
          .getPublicUrl(fileName)

        // Save to database
        const { data: mediaData, error: dbError } = await supabase
          .from('property_media')
          .insert({
            property_id: propertyId,
            media_url: publicUrl,
            media_type: 'IMAGE',
            file_name: file.name,
            file_size: file.size,
            display_order: images.length + i,
            is_main_image: images.length === 0 && i === 0 // First image is main
          })
          .select()
          .single()

        if (dbError) throw dbError

        setImages(prev => [...prev, mediaData])
        setUploadProgress(((i + 1) / validFiles.length) * 100)
      }

      // Update property thumbnail if this is the first image
      if (images.length === 0 && validFiles.length > 0) {
        // Use the first uploaded image's public URL
        const firstImageUrl = images[0]?.media_url

        await supabase
          .from('properties')
          .update({ thumbnail_url: publicUrl })
          .eq('id', propertyId)
      }

      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      alert('이미지 업로드 중 오류가 발생했습니다')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (imageId: string, mediaUrl: string) => {
    if (!confirm('이미지를 삭제하시겠습니까?')) return

    try {
      // Extract file path from URL
      const urlParts = mediaUrl.split('/storage/v1/object/public/property-media/')
      const filePath = urlParts[1] || mediaUrl.split('/').slice(-4).join('/') // Handle different URL formats

      // Delete from storage
      await supabase.storage
        .from('property-media')
        .remove([filePath])

      // Delete from database
      await supabase
        .from('property_media')
        .delete()
        .eq('id', imageId)

      setImages(prev => prev.filter(img => img.id !== imageId))
      
      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.error('Delete error:', error)
      alert('이미지 삭제 중 오류가 발생했습니다')
    }
  }

  const setMainImage = async (imageId: string) => {
    try {
      // Reset all images to not main
      await supabase
        .from('property_media')
        .update({ is_main_image: false })
        .eq('property_id', propertyId)

      // Set selected image as main
      const { error } = await supabase
        .from('property_media')
        .update({ is_main_image: true })
        .eq('id', imageId)

      if (error) throw error

      // Update local state
      setImages(prev => prev.map(img => ({
        ...img,
        is_main_image: img.id === imageId
      })))

      // Update property thumbnail
      const mainImage = images.find(img => img.id === imageId)
      if (mainImage) {
        await supabase
          .from('properties')
          .update({ thumbnail_url: mainImage.media_url })
          .eq('id', propertyId)
      }

      if (onUploadComplete) onUploadComplete()
    } catch (error) {
      console.error('Set main image error:', error)
      alert('대표 이미지 설정 중 오류가 발생했습니다')
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
          <span className="text-sm text-gray-600">
            {uploading 
              ? `업로드 중... ${Math.round(uploadProgress)}%`
              : '이미지를 드래그하거나 클릭하여 업로드'}
          </span>
          <span className="text-xs text-gray-500">
            최대 {maxImages}개, 각 5MB 이하
          </span>
        </label>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={image.media_url}
                  alt="Property"
                  fill
                  className="object-cover"
                />
                {image.is_main_image && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    대표
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                {!image.is_main_image && (
                  <button
                    onClick={() => setMainImage(image.id)}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    title="대표 이미지로 설정"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(image.id, image.media_url)}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                  title="삭제"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Count */}
      <div className="text-sm text-gray-600 text-center">
        {images.length} / {maxImages} 이미지 업로드됨
      </div>
    </div>
  )
}