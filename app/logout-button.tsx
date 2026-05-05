'use client'

import { createClient } from '../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/acceso')
  }

  return (
    <button onClick={handleLogout} style={{ padding: '12px', marginTop: '16px' }}>
      Cerrar sesión
    </button>
  )
}
