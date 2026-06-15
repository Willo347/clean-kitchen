'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const [restaurantName, setRestaurantName] = useState('')
  const [city, setCity] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Le PIN doit être 4 chiffres')
      return
    }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('settings').upsert({
      restaurant_id: user.id,
      restaurant_name: restaurantName,
      city,
      admin_pin: pin,
    }, { onConflict: 'restaurant_id' })

    if (error) {
      setError(`Erreur : ${error.message}`)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#070B14]">
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md">
        <img src="/ck-logo-new.png" alt="Clean Kitchen" className="h-12 mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-center text-white mb-2">
          Bienvenue sur Clean Kitchen
        </h1>
        <p className="text-white/40 text-sm text-center mb-8">
          Configurez votre restaurant pour commencer
        </p>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nom du restaurant</label>
            <input
              type="text"
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              required
              placeholder="Ex: Le Bistrot du Port"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Ville</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              required
              placeholder="Ex: Paris"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">PIN admin (4 chiffres)</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="••••"
              maxLength={4}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50 mt-2"
          >
            {loading ? 'Configuration...' : 'Démarrer Clean Kitchen'}
          </button>
        </form>
      </div>
    </div>
  )
}