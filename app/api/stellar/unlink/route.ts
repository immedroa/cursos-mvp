import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 1. Soft delete: marcar como desvinculada
    const { error: walletError } = await supabase
      .from('user_wallets')
      .update({ unlinked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('unlinked_at', null)

    if (walletError) {
      console.error('Error desvinculando de user_wallets:', walletError)
      return NextResponse.json({ error: 'Error en base de datos al desvincular.' }, { status: 500 })
    }

    // 2. Limpiar el campo en profiles para retrocompatibilidad
    await supabase
      .from('profiles')
      .update({ stellar_address: null })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
