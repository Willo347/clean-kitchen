'use client'
import { useEffect, useState } from 'react'
import { usePushSubscription } from '@/hooks/usePushSubscription'

const CATEGORIES = [
  { key: 'dlc',         label: '📦 DLC produits',    desc: 'Alerte 3 jours avant expiration' },
  { key: 'temperature', label: '🌡️ Températures',    desc: 'Hors seuil HACCP' },
  { key: 'delivery',    label: '🚚 Livraisons',       desc: 'En attente > 2h' },
  { key: 'maintenance', label: '🔧 Maintenance',      desc: 'Pannes non traitées' },
]

export default function NotificationsPage() {
  const { isSubscribed, isLoading, subscribe, unsubscribe, debugLog } = usePushSubscription()
  const [platform, setPlatform] = useState('...')

  useEffect(() => {
    import('@capacitor/core').then(({ Capacitor }) => {
      setPlatform(Capacitor.getPlatform())
    })
  }, [])

  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications Push</h1>

      <p className="text-xs text-gray-400 bg-gray-100 p-2 rounded">
        🔍 Platform : <strong>{platform}</strong>
      </p>

      {debugLog.length > 0 && (
        <div className="bg-black text-green-400 text-xs p-3 rounded-xl space-y-1 font-mono">
          {debugLog.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow">
        <div>
          <p className="font-semibold">Activer les notifications</p>
          <p className="text-sm text-gray-500">
            {isSubscribed ? 'Notifications actives sur cet appareil' : 'Désactivées'}
          </p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition
            ${isSubscribed
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-600 text-white hover:bg-green-700'}
            disabled:opacity-50`}
        >
          {isLoading ? '…' : isSubscribed ? 'Désactiver' : 'Activer'}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Catégories
        </h2>
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center justify-between p-4 bg-white rounded-xl shadow">
            <div>
              <p className="font-medium">{cat.label}</p>
              <p className="text-sm text-gray-400">{cat.desc}</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={isSubscribed}
              disabled={!isSubscribed}
              className="w-5 h-5 accent-green-600 disabled:opacity-30"
            />
          </div>
        ))}
      </div>

      {!isSubscribed && (
        <p className="text-xs text-center text-gray-400">
          Activez les notifications pour configurer les catégories
        </p>
      )}
    </main>
  )
}