'use client'
import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { createClient } from '@/lib/supabase/client'

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const platform = Capacitor.getPlatform()
  const isNative = platform === 'android' || platform === 'ios'

  useEffect(() => {
    if (isNative) {
      import('@capacitor/push-notifications').then(({ PushNotifications }) => {
        PushNotifications.checkPermissions().then((status) => {
          setIsSubscribed(status.receive === 'granted')
        })
      })
    } else {
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
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let permission = await PushNotifications.checkPermissions()
    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions()
    }
    if (permission.receive !== 'granted') return

    await PushNotifications.removeAllListeners()

    PushNotifications.addListener('registration', async (token) => {
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: token.value,
        platform: 'android',
      }, { onConflict: 'endpoint' })
      if (!error) setIsSubscribed(true)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('FCM registration error:', JSON.stringify(err))
    })

    await PushNotifications.register()
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
        const { PushNotifications } = await import('@capacitor/push-notifications')
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