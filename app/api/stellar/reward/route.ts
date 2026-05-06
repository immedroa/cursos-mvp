import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as StellarSdk from '@stellar/stellar-sdk'

export async function POST(request: Request) {
  try {
    console.log('[REWARD] Iniciando proceso de recompensa...')
    const supabase = await createClient()

    // 1. Validar sesión
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('[REWARD] No hay sesión de usuario')
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { mentorRedemptionId } = await request.json()

    // 2. Obtener datos del perfil (stellar_address)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stellar_address')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.stellar_address) {
      console.error('[REWARD] Perfil sin stellar_address:', profileError)
      return NextResponse.json({ error: 'Usuario no tiene wallet conectada' }, { status: 400 })
    }

    // 3. Configurar Stellar SDK (House Account)
    const houseSecret = process.env.STELLAR_HOUSE_SECRET_TESTNET
    console.log('[REWARD] Verificando clave secreta house...')
    if (!houseSecret) {
      console.error('[REWARD] ERROR: STELLAR_HOUSE_SECRET_TESTNET no configurada en variables de entorno')
      return NextResponse.json({ error: 'Configuración de servidor incompleta' }, { status: 500 })
    }

    let sourceKeypair
    try {
      sourceKeypair = StellarSdk.Keypair.fromSecret(houseSecret)
      console.log('[REWARD] Keypair generado exitosamente para:', sourceKeypair.publicKey())
    } catch (e: any) {
      console.error('[REWARD] ERROR: Clave secreta house inválida:', e.message)
      return NextResponse.json({ error: 'Error de configuración de wallet' }, { status: 500 })
    }

    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org')

    // 4. Construir la transacción
    console.log('[REWARD] Cargando cuenta house desde Horizon...')
    let sourceAccount
    try {
      sourceAccount = await server.loadAccount(sourceKeypair.publicKey())
      console.log('[REWARD] Cuenta house cargada. Saldo XLM:', sourceAccount.balances.find((b: any) => b.asset_type === 'native')?.balance)
    } catch (e: any) {
      console.error('[REWARD] ERROR: No se pudo cargar cuenta house (¿existe en testnet?):', e?.response?.data || e.message)
      return NextResponse.json({ error: 'Cuenta emisora no encontrada o inactiva' }, { status: 500 })
    }

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: profile.stellar_address,
          asset: StellarSdk.Asset.native(),
          amount: '1',
        })
      )
      .setTimeout(30)
      .build()

    // 5. Firmar y enviar a Horizon Testnet
    console.log('[REWARD] Firmando y enviando transacción...')
    transaction.sign(sourceKeypair)

    let result
    try {
      result = await server.submitTransaction(transaction)
      console.log('[REWARD] Transacción exitosa. Hash:', result.hash)
    } catch (e: any) {
      console.error('[REWARD] ERROR en submitTransaction:', e?.response?.data || e)
      return NextResponse.json(
        { success: false, error: 'submit_failed', details: e?.response?.data || String(e) },
        { status: 500 }
      )
    }

    const txHash = result.hash

    // 6. Guardar el tx_hash en la tabla del canje para el historial
    if (mentorRedemptionId) {
      console.log('[REWARD] Actualizando registro de canje en Supabase:', mentorRedemptionId)
      const { error: updateError } = await supabase
        .from('mentor_redemptions')
        .update({ 
          reward_amount_xlm: 1,
          reward_tx_hash: txHash 
        })
        .eq('id', mentorRedemptionId)
      
      if (updateError) console.error('[REWARD] Error al actualizar Supabase:', updateError)
    }

    // URL del explorer
    const explorerUrl = `https://testnet.steexp.com/tx/${txHash}`

    return NextResponse.json({ success: true, txHash, explorerUrl })

  } catch (error: any) {
    console.error('[REWARD] ERROR CRÍTICO NO CONTROLADO:', error.message || error)
    return NextResponse.json(
      { success: false, error: 'internal_error', details: error.message || String(error) },
      { status: 500 }
    )
  }
}
