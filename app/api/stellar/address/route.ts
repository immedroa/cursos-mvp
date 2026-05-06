import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { address } = await request.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Dirección inválida' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ stellar_address: address })
      .eq('id', user.id)

    if (error) {
      console.error('Error actualizando stellar_address:', error)
      return NextResponse.json({ error: 'Error en base de datos' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
