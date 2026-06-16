import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const token = searchParams.get('token')
  const type = searchParams.get('type') as 'invite' | 'recovery' | 'email' | null

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  let error = null

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    error = result.error
  } else if (token_hash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash, type })
    error = result.error
    // ✅ Laisser le temps à la session de s'écrire dans les cookies
    await new Promise(r => setTimeout(r, 500))
  } else if (token && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: token, type })
    error = result.error
    await new Promise(r => setTimeout(r, 500))
  }

  if (error) {
    console.error('[auth/callback] error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=token_invalid`)
  }

  // ✅ Récupération du mot de passe oublié → page reset
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset`)
  }

  // ✅ Invitation → toujours vers /setup (le mot de passe n'est pas encore défini)
  if (type === 'invite') {
    return NextResponse.redirect(`${origin}/setup`)
  }

  // Connexion normale → vérifier si le restaurant est déjà configuré
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: settings } = await supabase
      .from('settings')
      .select('restaurant_name')
      .eq('restaurant_id', user.id)
      .maybeSingle()

    if (settings?.restaurant_name) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/setup`)
}
