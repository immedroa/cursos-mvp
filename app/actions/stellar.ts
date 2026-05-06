import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveStellarAddress(address: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autenticado')
  }

  if (!address || address.trim() === '') {
    throw new Error('Dirección de wallet inválida')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ stellar_address: address })
    .eq('id', user.id)

  if (error) {
    console.error('Error al guardar stellar_address:', error)
    throw new Error('Error al persistir la wallet en la base de datos')
  }

  revalidatePath('/plataforma')
  
  return { success: true }
}
