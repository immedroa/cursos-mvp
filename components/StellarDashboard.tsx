'use client'

import { useState, useEffect } from 'react'
import { 
  isConnected, 
  requestAccess, 
  getNetworkDetails,
} from '@stellar/freighter-api'

interface Mentor {
  id: string
  name: string
  specialty: string
  description: string
  bookingUrl: string
}

const MENTORS: Mentor[] = [
  {
    id: 'marcelo',
    name: 'Marcelo',
    specialty: 'Estrategia Web3 y producto',
    description: 'Aprende a estructurar tu modelo de negocio on-chain y definir el roadmap de tu dapp.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-marcelo'
  },
  {
    id: 'mentora-ux',
    name: 'Mentora UX',
    specialty: 'UX para dapps y educación Web3',
    description: 'Optimiza el flujo de onboarding y la retención de usuarios en entornos descentralizados.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-ux'
  },
  {
    id: 'dev-solidity',
    name: 'Dev Solidity',
    specialty: 'Smart contracts y seguridad básica',
    description: 'Revisión de lógica de contratos, seguridad en Solidity y despliegue en redes EVM/Stellar.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-dev'
  }
]

interface StellarDashboardProps {
  initialPoints: number
  initialStellarAddress: string | null
}

export default function StellarDashboard({ initialPoints, initialStellarAddress }: StellarDashboardProps) {
  const [points, setPoints] = useState(initialPoints)
  const [stellarAddress, setStellarAddress] = useState(initialStellarAddress)
  const [stellarNetwork, setStellarNetwork] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [lastRewardTx, setLastRewardTx] = useState<{ hash: string, url: string } | null>(null)

  useEffect(() => {
    setStellarAddress(initialStellarAddress)
    if (initialStellarAddress) {
      getNetworkDetails().then(details => {
        if (details && details.network) setStellarNetwork(details.network)
      }).catch(console.error)
    }
  }, [initialStellarAddress])

  const handleConnectWallet = async () => {
    setLoading(true)
    try {
      if (!await isConnected()) {
        alert('Por favor instala la extensión Freighter para conectar tu wallet.')
        setLoading(false)
        return
      }
      const { address: publicKey, error: freighterError } = await requestAccess()
      if (freighterError || !publicKey) throw new Error(freighterError || 'No se pudo obtener la llave pública')

      const networkDetails = await getNetworkDetails()
      if (networkDetails && networkDetails.network) setStellarNetwork(networkDetails.network)

      const response = await fetch('/api/stellar/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey }),
      })
      if (!response.ok) throw new Error('Error al guardar la dirección')
      setStellarAddress(publicKey)
    } catch (error) {
      console.error('Error al conectar wallet:', error)
      alert('Hubo un problema al conectar con Freighter.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenMentors = () => {
    setIsMentorModalOpen(true)
  }

  const handleSelectMentor = async (mentor: Mentor) => {
    setRedeemingId(mentor.id)
    try {
      const response = await fetch('/api/mentorship/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorId: mentor.id, pointsSpent: 100 }),
      })

      if (!response.ok) throw new Error('Error al procesar el canje')
      const { redemptionId } = await response.json()

      // 2. Disparar recompensa en XLM (Background)
      try {
        const rewardResponse = await fetch('/api/stellar/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentorRedemptionId: redemptionId }),
        })
        const rewardData = await rewardResponse.json()
        if (rewardData.success) {
          setLastRewardTx({ hash: rewardData.txHash, url: rewardData.explorerUrl })
        }
      } catch (e) {
        console.error('Error al enviar recompensa XLM:', e)
      }

      // Actualizar puntos localmente
      setPoints(prev => prev - 100)
      
      // Abrir calendario
      window.open(mentor.bookingUrl, '_blank', 'noopener,noreferrer')
      
      alert('¡Mentoría canjeada con éxito! Revisa el calendario para elegir tu horario. Además, hemos enviado 1 XLM de recompensa a tu wallet Testnet.')
      setIsMentorModalOpen(false)
    } catch (error) {
      console.error('Error al canjear mentoría:', error)
      alert('Hubo un problema al procesar tu canje. Por favor intenta de nuevo.')
    } finally {
      setRedeemingId(null)
    }
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <>
      <section className="grid gap-6 md:grid-cols-3 mb-12">
        {/* A) Bloque "Mis puntos" */}
        <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] relative overflow-hidden group hover:border-yellow-400/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Acumulados</p>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mis Puntos</h3>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black text-yellow-400 leading-none">{points}</span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest pb-1">PTS</span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Gana puntos participando en cursos, retos y eventos para impulsar tu progreso en el ecosistema Web3.
          </p>
        </div>

        {/* B) Bloque "Mi wallet Stellar" */}
        <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02] relative overflow-hidden group hover:border-yellow-400/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/5 blur-2xl"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Red Stellar</p>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mi Wallet</h3>
          {stellarAddress ? (
            <div className="space-y-4">
              <div>
                <span className="block text-sm font-mono text-white mb-1">{truncateAddress(stellarAddress)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Wallet conectada</span>
                  {stellarNetwork && (
                    <>
                      <span className="text-white/20 text-[10px]">•</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${stellarNetwork.toUpperCase() === 'TESTNET' ? 'text-blue-400' : 'text-orange-400'}`}>
                        {stellarNetwork}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {stellarNetwork && stellarNetwork.toUpperCase() !== 'TESTNET' ? (
                <p className="text-[11px] text-orange-400/80 leading-relaxed bg-orange-400/5 p-3 rounded-xl border border-orange-400/10">
                  ⚠️ Cambia tu wallet a <strong>Testnet</strong> para probar las recompensas on-chain.
                </p>
              ) : (
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Wallet lista para recompensas demo en Stellar Testnet.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">Conecta tu wallet para habilitar recompensas on-chain.</p>
              <button onClick={handleConnectWallet} disabled={loading} className={`w-full py-3 rounded-2xl font-black text-xs transition-colors uppercase tracking-widest ${loading ? 'bg-neutral-800 text-neutral-500' : 'bg-white text-black hover:bg-yellow-400'}`}>
                {loading ? 'Conectando...' : 'Conectar mi wallet'}
              </button>
            </div>
          )}
        </div>

        {/* C) Bloque "Mentoría 1:1" */}
        <div className="p-8 rounded-[32px] border border-yellow-400/20 bg-yellow-400/5 relative overflow-hidden group hover:border-yellow-400/40 transition-all">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Exclusivo</p>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Mentoría 1:1</h3>
          <p className="text-xs text-neutral-400 mb-6 leading-relaxed">Despeja tus dudas con expertos en sesiones privadas.</p>
          <div className="flex items-center justify-between mb-4 border-t border-white/5 pt-4">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Costo: 100 pts · Tienes: {points} pts</span>
          </div>
          {points < 100 && (
            <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">Aún no tienes los puntos necesarios.</p>
          )}
          <button 
            onClick={handleOpenMentors}
            disabled={points < 100 || (stellarNetwork?.toUpperCase() !== 'TESTNET' && !!stellarAddress)}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${points >= 100 && (stellarNetwork?.toUpperCase() === 'TESTNET' || !stellarAddress) ? 'bg-yellow-400 text-black hover:scale-[1.02]' : 'bg-white/5 text-neutral-600 border border-white/5 cursor-not-allowed'}`}
          >
            {points >= 100 ? 'Canjear mentoría' : 'Faltan puntos'}
          </button>
        </div>
      </section>

      {/* Modal de Mentores */}
      {isMentorModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMentorModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Selección</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Mentores Disponibles</h2>
              </div>
              <button onClick={() => setIsMentorModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="grid gap-4">
              {MENTORS.map(mentor => (
                <div key={mentor.id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-yellow-400/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-grow">
                      <h4 className="text-lg font-black tracking-tight mb-1">{mentor.name}</h4>
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">{mentor.specialty}</p>
                      <p className="text-sm text-neutral-400 leading-relaxed">{mentor.description}</p>
                    </div>
                    <button 
                      onClick={() => handleSelectMentor(mentor)}
                      disabled={!!redeemingId}
                      className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs hover:bg-yellow-400 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      {redeemingId === mentor.id ? 'Procesando...' : 'Elegir mentor'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {lastRewardTx && (
              <div className="mt-8 p-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Recompensa enviada: 1 XLM</p>
                </div>
                <a 
                  href={lastRewardTx.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-white hover:text-emerald-400 underline uppercase tracking-widest transition-colors"
                >
                  Ver TX: {lastRewardTx.hash.slice(0, 8)}...
                </a>
              </div>
            )}

            <p className="mt-8 text-center text-[10px] text-neutral-600 uppercase tracking-[0.2em]">Costo del canje: 100 puntos</p>
          </div>
        </div>
      )}
    </>
  )
}
