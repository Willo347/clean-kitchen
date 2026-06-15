'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession()
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError('Erreur : ' + error.message)
      return
    }
    setSuccess(true)
    setTimeout(() => router.push('/'), 2000)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm">
        <img src="/ck-logo-new.png" alt="Clean Kitchen" className="h-12 mx-auto mb-6" />

        {success ? (
          <>
            <h1 className="text-xl font-semibold text-center text-white mb-4">Mot de passe mis à jour !</h1>
            <p className="text-white/60 text-sm text-center">Redirection en cours...</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-center text-white mb-6">Nouveau mot de passe</h1>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50"
              >
                {loading ? 'Mise à jour...' : 'Définir le mot de passe'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}