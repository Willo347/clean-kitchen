'use client'
import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { createClient } from '@/lib/supabase/client'

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (isNative) {
      // Android natif : vérifier permission FCM
      PushNotifications.checkPermissions().then((status) => {
        setIsSubscribed(status.receive === 'granted')
      })
    } else {
      // Web : vérifier VAPID
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      navigator.serviceWorker.register('/sw.js').then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        setIsSubscribed(!!sub)
      }).catch(console.error)
    }
  }, [])

  async function subscribe() {
    setIsLoading(true)
    try {
      if (isNative) {
        await subscribeNative()
      } else {
        await subscribeWeb()
      }
    } catch (e) {
      console.error('Erreur subscribe:', e)
    } finally {
      setIsLoading(false)
    }
  }

  async function subscribeNative() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let permission = await PushNotifications.checkPermissions()
    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions()
    }
    if (permission.receive !== 'granted') return

    await PushNotifications.register()

    // Le token FCM arrive via l'event 'registration'
    PushNotifications.addListener('registration', async (token) => {
      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: token.value, // token FCM stocké dans endpoint
        platform: 'android',
      }, { onConflict: 'endpoint' })
      setIsSubscribed(true)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('FCM registration error:', err)
    })
  }

  async function subscribeWeb() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    const keys = sub.toJSON().keys as { p256dh: string; auth: string }
    await supabase.from('push_subscriptions').upsert({
      endpoint: sub.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_id: user.id,
      platform: 'web',
    }, { onConflict: 'endpoint' })
    setIsSubscribed(true)
  }

  async function unsubscribe() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      if (isNative) {
        await PushNotifications.removeAllListeners()
        setIsSubscribed(false)
      } else {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (sub) {
          await sub.unsubscribe()
          await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        setIsSubscribed(false)
      }
    } catch (e) {
      console.error('Erreur unsubscribe:', e)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, subscribe, unsubscribe }
}