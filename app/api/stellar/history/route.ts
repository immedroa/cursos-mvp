import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    console.log(`[HISTORY] Buscando historial para user_id: ${user.id}`)
    
    // 1. Ver cuántas filas existen en total para este usuario (sin filtrar por hash) para debug
    const { count } = await supabase
      .from('mentor_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    console.log(`[HISTORY] Total de registros encontrados para el usuario: ${count || 0}`)

    const { data, error } = await supabase
      .from('mentor_redemptions')
      .select('id, mentor_id, points_spent, reward_amount_xlm, reward_tx_hash, created_at')
      .eq('user_id', user.id)
      .not('reward_tx_hash', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[HISTORY] Error de Supabase al leer historial:', error)
      return NextResponse.json({ error: 'Error al cargar el historial' }, { status: 500 })
    }

    console.log(`[HISTORY] Registros con hash encontrados: ${data?.length || 0}`)

    return NextResponse.json({ 
      history: data || [],
      debug: { totalRows: count || 0, filteredRows: data?.length || 0 }
    })
  } catch (error) {
    console.error('Error in API route history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
