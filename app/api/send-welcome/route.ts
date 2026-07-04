import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function POST(req: Request) {
  // ✅ Instanciation à l'intérieur de la fonction pour éviter le crash au build
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { email, restaurantName, city } = await req.json()

  const { error } = await resend.emails.send({
    from: 'Clean Kitchen <bonjour@cleankitchen.fr>',
    to: email,
    subject: '🎉 Bienvenue sur Clean Kitchen !',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #030b1d; color: white; border-radius: 16px;">
        <img src="https://cleankitchen.fr/ck-logo-new.png" alt="Clean Kitchen" style="height: 48px; margin-bottom: 32px;" />
        <h1 style="color: #22d3ee; font-size: 28px; margin-bottom: 8px;">Bienvenue sur Clean Kitchen !</h1>
        <p style="color: rgba(255,255,255,0.7); font-size: 16px;">Votre restaurant <strong style="color: white;">${restaurantName}</strong> à <strong style="color: white;">${city}</strong> est maintenant configuré.</p>
        <p style="color: rgba(255,255,255,0.7); font-size: 16px;">Vous pouvez vous connecter à tout moment sur :</p>
        <a href="https://cleankitchen.fr" style="display: inline-block; background: #22d3ee; color: black; font-weight: bold; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">Accéder à Clean Kitchen</a>
        <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 32px;">Clean Kitchen — Système HACCP digital</p>
      </div>
    `,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ success: true })
}
