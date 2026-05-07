import { NextResponse } from 'next/server'

export async function GET() {
  const nonce = crypto.randomUUID()
  
  const response = NextResponse.json({ nonce })
  response.cookies.set('auth_nonce', nonce, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5 // 5 minutos
  })
  
  return response
}
