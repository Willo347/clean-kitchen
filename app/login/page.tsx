'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://cleankitchen.fr/auth/callback?type=recovery',
    })

    setResetLoading(false)
    if (error) {
      setError('Erreur : ' + error.message)
      return
    }
    setResetSent(true)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm">
        <img src="/ck-logo-new.png" alt="Clean Kitchen" className="h-12 mx-auto mb-6" />

        {!showReset ? (
          <>
            <h1 className="text-xl font-semibold text-center text-white mb-6">Connexion</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
              <button
                type="button"
                onClick={() => { setShowReset(true); setError('') }}
                className="w-full text-white/40 text-sm hover:text-white/70 transition text-center"
              >
                Mot de passe oublié ?
              </button>
            </form>
          </>
        ) : resetSent ? (
          <>
            <h1 className="text-xl font-semibold text-center text-white mb-4">Email envoyé !</h1>
            <p className="text-white/60 text-sm text-center mb-6">
              Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <button
              onClick={() => { setShowReset(false); setResetSent(false) }}
              className="w-full text-cyan-400 text-sm hover:text-cyan-300 transition text-center"
            >
              Retour à la connexion
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-center text-white mb-4">Mot de passe oublié</h1>
            <p className="text-white/60 text-sm text-center mb-6">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-cyan-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50"
              >
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
              <button
                type="button"
                onClick={() => { setShowReset(false); setError('') }}
                className="w-full text-white/40 text-sm hover:text-white/70 transition text-center"
              >
                Retour à la connexion
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}