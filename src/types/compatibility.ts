// Compatibility layer for legacy code
// This file provides type conversions and helpers for transitioning from old to new types

import { Property, User, UserVerificationDocument } from './supabase'

// Extended Property type with computed fields for backward compatibility
export interface PropertyWithCompat extends Property {
  // Computed location field from address components
  location: string
  // Status field for backward compatibility (defaults to 'APPROVED' for active properties)
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  // Images array from property_media relation
  images: string[]
  // Simplified bedroom/bathroom naming
  bedrooms?: number
  bathrooms?: number
  // Simplified area field
  area?: number
  // Full address
  address?: string
}

// Extended User type with computed fields for backward compatibility
export interface UserWithCompat extends User {
  // Legacy waiting_status field mapped from verification_status
  waiting_status: 'PENDING' | 'REJECTED' | 'ALLOWED'
  // Legacy name field mapped from full_name
  name: string
  // Legacy phone field mapped from phone_number
  phone?: string
  // Documents relation
  documents?: UserVerificationDocument[]
}

// Helper function to convert Property to PropertyWithCompat
export function toPropertyWithCompat(property: Property): PropertyWithCompat {
  return {
    ...property,
    location: [property.sido, property.sigungu, property.road_address]
      .filter(Boolean)
      .join(' ') || property.road_address,
    status: (property as any).status || (property.is_active ? 'APPROVED' : 'PENDING'),
    images: property.thumbnail_url ? [property.thumbnail_url] : [],
    bedrooms: property.room_count || undefined,
    bathrooms: property.bathroom_count || undefined,
    area: property.size_info || undefined,
    address: property.road_address + (property.detail_address ? ` ${property.detail_address}` : '')
  }
}

// Helper function to convert User to UserWithCompat
export function toUserWithCompat(user: User, documents?: UserVerificationDocument[]): UserWithCompat {
  return {
    ...user,
    waiting_status: user.verification_status === 'APPROVED' ? 'ALLOWED' : 
                   user.verification_status === 'REJECTED' ? 'REJECTED' : 'PENDING',
    name: user.full_name,
    phone: user.phone_number || undefined,
    documents
  }
}