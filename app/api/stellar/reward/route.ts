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

    // 4. Construir y enviar la transacción
    try {
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey())
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: profile.stellar_address,
            asset: StellarSdk.Asset.native(),
            amount: '1', // 1 XLM Recompensa Demo
          })
        )
        .setTimeout(30)
        .build()

      transaction.sign(sourceKeypair)
      const result = await server.submitTransaction(transaction)
      
      const txHash = result.hash
      const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${txHash}`

      // 5. Persistir el hash en mentor_redemptions (opcional pero recomendado)
      if (mentorRedemptionId) {
        await supabase
          .from('mentor_redemptions')
          .update({ 
            reward_amount_xlm: 1,
            reward_tx_hash: txHash 
          })
          .eq('id', mentorRedemptionId)
      }

      return NextResponse.json({ 
        success: true, 
        txHash, 
        explorerUrl 
      })

    } catch (stellarError: any) {
      console.error('Error en transacción Stellar:', stellarError?.response?.data || stellarError)
      return NextResponse.json({ 
        error: 'Error al enviar recompensa XLM', 
        details: stellarError?.response?.data?.extras?.result_codes || 'Unknown error' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error general en API reward:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
