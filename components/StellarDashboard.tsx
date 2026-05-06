'use client'

import { useState, useEffect } from 'react'
import { 
  isConnected, 
  getPublicKey, 
} from '@stellar/freighter-api'

interface StellarDashboardProps {
  initialPoints: number
  initialStellarAddress: string | null
}

export default function StellarDashboard({ initialPoints, initialStellarAddress }: StellarDashboardProps) {
  const [points] = useState(initialPoints)
  const [stellarAddress, setStellarAddress] = useState(initialStellarAddress)
  const [loading, setLoading] = useState(false)

  // Sincronizar estado local con props si cambian (por revalidatePath)
  useEffect(() => {
    setStellarAddress(initialStellarAddress)
  }, [initialStellarAddress])

  const handleConnectWallet = async () => {
    setLoading(true)
    try {
      // 1. Verificar si Freighter está instalado
      if (!await isConnected()) {
        alert('Por favor instala la extensión Freighter para conectar tu wallet.')
        setLoading(false)
        return
      }

      // 2. Obtener la llave pública (esto dispara el popup de Freighter)
      const publicKey = await getPublicKey()
      
      if (!publicKey) {
        throw new Error('No se pudo obtener la llave pública')
      }

      // 3. Persistir en Supabase via API Route
      const response = await fetch('/api/stellar/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: publicKey }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar la dirección en el servidor')
      }
      
      setStellarAddress(publicKey)
      console.log('Wallet conectada y guardada via API:', publicKey)
    } catch (error) {
      console.error('Error al conectar wallet:', error)
      alert('Hubo un problema al conectar con Freighter. Asegúrate de haber iniciado sesión en la extensión.')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemMentorship = () => {
    console.log('TODO: Canjear mentoría con Stellar')
    alert('Próximamente: Canje de mentoría por puntos')
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <section className="grid gap-6 md:grid-cols-3 mb-12">
      {/* A) Bloque "Mis puntos" */}
      <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] relative overflow-hidden group hover:border-yellow-400/30 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-2xl"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Acumulados</p>
        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mis Puntos</h3>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-yellow-400 leading-none">{points}</span>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest pb-1">PTS</span>
        </div>
      </div>

      {/* B) Bloque "Mi wallet Stellar" */}
      <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] relative overflow-hidden group hover:border-yellow-400/30 transition-all">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 blur-2xl"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Red Stellar</p>
        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mi Wallet</h3>
        
        {stellarAddress ? (
          <div>
            <span className="block text-sm font-mono text-white mb-1">{truncateAddress(stellarAddress)}</span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Wallet conectada</span>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-neutral-400">Aún no has conectado tu wallet de Stellar.</p>
            <button 
              onClick={handleConnectWallet}
              disabled={loading}
              className={`w-full py-3 rounded-2xl font-black text-xs transition-colors uppercase tracking-widest ${
                loading 
                ? 'bg-neutral-800 text-neutral-500 cursor-wait' 
                : 'bg-white text-black hover:bg-yellow-400'
              }`}
            >
              {loading ? 'Conectando...' : 'Conectar Wallet'}
            </button>
          </div>
        )}
      </div>

      {/* C) Bloque "Mentoría 1:1" */}
      <div className="p-8 rounded-[32px] border border-yellow-400/20 bg-yellow-400/5 relative overflow-hidden group hover:border-yellow-400/40 transition-all">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Exclusivo</p>
        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mentoría 1:1</h3>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">Canjea tus puntos por una sesión de mentoría personalizada.</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Costo: 100 PTS</span>
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Tienes: {points}</span>
        </div>

        <button 
          onClick={handleRedeemMentorship}
          disabled={points < 100}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            points >= 100 
              ? 'bg-yellow-400 text-black hover:scale-[1.02]' 
              : 'bg-white/5 text-neutral-600 border border-white/5 cursor-not-allowed'
          }`}
        >
          {points >= 100 ? 'Canjear Mentoría' : 'Faltan Puntos'}
        </button>
      </div>
    </section>
  )
}
