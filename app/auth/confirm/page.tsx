'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const hash = window.location.hash
    
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const access_token = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      
      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token }).then(() => {
          router.push('/setup')
        })
      }
    }
  }, [router])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]">
      <p className="text-white text-lg">Connexion en cours...</p>
    </div>
  )
}
