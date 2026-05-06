import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { mentorId, pointsSpent } = await request.json()

    if (!mentorId) {
      return NextResponse.json({ error: 'mentorId es requerido' }, { status: 400 })
    }

    // 1. Insertar el registro de canje
    const { data: redemption, error: redemptionError } = await supabase
      .from('mentor_redemptions')
      .insert({
        user_id: user.id,
        mentor_id: mentorId,
        points_spent: pointsSpent || 100,
      })
      .select('id')
      .single()

    if (redemptionError || !redemption) {
      console.error('Error al registrar canje de mentoría:', redemptionError)
      return NextResponse.json({ error: 'Error al procesar el canje' }, { status: 500 })
    }

    // 2. Descontar los puntos del perfil
    const { error: pointsError } = await supabase
      .rpc('increment_points', { 
        amount: -(pointsSpent || 100)
      })

    if (pointsError) {
      console.error('Error al descontar puntos:', pointsError)
    }

    return NextResponse.json({ success: true, redemptionId: redemption.id })
  } catch (error) {
    console.error('Error en API route mentorship:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
