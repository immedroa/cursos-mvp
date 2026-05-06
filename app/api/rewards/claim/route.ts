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

    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId es requerido' }, { status: 400 })
    }

    // 1. Intentar insertar la recompensa directamente
    const { error: rewardError } = await supabase
      .from('lesson_rewards')
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        points_earned: 50,
      })

    if (rewardError) {
      // 23505 = Unique Violation (ya reclamado)
      if (rewardError.code === '23505') {
        return NextResponse.json({ success: true, alreadyRewarded: true })
      }
      console.error('Error al registrar recompensa:', rewardError)
      return NextResponse.json({ error: 'No se pudo procesar la recompensa' }, { status: 500 })
    }

    // 2. Incrementar puntos de forma atómica
    const { data: newTotal, error: rpcError } = await supabase
      .rpc('increment_points', { 
        amount: 50 
      })

    if (rpcError) {
      console.error('Error crítico al incrementar puntos:', rpcError)
      return NextResponse.json({ error: 'Error al actualizar puntos' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      alreadyRewarded: false, 
      newPoints: newTotal 
    })
  } catch (error) {
    console.error('Error en API route rewards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
