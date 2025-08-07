import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  onUpdate: (payload: any) => void
}

export function useRealtimeUpdates({
  table,
  filter,
  event = '*',
  onUpdate
}: UseRealtimeOptions) {
  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table,
            filter
          },
          (payload) => {
            console.log('Realtime update:', payload)
            onUpdate(payload)
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, filter, event, onUpdate])
}

// Example usage in admin properties page
export function usePropertyUpdates(onNewProperty: () => void) {
  useRealtimeUpdates({
    table: 'properties',
    event: 'INSERT',
    onUpdate: () => {
      // Refresh properties list when new property is added
      onNewProperty()
    }
  })
}

// Example usage in realtor leads page
export function useLeadUpdates(realtorId: string, onLeadUpdate: () => void) {
  useRealtimeUpdates({
    table: 'leads',
    filter: `realtor_id=eq.${realtorId}`,
    event: '*',
    onUpdate: () => {
      // Refresh leads when any change happens
      onLeadUpdate()
    }
  })
}