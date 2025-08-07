// Re-export all types from supabase.ts
export * from './supabase'

// Legacy type aliases for backward compatibility
export type UserRole = 'ADMIN' | 'LANDLORD' | 'REALTOR' | 'TENANT'
export type WaitingStatus = 'PENDING' | 'REJECTED' | 'APPROVED'