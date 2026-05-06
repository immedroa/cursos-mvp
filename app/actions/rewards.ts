import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function claimLessonReward(lessonId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  // 1. Verificar si ya tiene la recompensa
  const { data: existingReward } = await supabase
    .from('lesson_rewards')
    .select('id')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId)
    .single()

  if (existingReward) {
    return { success: true, alreadyRewarded: true }
  }

  // 2. Insertar recompensa
  const { error: rewardError } = await supabase
    .from('lesson_rewards')
    .insert({
      user_id: user.id,
      lesson_id: lessonId,
      points_earned: 50,
    })

  if (rewardError) {
    throw new Error('Error al registrar la recompensa')
  }

  // 3. Incrementar puntos de forma atómica usando RPC
  // Nota: Requiere la función 'increment_points' creada en Supabase
  const { error: rpcError } = await supabase
    .rpc('increment_points', { 
      user_id: user.id, 
      amount: 50 
    })

  if (rpcError) {
    console.error('Error al incrementar puntos via RPC:', rpcError)
    // Fallback manual si el RPC falla (por si no se ha creado la función aún)
    const { data: profile } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', user.id)
      .single()

    await supabase
      .from('profiles')
      .update({ points: (profile?.points || 0) + 50 })
      .eq('id', user.id)
  }

  revalidatePath('/plataforma', 'layout')
  
  return { success: true, alreadyRewarded: false }
}
