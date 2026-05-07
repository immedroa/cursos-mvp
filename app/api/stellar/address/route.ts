import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Obtener usuario autenticado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    // 2. Leer datos del body
    const { address, network } = await request.json()

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Dirección de wallet requerida' }, { status: 400 })
    }

    // 3. Lógica de Reactivación / Vinculación
    
    // Paso A: ¿Este usuario ya tuvo esta misma wallet vinculada antes?
    const { data: pastRecord } = await supabase
      .from('user_wallets')
      .select('id, unlinked_at')
      .eq('user_id', user.id)
      .eq('wallet_address', address)
      .single()

    if (pastRecord) {
      // Si ya está activa, no hacemos nada (idempotente)
      if (pastRecord.unlinked_at === null) {
        return NextResponse.json({ success: true, message: 'Wallet ya vinculada y activa.' })
      }
      
      // Si existe pero está desvinculada (soft delete), la REACTIVAMOS
      const { error: reactivateError } = await supabase
        .from('user_wallets')
        .update({ unlinked_at: null, network: network || 'stellar-testnet' })
        .eq('id', pastRecord.id)

      if (reactivateError) {
        console.error('Error reactivando wallet:', reactivateError)
        return NextResponse.json({ error: 'Error al reactivar la vinculación' }, { status: 500 })
      }

      // Sincronizar profile
      await supabase.from('profiles').update({ stellar_address: address }).eq('id', user.id)

      return NextResponse.json({ success: true, message: 'Wallet reactivada correctamente' })
    }

    // Paso B: Si es una vinculación "nueva" para este usuario, verificar Unicidad Global Activa
    // (Asegurarnos que otro usuario no la tenga vinculada actualmente)
    const { data: otherUserWallet } = await supabase
      .from('user_wallets')
      .select('user_id')
      .eq('wallet_address', address)
      .is('unlinked_at', null)
      .single()

    if (otherUserWallet) {
      return NextResponse.json({ 
        error: 'Esta wallet ya está asociada a otra cuenta.',
        help: 'Si deseas usar esta wallet aquí, primero desvincúlala de la otra cuenta.'
      }, { status: 409 })
    }

    // Paso C: Insertar nueva vinculación
    const { error: insertError } = await supabase
      .from('user_wallets')
      .insert({ 
        user_id: user.id, 
        wallet_address: address,
        network: network || 'stellar-testnet'
      })

    if (insertError) {
      console.error('Error insertando nueva vinculación:', insertError)
      return NextResponse.json({ error: 'Error al guardar la vinculación' }, { status: 500 })
    }

    // Sincronizar profile
    await supabase.from('profiles').update({ stellar_address: address }).eq('id', user.id)

    return NextResponse.json({ success: true, message: 'Wallet vinculada correctamente' })

  } catch (error) {
    console.error('Error en API vinculación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
