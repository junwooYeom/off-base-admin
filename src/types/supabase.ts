// Import generated database types
import { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

// Export database types for easy access
export type { Database, Tables, TablesInsert, TablesUpdate, Enums }

// Table type aliases
export type User = Tables<'users'>
export type Property = Tables<'properties'>
export type PropertyMedia = Tables<'property_media'>
export type PropertyDocument = Tables<'property_documents'>
export type PropertyReport = Tables<'property_reports'>
export type RealtorCompany = Tables<'realtor_companies'>
export type UserFavorite = Tables<'user_favorites'>
export type UserVerificationDocument = Tables<'user_verification_documents'>

// Insert type aliases
export type UserInsert = TablesInsert<'users'>
export type PropertyInsert = TablesInsert<'properties'>
export type PropertyMediaInsert = TablesInsert<'property_media'>
export type PropertyDocumentInsert = TablesInsert<'property_documents'>
export type PropertyReportInsert = TablesInsert<'property_reports'>
export type RealtorCompanyInsert = TablesInsert<'realtor_companies'>
export type UserFavoriteInsert = TablesInsert<'user_favorites'>
export type UserVerificationDocumentInsert = TablesInsert<'user_verification_documents'>

// Update type aliases
export type UserUpdate = TablesUpdate<'users'>
export type PropertyUpdate = TablesUpdate<'properties'>
export type PropertyMediaUpdate = TablesUpdate<'property_media'>
export type PropertyDocumentUpdate = TablesUpdate<'property_documents'>
export type PropertyReportUpdate = TablesUpdate<'property_reports'>
export type RealtorCompanyUpdate = TablesUpdate<'realtor_companies'>
export type UserFavoriteUpdate = TablesUpdate<'user_favorites'>
export type UserVerificationDocumentUpdate = TablesUpdate<'user_verification_documents'>

// Enum type aliases
export type UserType = Enums<'user_type'>
export type PropertyType = Enums<'property_type'>
export type TransactionType = Enums<'transaction_type'>
export type RegionType = Enums<'region_type'>
export type DirectionType = Enums<'direction_type'>
export type MediaType = Enums<'media_type'>
export type DocumentType = Enums<'document_type'>
export type VerificationStatus = Enums<'verification_status'>
export type ReportReason = Enums<'report_reason'>

// Legacy Document interface for backward compatibility
export interface Document {
  id: string
  user_id: string
  type: string
  url: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

// New types for Realtor features
export interface Lead {
  id: string
  realtor_id: string
  name: string
  email?: string
  phone?: string
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED' | 'LOST'
  source?: string
  property_interest?: string
  budget?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeadInteraction {
  id: string
  lead_id: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'SHOWING' | 'OTHER'
  notes: string
  created_at: string
  created_by: string
}

export interface OpenHouse {
  id: string
  property_id: string
  realtor_id: string
  date: string
  start_time: string
  end_time: string
  visitor_count: number
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  created_at: string
  property?: Property // For joins
}

export interface Client {
  id: string
  realtor_id: string
  name: string
  email?: string
  phone?: string
  type: 'BUYER' | 'SELLER' | 'BOTH'
  status: 'ACTIVE' | 'INACTIVE'
  tags: string[]
  notes?: string
  last_interaction?: string
  total_transactions: number
  created_at: string
}

export interface ClientInteraction {
  id: string
  client_id: string
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'SHOWING' | 'OTHER'
  notes: string
  created_at: string
  created_by: string
}

export interface Commission {
  id: string
  realtor_id: string
  property_id: string
  sale_price: number
  commission_rate: number
  split_rate: number
  referral_fee: number
  total_commission: number
  realtor_commission: number
  brokerage_commission: number
  created_at: string
  property?: Property // For joins
}

export interface PropertyAnalytics {
  id: string
  property_id: string
  date: string
  views: number
  clicks: number
  inquiries: number
  shares: number
}

export interface BulkUploadHistory {
  id: string
  realtor_id: string
  filename: string
  total_rows: number
  successful_rows: number
  failed_rows: number
  errors?: any
  created_at: string
}

// Database types for inserts/updates
export interface LeadInsert {
  name: string
  email?: string
  phone?: string
  status?: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'NEGOTIATION' | 'CLOSED' | 'LOST'
  source?: string
  property_interest?: string
  budget?: number
  notes?: string
}

export interface ClientInsert {
  name: string
  email?: string
  phone?: string
  type: 'BUYER' | 'SELLER' | 'BOTH'
  tags?: string[]
  notes?: string
}

export interface OpenHouseInsert {
  property_id: string
  date: string
  start_time: string
  end_time: string
  notes?: string
}