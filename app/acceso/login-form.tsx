'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'

export default function LoginForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/plataforma`,
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Te enviamos un Magic Link a tu correo.')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2 block ml-1">Email Address</label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.08] transition-all"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-yellow-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5 active:scale-95 transition-transform"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : 'Entrar con Magic Link'}
      </button>

      {message && (
        <div className={`mt-4 p-4 rounded-xl text-xs font-bold text-center uppercase tracking-widest ${message.includes('Error') ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'}`}>
          {message}
        </div>
      )}
    </form>
  )
}
