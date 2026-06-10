import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const VAPID_PUBLIC  = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_EMAIL   = 'mailto:admin@cleankitchen.app'

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE)

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
    url: body.url ?? '/',
  })

  const results = await Promise.allSettled(
    (subs ?? []).map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
    )
  )

  const expired = (subs ?? []).filter((_, i) => {
    const r = results[i]
    return r.status === 'rejected' && (r as PromiseRejectedResult).reason?.statusCode === 410
  })
  if (expired.length) {
    await supabase.from('push_subscriptions')
      .delete()
      .in('endpoint', expired.map((s) => s.endpoint))
  }

  return new Response(JSON.stringify({ sent: results.length, expired: expired.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})