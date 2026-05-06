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

    const { data, error } = await supabase
      .from('mentor_redemptions')
      .select('id, mentor_id, points_spent, reward_amount_xlm, reward_tx_hash, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mentorship history:', error)
      return NextResponse.json({ error: 'Error al cargar el historial' }, { status: 500 })
    }

    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error('Error in API route history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
