import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import webpush from 'npm:web-push@3.6.7'
// @ts-ignore
import { initializeApp, cert, getApps } from 'npm:firebase-admin/app'
// @ts-ignore
import { getMessaging } from 'npm:firebase-admin/messaging'

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_EMAIL   = 'mailto:admin@cleankitchen.app'

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

const serviceAccountStr = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
const serviceAccount = serviceAccountStr ? JSON.parse(serviceAccountStr) : null

if (serviceAccount && getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) })
}

async function sendFCM(token: string, title: string, body: string): Promise<void> {
  const messaging = getMessaging()
  await messaging.send({
    token,
    notification: { title, body },
    android: { priority: 'high' },
  })
}

serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  if (!authHeader.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const body = await req.json() as {
    title: string
    message: string
    url?: string
    user_ids?: string[]
  }

  let query = supabase.from('push_subscriptions').select('*')
  if (body.user_ids?.length) {
    query = query.in('user_id', body.user_ids)
  }
  const { data: subs } = await query

  const payload = JSON.stringify({
    title: body.title,
    body: body.message,
    icon: '/icon-192.png',
    url: body.url ? `https://cleankitchen.fr${body.url}` : 'https://cleankitchen.fr',
  })

  const results = await Promise.allSettled(
    (subs ?? []).map((s) => {
      if (s.platform === 'android' && serviceAccount) {
        return sendFCM(s.endpoint, body.title, body.message)
      }
      return webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload,
        { TTL: 86400, urgency: 'normal' }
      )
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const errors = results
    .filter(r => r.status === 'rejected')
    .map(r => (r as PromiseRejectedResult).reason?.message ?? 'unknown')

  if (errors.length) console.error('Push errors:', errors)

  const expired = (subs ?? []).filter((_, i) => {
    const r = results[i]
    return r.status === 'rejected' && (r as PromiseRejectedResult).reason?.statusCode === 410
  })
  if (expired.length) {
    await supabase.from('push_subscriptions')
      .delete()
      .in('endpoint', expired.map(s => s.endpoint))
  }

  return new Response(JSON.stringify({ sent, expired: expired.length, errors }), {
    headers: { 'Content-Type': 'application/json' },
  })
})