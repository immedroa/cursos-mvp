import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import * as StellarSdk from '@stellar/stellar-sdk'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Validar sesión
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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
      return NextResponse.json({ error: 'Usuario no tiene wallet conectada' }, { status: 400 })
    }

    // 3. Configurar Stellar SDK (House Account)
    const houseSecret = process.env.STELLAR_HOUSE_SECRET_TESTNET
    if (!houseSecret) {
      console.error('Error: STELLAR_HOUSE_SECRET_TESTNET no configurada')
      return NextResponse.json({ error: 'Error de configuración en el servidor' }, { status: 500 })
    }

    const sourceKeypair = StellarSdk.Keypair.fromSecret(houseSecret)
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org')

    // 4. Construir la transacción
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey())
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
    transaction.sign(sourceKeypair)

    let result
    try {
      result = await server.submitTransaction(transaction)
    } catch (e: any) {
      console.error('Error al enviar tx a Stellar:', e?.response?.data || e)
      return NextResponse.json(
        { success: false, error: 'submit_failed', details: e?.response?.data },
        { status: 500 }
      )
    }

    const txHash = result.hash

    // 6. Guardar el tx_hash en la tabla del canje para el historial
    if (mentorRedemptionId) {
      await supabase
        .from('mentor_redemptions')
        .update({ 
          reward_amount_xlm: 1,
          reward_tx_hash: txHash 
        })
        .eq('id', mentorRedemptionId)
    }

    // URL del explorer
    const explorerUrl = `https://testnet.steexp.com/tx/${txHash}`

    return NextResponse.json({ success: true, txHash, explorerUrl })

  } catch (error) {
    console.error('Error general en API reward:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
