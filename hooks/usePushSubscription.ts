'use client'
import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { createClient } from '@/lib/supabase/client'

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const platform = Capacitor.getPlatform() // 'android' | 'ios' | 'web'
  const isNative = platform === 'android' || platform === 'ios'

  useEffect(() => {
    console.log('[Push] platform:', platform, 'isNative:', isNative)
    if (isNative) {
      PushNotifications.checkPermissions().then((status) => {
        console.log('[Push] permission status:', status.receive)
        setIsSubscribed(status.receive === 'granted')
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
    console.log('[Push] subscribeNative called')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('[Push] no user found')
      return
    }

    let permission = await PushNotifications.checkPermissions()
    console.log('[Push] permission before request:', permission.receive)
    if (permission.receive === 'prompt') {
      permission = await PushNotifications.requestPermissions()
    }
    if (permission.receive !== 'granted') {
      console.error('[Push] permission not granted:', permission.receive)
      return
    }

    await PushNotifications.removeAllListeners()

    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] FCM token received:', token.value.substring(0, 20) + '...')
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: token.value,
        platform: 'android',
      }, { onConflict: 'endpoint' })
      if (error) {
        console.error('[Push] supabase upsert error:', error)
      } else {
        console.log('[Push] token saved to supabase')
        setIsSubscribed(true)
      }
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('[Push] FCM registration error:', JSON.stringify(err))
    })

    await PushNotifications.register()
    console.log('[Push] register() called')
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