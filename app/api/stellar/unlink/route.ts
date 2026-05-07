import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // Soft delete: Marcar la wallet activa como desvinculada
    const { error: unlinkError } = await supabase
      .from('user_wallets')
      .update({ unlinked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('unlinked_at', null)

    if (unlinkError) {
      console.error('Error al desvincular:', unlinkError)
      return NextResponse.json({ error: 'Error al procesar la desvinculación' }, { status: 500 })
    }

    // Limpiar profile para retrocompatibilidad
    await supabase
      .from('profiles')
      .update({ stellar_address: null })
      .eq('id', user.id)

    return NextResponse.json({ success: true, message: 'Wallet desvinculada' })
    
  } catch (error) {
    console.error('Error en API unlink:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
