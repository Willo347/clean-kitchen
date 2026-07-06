'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePushSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNative, setIsNative] = useState(false)
  const [debugLog, setDebugLog] = useState<string[]>([])

  const log = (msg: string) => {
    console.log('[Push]', msg)
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()} ${msg}`])
  }

  async function subscribeNative() {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const supabase = createClient()
    log('subscribeNative start')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { log('❌ no user'); return }
    log(`user: ${user.id.substring(0, 8)}...`)

    let permission = await PushNotifications.checkPermissions()
    log(`permission: ${permission.receive}`)
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions()
    }
    if (permission.receive !== 'granted') { log('❌ permission denied'); return }

    const localPerm = await LocalNotifications.requestPermissions()
    log(`local permission: ${localPerm.display}`)

    await LocalNotifications.createChannel({
      id: 'push-channel',
      name: 'Notifications',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
    })

    await PushNotifications.removeAllListeners()

    PushNotifications.addListener('registration', async (token) => {
      log(`✅ token: ${token.value.substring(0, 15)}...`)
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: token.value,
        platform: 'android',
      }, { onConflict: 'endpoint' })
      if (error) { log(`❌ supabase: ${error.message}`) }
      else { log('✅ saved to supabase'); setIsSubscribed(true) }
    })

    PushNotifications.addListener('registrationError', (err) => {
      log(`❌ FCM error: ${JSON.stringify(err)}`)
    })

    PushNotifications.addListener('pushNotificationReceived', async (notification) => {
      log(`📩 reçue foreground: ${notification.title}`)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title ?? '', {
          body: notification.body ?? '',
          icon: '/icon-192.png',
        })
      } else {
        await LocalNotifications.schedule({
          notifications: [{
            title: notification.title ?? '',
            body: notification.body ?? '',
            id: Math.floor(Math.random() * 10000),
            channelId: 'push-channel',
            schedule: { at: new Date(Date.now() + 500) },
          }]
        })
      }
    })

    await PushNotifications.register()
    log('register() called')
  }

  useEffect(() => {
    const checkPlatform = async () => {
      const { Capacitor } = await import('@capacitor/core')
      const platform = Capacitor.getPlatform()
      const native = platform === 'android' || platform === 'ios'
      setIsNative(native)
      log(`platform: ${platform}`)

      if (native) {
        await subscribeNative()
      } else {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        navigator.serviceWorker.register('/sw.js').then(async (reg) => {
          const sub = await reg.pushManager.getSubscription()
          setIsSubscribed(!!sub)
        }).catch(console.error)
      }
    }
    checkPlatform()
  }, [])

  async function subscribe() {
    setIsLoading(true)
    try {
      if (isNative) await subscribeNative()
      else await subscribeWeb()
    } catch (e: any) {
      log(`❌ error: ${e.message}`)
    } finally {
      setIsLoading(false)
    }
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
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, isLoading, subscribe, unsubscribe, debugLog }
}