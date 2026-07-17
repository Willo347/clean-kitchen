import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Tables contenant des données rattachées à un restaurant.
// La colonne de rattachement est restaurant_id partout, sauf push_subscriptions (user_id).
const RESTAURANT_TABLES = [
  'temperature_logs',
  'equipments',
  'maintenance_reports',
  'maintenance_certificates',
  'traceability_products',
  'employee_hours',
  'employee_shifts',
  'employees',
  'production_logs',
  'pms_tasks',
  'stock_movements',
  'settings',
]

function pathFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    const accessToken = authHeader.replace('Bearer ', '')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Vérifie l'identité de l'appelant à partir de son propre token (jamais faire confiance à un id envoyé par le client)
    const authClient = createClient(supabaseUrl, anonKey)
    const { data: { user }, error: userError } = await authClient.auth.getUser(accessToken)
    if (userError || !user) {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const restaurantId = user.id
    const admin = createClient(supabaseUrl, serviceKey)

    // 1) Récupérer les fichiers liés à ce restaurant avant de supprimer les lignes qui les référencent
    const { data: certs } = await admin
      .from('maintenance_certificates')
      .select('file_url')
      .eq('restaurant_id', restaurantId)

    const { data: products } = await admin
      .from('traceability_products')
      .select('image_url, delivery_note_url')
      .eq('restaurant_id', restaurantId)

    const certPaths = (certs || [])
      .map((c) => pathFromPublicUrl(c.file_url, 'certificates'))
      .filter((p): p is string => !!p)

    const imagePaths = (products || [])
      .flatMap((p) => [
        pathFromPublicUrl(p.image_url, 'traceability-images'),
        pathFromPublicUrl(p.delivery_note_url, 'traceability-images'),
      ])
      .filter((p): p is string => !!p)

    if (certPaths.length) await admin.storage.from('certificates').remove(certPaths)
    if (imagePaths.length) await admin.storage.from('traceability-images').remove(imagePaths)

    // 2) Supprimer toutes les lignes rattachées au restaurant
    for (const table of RESTAURANT_TABLES) {
      await admin.from(table).delete().eq('restaurant_id', restaurantId)
    }
    await admin.from('push_subscriptions').delete().eq('user_id', restaurantId)

    // 3) Supprimer le compte d'authentification lui-même
    const { error: deleteError } = await admin.auth.admin.deleteUser(restaurantId)
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
