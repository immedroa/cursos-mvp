'use client'

import { useState, useEffect } from 'react'
import { 
  isConnected, 
  requestAccess, 
  getNetworkDetails,
} from '@stellar/freighter-api'
import Image from 'next/image'

interface Mentor {
  id: string
  name: string
  specialty: string
  description: string
  bookingUrl: string
  imageUrl: string
}

interface EventReward {
  id: string
  name: string
  description: string
  bookingUrl: string
  imageUrl: string
  discountCode: string
}

const MENTORS: Mentor[] = [
  {
    id: 'marcelo',
    name: 'Marcelo Medroa',
    specialty: 'Estrategia Web3 y producto',
    description: 'Aprende a estructurar tu modelo de negocio on-chain y definir el roadmap de tu dapp.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-marcelo',
    imageUrl: '/mentors/marcelo.png'
  },
  {
    id: 'mentora-ux',
    name: 'Mentora UX',
    specialty: 'UX para dapps y educación Web3',
    description: 'Optimiza el flujo de onboarding y la retención de usuarios en entornos descentralizados.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-ux',
    imageUrl: '/mentors/mentora-ux.png'
  },
  {
    id: 'dev-solidity',
    name: 'Dev Solidity',
    specialty: 'Smart contracts y seguridad básica',
    description: 'Revisión de lógica de contratos, seguridad en Solidity y despliegue en redes EVM/Stellar.',
    bookingUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/example-dev',
    imageUrl: '/mentors/dev-solidity.png'
  }
]

const EVENTS: EventReward[] = [
  {
    id: 'bsl-peru-2026',
    name: 'BSL On Tour Perú 2026',
    description: 'Acceso gratuito al Blockchain Summit Latam en Lima. Networking y educación Web3 de alto nivel.',
    bookingUrl: 'https://welcu.com/blockchain-summit-latam/bsl-on-tour-peru-2026',
    imageUrl: '/events/blockchainsummitlatam.png',
    discountCode: 'HORIZONBLOCK'
  }
]

interface StellarDashboardProps {
  initialPoints: number
  initialStellarAddress: string | null
  children?: React.ReactNode
}

export default function StellarDashboard({ initialPoints, initialStellarAddress, children }: StellarDashboardProps) {
  const [points, setPoints] = useState(initialPoints)
  const [stellarAddress, setStellarAddress] = useState(initialStellarAddress)
  const [stellarNetwork, setStellarNetwork] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [redemptionType, setRedemptionType] = useState<'MENTOR' | 'EVENT' | null>(null)
  const [lastRewardTx, setLastRewardTx] = useState<{ hash: string, url: string } | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'AULA' | 'HISTORIAL'>('AULA')
  const [showConfirmation, setShowConfirmation] = useState(false)

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/stellar/history')
      const data = await response.json()
      if (data.history) setHistory(data.history)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
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

  const handleOpenEvents = () => {
    setIsEventModalOpen(true)
  }

  const handleSelectMentor = async (mentor: Mentor) => {
    setRedeemingId(mentor.id)
    setRedemptionType('MENTOR')
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

        if (!rewardResponse.ok) {
          console.error('Reward endpoint failed:', await rewardResponse.text())
          throw new Error('Reward endpoint failed')
        }

        const rewardData = await rewardResponse.json()

        if (rewardData.success) {
          setLastRewardTx({ 
            hash: rewardData.txHash, 
            url: rewardData.explorerUrl 
          })
          fetchHistory() 
        }
      } catch (e) {
        console.error('Error al enviar recompensa XLM:', e)
      }

      // Actualizar puntos localmente
      setPoints(prev => prev - 100)
      
      // Mostrar modal de confirmación en lugar de alert/window.open inmediato
      setShowConfirmation(true)
      setIsMentorModalOpen(false)
    } catch (error) {
      console.error('Error al canjear mentoría:', error)
      alert('Hubo un problema al procesar tu canje. Por favor intenta de nuevo.')
    } finally {
      setRedeemingId(null)
    }
  }

  const handleSelectEvent = async (event: EventReward) => {
    setRedeemingId(event.id)
    setRedemptionType('EVENT')
    try {
      const response = await fetch('/api/event/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, pointsSpent: 100 }),
      })

      if (!response.ok) throw new Error('Error al procesar el canje')
      const { redemptionId } = await response.json()

      // Disparar recompensa en XLM
      try {
        const rewardResponse = await fetch('/api/stellar/reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentorRedemptionId: redemptionId }),
        })

        if (rewardResponse.ok) {
          const rewardData = await rewardResponse.json()
          if (rewardData.success) {
            setLastRewardTx({ hash: rewardData.txHash, url: rewardData.explorerUrl })
            fetchHistory()
          }
        }
      } catch (e) {
        console.error('Error al enviar recompensa XLM:', e)
      }

      setPoints(prev => prev - 100)
      setShowConfirmation(true)
      setIsEventModalOpen(false)
    } catch (error) {
      console.error('Error al canjear evento:', error)
      alert('Hubo un problema al procesar tu canje. Por favor intenta de nuevo.')
    } finally {
      setRedeemingId(null)
    }
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <>
      {/* Selector de Pestañas con mejor spacing */}
      <nav className="flex items-center gap-12 mb-16 border-b border-white/5 pt-4">
        <button 
          onClick={() => setActiveTab('AULA')}
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${
            activeTab === 'AULA' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Mi Aula
          {activeTab === 'AULA' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('HISTORIAL')}
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${
            activeTab === 'HISTORIAL' ? 'text-white' : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          Historial Stellar
          {activeTab === 'HISTORIAL' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
          )}
        </button>
      </nav>

      {activeTab === 'AULA' ? (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* 1. ZONA RESUMEN: Compacta y de lectura rápida */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* A) Mis Puntos */}
            <div className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02] flex items-center justify-between group hover:border-yellow-400/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Balance</p>
                <h3 className="text-sm font-black uppercase tracking-tight text-white/70">Mis Puntos</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-yellow-400 leading-none">{points}</span>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">PTS</span>
              </div>
            </div>

            {/* B) Mi Wallet */}
            <div className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02] flex items-center justify-between group hover:border-blue-400/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Conexión</p>
                <h3 className="text-sm font-black uppercase tracking-tight text-white/70">Mi Wallet</h3>
              </div>
              <div className="text-right">
                {stellarAddress ? (
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono text-white mb-0.5">{truncateAddress(stellarAddress)}</span>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${stellarNetwork?.toUpperCase() === 'TESTNET' ? 'text-blue-400' : 'text-orange-400'}`}>
                      {stellarNetwork || 'Desconectado'}
                    </span>
                  </div>
                ) : (
                  <button onClick={handleConnectWallet} disabled={loading} className="text-[10px] font-black uppercase tracking-widest text-white hover:text-yellow-400 transition-colors">
                    {loading ? '...' : 'Conectar'}
                  </button>
                )}
              </div>
            </div>

            {/* C) Status / Membresía (Badge secundario) */}
            <div className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02] flex items-center justify-between group hover:border-emerald-400/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Membresía</p>
                <h3 className="text-sm font-black uppercase tracking-tight text-white/70">Status</h3>
              </div>
              <span className="bg-emerald-400/10 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-400/20">
                Early Access
              </span>
            </div>
          </section>

          {/* 2. CANJEA TUS PUNTOS: Marketplace unificado */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Canjea tus puntos</h2>
                <p className="text-neutral-500 text-xs mt-1">Beneficios exclusivos por tu progreso académico.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reward: Mentoría */}
              <div className="p-6 rounded-[32px] border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-yellow-400/10">
                    100 PTS
                  </span>
                </div>
                <div className="mb-8">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Mentoría 1:1</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[240px]">Sesión privada con expertos para potenciar tu carrera Web3.</p>
                </div>
                <button 
                  onClick={handleOpenMentors}
                  disabled={points < 100 || (stellarNetwork?.toUpperCase() !== 'TESTNET' && !!stellarAddress)}
                  className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${points >= 100 && (stellarNetwork?.toUpperCase() === 'TESTNET' || !stellarAddress) ? 'bg-white text-black hover:bg-yellow-400' : 'bg-white/5 text-neutral-600 cursor-not-allowed border border-white/5'}`}
                >
                  {points >= 100 ? 'Seleccionar mentor' : 'Puntos insuficientes'}
                </button>
              </div>

              {/* Reward: Eventos */}
              <div className="p-6 rounded-[32px] border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <span className="bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-yellow-400/10">
                    100 PTS
                  </span>
                </div>
                <div className="mb-8">
                  <h4 className="text-lg font-black uppercase tracking-tight mb-2">Entradas a Eventos</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-[240px]">Tickets gratis para los eventos cripto más importantes de Latam.</p>
                </div>
                <button 
                  onClick={handleOpenEvents}
                  disabled={points < 100 || (stellarNetwork?.toUpperCase() !== 'TESTNET' && !!stellarAddress)}
                  className={`w-full py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${points >= 100 && (stellarNetwork?.toUpperCase() === 'TESTNET' || !stellarAddress) ? 'bg-white text-black hover:bg-yellow-400' : 'bg-white/5 text-neutral-600 cursor-not-allowed border border-white/5'}`}
                >
                  {points >= 100 ? 'Ver eventos' : 'Puntos insuficientes'}
                </button>
              </div>
            </div>
          </section>

          {/* 3. SIGUE APRENDIENDO: Área de cursos */}
          <section className="pt-8 border-t border-white/5">
            <div className="mb-10">
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Sigue aprendiendo</h2>
              <p className="text-neutral-500 text-xs mt-1">Completa lecciones para acumular más puntos en Stellar.</p>
            </div>
            
            <div className="bg-white/[0.01] rounded-[40px] border border-white/5 p-2 md:p-8">
              {children}
            </div>
          </section>

          {/* 4. ELEMENTOS SECUNDARIOS: Footer discreto */}
          <footer className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-16 pb-8 border-t border-white/5">
            <div className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] flex flex-col justify-center">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-4">¿Necesitas ayuda?</p>
               <div className="flex gap-4">
                 <a href="#" className="text-[11px] font-bold text-neutral-400 hover:text-white transition-colors">Soporte Técnico</a>
                 <span className="text-white/10">•</span>
                 <a href="#" className="text-[11px] font-bold text-neutral-400 hover:text-white transition-colors">Comunidad Discord</a>
               </div>
            </div>
            <div className="p-8 rounded-[32px] border border-dashed border-white/10 flex flex-col justify-center">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2">Próximamente en Crypto College</p>
               <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                 Nuevos cursos de Soroban, Marketplace de Swag oficial y Certificados NFT con validez on-chain.
               </p>
            </div>
          </footer>
        </div>
      ) : (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Transparencia</p>
            <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Historial Stellar</h2>
            <p className="text-neutral-400 mt-2 text-sm">Tus recompensas on-chain y pruebas de canje en Stellar Testnet.</p>
          </div>

          {historyLoading ? (
            <div className="animate-pulse flex space-x-4 p-8 bg-white/[0.02] rounded-[32px] border border-white/5">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded"></div>
              </div>
            </div>
          ) : history.filter(item => !!item.reward_tx_hash).length > 0 ? (
            <div className="grid gap-4">
              {history.filter(item => !!item.reward_tx_hash).map((item) => {
                const mentor = MENTORS.find(m => m.id === item.mentor_id)
                const date = new Date(item.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
                return (
                  <div key={item.id} className="group p-6 rounded-[24px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-tight">
                          {item.mentor_id.startsWith('event:') 
                            ? `Entrada: ${EVENTS.find(e => e.id === item.mentor_id.replace('event:', ''))?.name || item.mentor_id.replace('event:', '')}`
                            : `Mentoría con ${MENTORS.find(m => m.id === item.mentor_id)?.name || item.mentor_id}`
                          }
                        </h4>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{date} • {item.points_spent} PTS Canjeados</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="flex items-center gap-2 bg-emerald-400/5 px-4 py-2 rounded-full border border-emerald-400/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">+{item.reward_amount_xlm} XLM Demo</span>
                      </div>
                      
                      <a 
                        href={`https://testnet.steexp.com/tx/${item.reward_tx_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-2 group/link"
                      >
                        Explorer
                        <svg className="w-3 h-3 opacity-50 group-hover/link:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-[32px] border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-neutral-500 text-sm mb-4">Todavía no tienes recompensas on-chain registradas.</p>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">Canjea una mentoría para ver aquí tus transacciones en Stellar Testnet.</p>
            </div>
          )}
        </section>
      )}

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
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image 
                        src={mentor.imageUrl} 
                        alt={mentor.name} 
                        fill
                        className="object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-yellow-400/30 transition-colors"></div>
                    </div>
                    
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
      {/* Modal de Eventos */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEventModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-2">Selección</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">Eventos Disponibles</h2>
              </div>
              <button onClick={() => setIsEventModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="grid gap-4">
              {EVENTS.map(event => (
                <div key={event.id} className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-yellow-400/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="relative w-20 h-20 shrink-0">
                      <Image 
                        src={event.imageUrl} 
                        alt={event.name} 
                        fill
                        className="object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-yellow-400/30 transition-colors"></div>
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="text-lg font-black tracking-tight mb-1">{event.name}</h4>
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-3">Entrada gratuita</p>
                      <p className="text-sm text-neutral-400 leading-relaxed">{event.description}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleSelectEvent(event)}
                      disabled={!!redeemingId}
                      className="flex-shrink-0 bg-white text-black px-6 py-3 rounded-2xl font-black text-xs hover:bg-yellow-400 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                      {redeemingId === event.id ? 'Procesando...' : 'Canjear entrada'}
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

      {/* Modal de Confirmación de Éxito */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowConfirmation(false)}></div>
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-yellow-400/30 rounded-[40px] p-10 text-center shadow-[0_0_50px_rgba(250,204,21,0.1)] animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">
              {redemptionType === 'MENTOR' ? 'Mentoría 1:1' : 'Entrada a evento'} canjeada con éxito
            </h2>
            
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Ya registramos tu canje en la red Stellar Testnet y lo verás reflejado en tu Historial Stellar.
            </p>

            {redemptionType === 'EVENT' ? (
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-2">Código de descuento</p>
                <p className="text-2xl font-black text-yellow-400 tracking-widest mb-2">HORIZONBLOCK</p>
                <p className="text-[11px] text-neutral-400">Usa este código y adquiere tu entrada de 99 USD gratis.</p>
              </div>
            ) : (
              <p className="text-neutral-400 text-sm leading-relaxed mb-10">
                El siguiente paso es agendar el día y hora de tu sesión privada.
              </p>
            )}

            <div className="space-y-4">
              <button 
                onClick={() => {
                  const url = redemptionType === 'EVENT' 
                    ? "https://welcu.com/blockchain-summit-latam/bsl-on-tour-peru-2026"
                    : "https://calendar.app.google/iB2gxQXXSwapTaPD8"
                  window.open(url, "_blank", "noopener,noreferrer")
                }}
                className="block w-full bg-yellow-400 text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform shadow-xl shadow-yellow-400/10 uppercase tracking-widest"
              >
                {redemptionType === 'EVENT' ? 'Adquirir mi entrada' : 'Agendar mi mentoría'}
              </button>
              <button 
                onClick={() => {
                  setShowConfirmation(false)
                  setActiveTab('HISTORIAL')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="block w-full py-4 text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
