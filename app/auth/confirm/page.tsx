'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Connexion en cours...')

  useEffect(() => {
    const supabase = createClient()
    const hash = window.location.hash
    
    if (!hash) {
      setStatus('Aucun token trouvé dans l\'URL')
      return
    }

    const params = new URLSearchParams(hash.substring(1))
    const access_token = params.get('access_token')
    const refresh_token = params.get('refresh_token')
    const error = params.get('error')
    const error_description = params.get('error_description')

    if (error) {
      setStatus(`Erreur : ${error_description || error}`)
      return
    }

    if (!access_token || !refresh_token) {
      setStatus(`Token manquant — hash: ${hash}`)
      return
    }

    supabase.auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) {
          setStatus(`Erreur setSession : ${error.message}`)
        } else {
          router.push('/setup')
        }
      })
  }, [router])

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]">
      <p className="text-white text-lg text-center px-4">{status}</p>
    </div>
  )
}