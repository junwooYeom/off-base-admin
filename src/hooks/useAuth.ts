import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@/types/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user details from users table
        supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (data) setUser(data)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user details
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (data) setUser(data)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        router.push('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/auth/login')
  }

  return { user, loading, signOut }
}