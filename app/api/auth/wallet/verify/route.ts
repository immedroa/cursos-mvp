import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { Keypair } from '@stellar/stellar-sdk'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { address, signature } = await request.json()
    const cookieStore = await cookies()
    const nonce = cookieStore.get('auth_nonce')?.value

    if (!nonce) {
      return NextResponse.json({ error: 'Sesión expirada o nonce no encontrado' }, { status: 400 })
    }

    if (!address || !signature) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    // 1. Verificar firma con Stellar SDK
    try {
      console.log('[AUTH_VERIFY] Iniciando verificación:', { address, nonce, signatureLength: signature?.length });
      
      const keypair = Keypair.fromPublicKey(address)
      const message = `Sign this message to login to Crypto College: ${nonce}`
      
      console.log('[AUTH_VERIFY] Mensaje esperado:', message);

      let signatureBuffer;
      try {
        signatureBuffer = Buffer.from(signature, 'base64');
      } catch (e) {
        console.error('[AUTH_VERIFY] Error decodificando firma base64:', e);
        return NextResponse.json({ error: 'Firma no es base64' }, { status: 400 });
      }

      const isValid = keypair.verify(Buffer.from(message), signatureBuffer)
      console.log('[AUTH_VERIFY] ¿Firma válida?:', isValid);
      
      if (!isValid) {
        return NextResponse.json({ 
          error: 'Firma inválida',
          debug: { expectedMessage: message }
        }, { status: 401 })
      }
    } catch (e: any) {
      console.error('[AUTH_VERIFY] Excepción en verificación:', e);
      return NextResponse.json({ error: 'Error en verificación', details: e.message }, { status: 400 })
    }

    // 2. Buscar vinculación en user_wallets
    const supabaseAdmin = createAdminClient()
    
    const { data: walletLink } = await supabaseAdmin
      .from('user_wallets')
      .select('user_id')
      .eq('wallet_address', address)
      .single()

    let email: string | undefined
    let userId: string | undefined

    if (walletLink) {
      // Usuario ya tiene la wallet vinculada, obtenemos su email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(walletLink.user_id)
      email = userData.user?.email
      userId = userData.user?.id
    }

    if (!email) {
      // 3. Si no hay vinculación, buscamos por el email ficticio o creamos uno
      const placeholderEmail = `${address.toLowerCase()}@stellar.id`
      
      const { data: profileData } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .eq('email', placeholderEmail)
        .single()
      
      if (profileData) {
        email = profileData.email
        userId = profileData.id
      } else {
        // 4. Crear nuevo usuario si no existe
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: placeholderEmail,
          email_confirm: true,
          user_metadata: { stellar_address: address }
        })
        
        if (createError || !newUser.user) {
          console.error('Error creando usuario:', createError)
          return NextResponse.json({ error: 'No se pudo crear el usuario' }, { status: 500 })
        }
        
        email = newUser.user.email
        userId = newUser.user.id
      }

      // 5. Vincular la wallet al nuevo/encontrado usuario si no estaba vinculada
      if (userId) {
        await supabaseAdmin
          .from('user_wallets')
          .insert({ 
            user_id: userId, 
            wallet_address: address,
            network: 'stellar'
          })
      }
    }

    // 6. Generar link de login
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email!,
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback?next=/plataforma`
      }
    })

    if (error || !data.properties?.action_link) {
      console.error('Error generando link:', error)
      return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      action_link: data.properties.action_link 
    })

  } catch (error) {
    console.error('Error en API auth verify:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
