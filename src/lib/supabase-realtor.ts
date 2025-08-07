import { supabase } from './supabase'
import { 
  Lead, LeadInsert, LeadInteraction,
  Client, ClientInsert, ClientInteraction,
  OpenHouse, OpenHouseInsert,
  Commission, PropertyAnalytics,
  BulkUploadHistory
} from '@/types/supabase'

export const realtorQueries = {
  // Lead Management
  leads: {
    // Get all leads for realtor
    getAll: async (realtorId: string, filters?: {
      status?: string
      source?: string
      page?: number
      limit?: number
    }) => {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status)
      }
      if (filters?.source) {
        query = query.eq('source', filters.source)
      }

      const limit = filters?.limit || 20
      const page = filters?.page || 1
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      return { data, error, count }
    },

    // Create new lead
    create: async (realtorId: string, lead: LeadInsert) => {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...lead, realtor_id: realtorId }])
        .select()
        .single()

      return { data, error }
    },

    // Update lead
    update: async (leadId: string, updates: Partial<Lead>) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId)
        .select()
        .single()

      return { data, error }
    },

    // Add interaction
    addInteraction: async (leadId: string, interaction: {
      type: string
      notes: string
      created_by: string
    }) => {
      const { data, error } = await supabase
        .from('lead_interactions')
        .insert([{ lead_id: leadId, ...interaction }])
        .select()
        .single()

      return { data, error }
    },

    // Get lead interactions
    getInteractions: async (leadId: string) => {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      return { data, error }
    }
  },

  // Client Management
  clients: {
    // Get all clients
    getAll: async (realtorId: string, filters?: {
      type?: string
      status?: string
      page?: number
      limit?: number
    }) => {
      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('realtor_id', realtorId)
        .order('last_interaction', { ascending: false, nullsFirst: false })

      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const limit = filters?.limit || 20
      const page = filters?.page || 1
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      query = query.range(from, to)
      
      const { data, error, count } = await query
      
      return { data, error, count }
    },

    // Create client
    create: async (realtorId: string, client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...client, realtor_id: realtorId }])
        .select()
        .single()

      return { data, error }
    },

    // Update client
    update: async (clientId: string, updates: Partial<Client>) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single()

      return { data, error }
    },

    // Add interaction
    addInteraction: async (clientId: string, interaction: {
      type: string
      notes: string
      created_by: string
    }) => {
      const { data, error } = await supabase
        .from('client_interactions')
        .insert([{ client_id: clientId, ...interaction }])
        .select()
        .single()

      return { data, error }
    },

    // Get client transactions
    getTransactions: async (clientId: string) => {
      const { data, error } = await supabase
        .from('commissions')
        .select(`
          *,
          properties (
            id,
            title,
            address,
            price
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      return { data, error }
    }
  },

  // Open House Management
  openHouses: {
    // Get all open houses
    getAll: async (realtorId: string, filters?: {
      dateFrom?: string
      dateTo?: string
      status?: string
    }) => {
      let query = supabase
        .from('open_houses')
        .select(`
          *,
          properties (
            id,
            title,
            address,
            images
          )
        `)
        .eq('realtor_id', realtorId)
        .order('date', { ascending: true })

      if (filters?.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('date', filters.dateTo)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query
      
      return { data, error }
    },

    // Create open house
    create: async (realtorId: string, openHouse: OpenHouseInsert) => {
      const { data, error } = await supabase
        .from('open_houses')
        .insert([{ ...openHouse, realtor_id: realtorId }])
        .select()
        .single()

      return { data, error }
    },

    // Update open house
    update: async (openHouseId: string, updates: Partial<OpenHouse>) => {
      const { data, error } = await supabase
        .from('open_houses')
        .update(updates)
        .eq('id', openHouseId)
        .select()
        .single()

      return { data, error }
    },

    // Record visitors
    recordVisitors: async (openHouseId: string, count: number, notes?: string) => {
      const { data, error } = await supabase
        .from('open_houses')
        .update({ 
          visitor_count: count,
          notes,
          status: 'COMPLETED'
        })
        .eq('id', openHouseId)
        .select()
        .single()

      return { data, error }
    }
  },

  // Analytics
  analytics: {
    // Get overview stats
    getOverview: async (realtorId: string, period: 'week' | 'month' | 'year' = 'month') => {
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1)
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      // Get properties for this realtor
      const { data: properties } = await supabase
        .from('properties')
        .select('id')
        .eq('user_id', realtorId)

      const propertyIds = properties?.map(p => p.id) || []

      // Get analytics for these properties
      const { data: analytics, error } = await supabase
        .from('property_analytics')
        .select('*')
        .in('property_id', propertyIds)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])

      // Aggregate stats
      const stats = analytics?.reduce((acc, curr) => ({
        totalViews: acc.totalViews + curr.views,
        totalClicks: acc.totalClicks + curr.clicks,
        totalInquiries: acc.totalInquiries + curr.inquiries,
      }), { totalViews: 0, totalClicks: 0, totalInquiries: 0 })

      return { data: stats, error }
    },

    // Get property performance
    getPropertyPerformance: async (propertyId: string, period: 'week' | 'month' | 'year' = 'month') => {
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7)
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1)
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      const { data, error } = await supabase
        .from('property_analytics')
        .select('*')
        .eq('property_id', propertyId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      return { data, error }
    },

    // Track property view
    trackView: async (propertyId: string, type: 'view' | 'click' | 'inquiry') => {
      const { data, error } = await supabase
        .rpc('increment_property_view', {
          property_id: propertyId,
          view_type: type
        })

      return { data, error }
    }
  },

  // Commission Management
  commissions: {
    // Get all commissions
    getAll: async (realtorId: string, filters?: {
      dateFrom?: string
      dateTo?: string
    }) => {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          properties (
            id,
            title,
            address
          )
        `)
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error } = await query
      
      return { data, error }
    },

    // Create commission record
    create: async (realtorId: string, commission: {
      property_id: string
      sale_price: number
      commission_rate: number
      split_rate: number
      referral_fee?: number
    }) => {
      // Calculate commission amounts
      const totalCommission = (commission.sale_price * commission.commission_rate) / 100
      const referralAmount = commission.referral_fee 
        ? (totalCommission * commission.referral_fee) / 100 
        : 0
      const afterReferral = totalCommission - referralAmount
      const realtorCommission = (afterReferral * commission.split_rate) / 100
      const brokerageCommission = afterReferral - realtorCommission

      const { data, error } = await supabase
        .from('commissions')
        .insert([{
          ...commission,
          realtor_id: realtorId,
          total_commission: totalCommission,
          realtor_commission: realtorCommission,
          brokerage_commission: brokerageCommission,
          referral_fee: commission.referral_fee || 0
        }])
        .select()
        .single()

      return { data, error }
    },

    // Get commission summary
    getSummary: async (realtorId: string, period: 'month' | 'quarter' | 'year') => {
      const endDate = new Date()
      const startDate = new Date()
      
      if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1)
      } else if (period === 'quarter') {
        startDate.setMonth(endDate.getMonth() - 3)
      } else {
        startDate.setFullYear(endDate.getFullYear() - 1)
      }

      const { data, error } = await supabase
        .from('commissions')
        .select('realtor_commission')
        .eq('realtor_id', realtorId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      const total = data?.reduce((sum, c) => sum + c.realtor_commission, 0) || 0

      return { total, count: data?.length || 0, error }
    }
  },

  // Bulk Upload
  bulkUpload: {
    // Upload CSV
    processCSV: async (realtorId: string, file: File) => {
      // This would typically be handled by an edge function
      // For now, we'll create a placeholder
      const formData = new FormData()
      formData.append('file', file)
      formData.append('realtor_id', realtorId)

      // Call edge function
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        body: formData
      })

      return response.json()
    },

    // Get upload history
    getHistory: async (realtorId: string) => {
      const { data, error } = await supabase
        .from('bulk_upload_history')
        .select('*')
        .eq('realtor_id', realtorId)
        .order('created_at', { ascending: false })

      return { data, error }
    }
  }
}