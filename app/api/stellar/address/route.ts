import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Keypair } from '@stellar/stellar-sdk'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()
    const nonce = cookieStore.get('auth_nonce')?.value

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { address, signature } = await request.json()

    if (!address || typeof address !== 'string' || !signature) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (!nonce) {
      return NextResponse.json({ error: 'Sesión de vinculación expirada. Por favor intenta de nuevo.' }, { status: 400 })
    }

    // 1. Verificar Firma (Seguridad)
    try {
      const keypair = Keypair.fromPublicKey(address)
      const message = `Sign this message to link your wallet to Crypto College: ${nonce}`
      const isValid = keypair.verify(Buffer.from(message), Buffer.from(signature, 'base64'))
      
      if (!isValid) {
        return NextResponse.json({ error: 'La firma de la wallet no es válida.' }, { status: 401 })
      }
    } catch (e) {
      console.error('Error verificando firma:', e)
      return NextResponse.json({ error: 'Error al verificar la propiedad de la wallet.' }, { status: 400 })
    }

    // 2. Verificar Unicidad Activa (Regla de negocio)
    // Buscamos si la wallet ya está vinculada a otra cuenta y NO ha sido desvinculada.
    const { data: existingWallet } = await supabase
      .from('user_wallets')
      .select('user_id')
      .eq('wallet_address', address)
      .is('unlinked_at', null)
      .single()

    if (existingWallet) {
      if (existingWallet.user_id === user.id) {
        return NextResponse.json({ success: true, message: 'Wallet ya vinculada.' })
      }
      return NextResponse.json({ 
        error: 'Esta wallet ya está asociada a otra cuenta.',
        help: 'Si deseas usar esta wallet aquí, primero desvincúlala desde la cuenta donde fue registrada.'
      }, { status: 409 })
    }

    // 3. Vincular Wallet
    const { error: linkError } = await supabase
      .from('user_wallets')
      .insert({ 
        user_id: user.id, 
        wallet_address: address,
        network: 'stellar'
      })

    if (linkError) {
      console.error('Error insertando en user_wallets:', linkError)
      return NextResponse.json({ error: 'Error al guardar la vinculación en la base de datos.' }, { status: 500 })
    }

    // Actualizar profile para retrocompatibilidad
    await supabase
      .from('profiles')
      .update({ stellar_address: address })
      .eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
