import { supabase } from './supabase'

export const adminQueries = {
  // User Management
  users: {
    // Get all users with optional filters
    getAll: async (filters?: {
      status?: 'PENDING' | 'REJECTED' | 'APPROVED'
      role?: string
      page?: number
      limit?: number
    }) => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('verification_status', filters.status)
      }
      if (filters?.role) {
        query = query.eq('user_type', filters.role)
      }
      
      const limit = filters?.limit || 20
      const page = filters?.page || 1
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      return { data, error, count }
    },

    // Get single user with documents
    getById: async (userId: string) => {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) return { user: null, documents: null, error: userError }

      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      return { user, documents, error: docsError }
    },

    // Update user status
    updateStatus: async (
      userId: string, 
      status: 'PENDING' | 'REJECTED' | 'APPROVED',
      reason?: string
    ) => {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          verification_status: status,
          verified_at: status === 'APPROVED' ? new Date().toISOString() : null
        })
        .eq('id', userId)
        .select()
        .single()

      // If rejected, you might want to send a notification
      if (status === 'REJECTED' && reason) {
        // Store rejection reason or send email
      }

      return { data, error }
    },

    // Update user role
    updateRole: async (userId: string, role: string) => {
      const { data, error } = await supabase
        .from('users')
        .update({ user_type: role })
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    },

    // Get pending realtor applications
    getPendingRealtors: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_type', 'REALTOR')
        .eq('verification_status', 'PENDING')
        .order('created_at', { ascending: false })

      return { data, error }
    }
  },

  // Property Management
  properties: {
    // Get all properties with filters
    getAll: async (filters?: {
      status?: 'PENDING' | 'APPROVED' | 'REJECTED'
      userId?: string
      page?: number
      limit?: number
    }) => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          users:user_id (
            id,
            email,
            name,
            user_type
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId)
      }

      const limit = filters?.limit || 20
      const page = filters?.page || 1
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      return { data, error, count }
    },

    // Get single property
    getById: async (propertyId: string) => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users:user_id (
            id,
            email,
            name,
            user_type,
            phone
          )
        `)
        .eq('id', propertyId)
        .single()

      return { data, error }
    },

    // Update property status
    updateStatus: async (
      propertyId: string,
      status: 'PENDING' | 'APPROVED' | 'REJECTED',
      reason?: string
    ) => {
      const { data, error } = await supabase
        .from('properties')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', propertyId)
        .select()
        .single()

      // Track property analytics
      if (status === 'APPROVED') {
        await supabase
          .from('property_analytics')
          .insert({
            property_id: propertyId,
            date: new Date().toISOString().split('T')[0],
            views: 0,
            clicks: 0,
            inquiries: 0
          })
      }

      return { data, error }
    },

    // Delete property
    delete: async (propertyId: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      return { error }
    },

    // Get property reports
    getReports: async (propertyId: string) => {
      const { data, error } = await supabase
        .from('property_reports')
        .select(`
          *,
          users:reporter_id (
            id,
            email,
            name
          )
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })

      return { data, error }
    }
  },

  // Document Management
  documents: {
    // Update document status
    updateStatus: async (
      documentId: string,
      status: 'PENDING' | 'APPROVED' | 'REJECTED',
      reason?: string
    ) => {
      const { data, error } = await supabase
        .from('documents')
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          review_notes: reason
        })
        .eq('id', documentId)
        .select()
        .single()

      return { data, error }
    }
  },

  // Dashboard Statistics
  stats: {
    // Get overview stats
    getOverview: async () => {
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

      // Get user stats
      const { data: userStats } = await supabase
        .from('users')
        .select('user_type, verification_status', { count: 'exact' })

      // Get property stats
      const { data: propertyStats } = await supabase
        .from('properties')
        .select('status', { count: 'exact' })

      // Get recent activity
      const { data: recentUsers } = await supabase
        .from('users')
        .select('*')
        .gte('created_at', lastMonth.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      const { data: recentProperties } = await supabase
        .from('properties')
        .select('*')
        .gte('created_at', lastMonth.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      return {
        userStats,
        propertyStats,
        recentUsers,
        recentProperties
      }
    }
  }
}