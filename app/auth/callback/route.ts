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
  } else if (token && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: token, type })
    error = result.error
  }

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=token_invalid`)
  }

  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset`)
  }

  // Vérifier si le restaurant est déjà configuré
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: settings } = await supabase
      .from('settings')
      .select('id')
      .eq('restaurant_id', user.id)
      .single()

    if (settings) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/setup`)
}