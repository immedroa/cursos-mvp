'use client'

import { useState, useEffect } from 'react'
import { 
  isConnected, 
  requestAccess, 
  getNetworkDetails,
  signMessage
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
  userEmail: string
  featured?: React.ReactNode
  library?: React.ReactNode
  secondary?: React.ReactNode
}

export default function StellarDashboard({ initialPoints, initialStellarAddress, userEmail, featured, library, secondary }: StellarDashboardProps) {
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
  const [showUnlinkModal, setShowUnlinkModal] = useState(false)
  const [showFreighterModal, setShowFreighterModal] = useState(false)
  const [unlinkLoading, setUnlinkLoading] = useState(false)

  // --- NUEVOS ESTADOS DE DETECCIÓN ---
  const [hasFreighter, setHasFreighter] = useState<boolean>(false)
  const [isCheckingFreighter, setIsCheckingFreighter] = useState<boolean>(true)

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

    // --- LÓGICA DE DETECCIÓN DE FREIGHTER ---
    const checkFreighter = async () => {
      try {
        // 1. Intento síncrono instantáneo (Detección más segura de presencia)
        const win = window as any
        if (win.freighterApi) {
          setHasFreighter(true)
          setIsCheckingFreighter(false)
          return
        }

        // 2. Intento asíncrono con timeout de 1 segundo
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
        const connected = await Promise.race([isConnected(), timeout]) as boolean
        setHasFreighter(connected)
      } catch (e) {
        // Si hay timeout o error, asumimos que no está disponible
        setHasFreighter(false)
      } finally {
        setIsCheckingFreighter(false)
      }
    }

    checkFreighter()

    if (initialStellarAddress) {
      getNetworkDetails().then(details => {
        if (details && details.network) setStellarNetwork(details.network)
      }).catch(console.error)
    }
  }, [initialStellarAddress])

  const handleConnectWallet = async () => {
    // GUARD CLAUSE
    if (!hasFreighter && !isCheckingFreighter) return

    setLoading(true)
    try {
      // 1. Detectar si Freighter está disponible con timeout para evitar cuelgues
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('La wallet no responde')), 2000))
      const isReady = await Promise.race([isConnected(), timeout]).catch(() => false)

      if (!isReady) {
        setShowFreighterModal(true)
        setLoading(false)
        return
      }

      // 2. Obtener la dirección pública
      const { address: publicKey, error: freighterError } = await requestAccess()
      
      if (freighterError || !publicKey) {
        if (freighterError?.includes('User declined')) {
          // Usuario canceló, no mostramos error grave
          return
        }
        throw new Error(freighterError || 'No se pudo obtener la dirección de la wallet')
      }

      // 3. Vincular en Backend (Sin firma para esta versión mínima)
      const response = await fetch('/api/stellar/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: publicKey, 
          network: 'stellar-testnet' 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 409) {
          alert(data.error + (data.help ? `\n\n${data.help}` : ''))
        } else {
          alert(data.error || 'Error al vincular la wallet')
        }
        return
      }
      
      setStellarAddress(publicKey)
    } catch (error: any) {
      console.error('Error al conectar wallet:', error)
      alert('Hubo un problema al conectar con Freighter. Por favor reintenta.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlinkWallet = () => {
    setShowUnlinkModal(true)
  }

  const confirmUnlinkWallet = async () => {
    setUnlinkLoading(true)
    try {
      const response = await fetch('/api/stellar/unlink', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Error al desvincular')
      setStellarAddress(null)
      setStellarNetwork(null)
      setShowUnlinkModal(false)
    } catch (error) {
      console.error('Error al desvincular wallet:', error)
      alert('Error al desvincular la wallet.')
    } finally {
      setUnlinkLoading(false)
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
      <nav className="flex items-center gap-12 mb-12 border-b border-white/5 pt-4">
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
          
          {/* 1. ZONA RESUMEN: Header compacto de status */}
          <section className="relative overflow-hidden p-8 rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-md shadow-2xl">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-[80px] -ml-24 -mb-24 rounded-full"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Perfil */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-[#0A0A0A] rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-1">Estudiante</h3>
                  <p className="text-lg font-black text-white leading-none truncate max-w-[150px]">{userEmail.split('@')[0]}</p>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>

              {/* Puntos */}
              <div className="flex flex-col items-center md:border-x border-white/5 px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3">Balance de Aprendizaje</p>
                <div className="flex items-end gap-3">
                   <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-none tabular-nums">{points}</span>
                   <div className="flex flex-col mb-1">
                     <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest leading-none">Puntos</span>
                     <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest mt-1">Acumulados</span>
                   </div>
                </div>
              </div>

              {/* Wallet Status */}
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3">Identidad On-Chain</p>
                {stellarAddress ? (
                  <div className="flex flex-col items-end w-full">
                    <div className="relative px-5 py-4 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-blue-400/30 transition-all w-full">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]"></div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{stellarNetwork || 'STELLAR'}</span>
                        </div>
                        <span className="text-xs font-mono text-white/80">{truncateAddress(stellarAddress)}</span>
                      </div>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleUnlinkWallet(); }}
                        className="w-full py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20"
                      >
                        Desvincular Wallet
                      </button>
                    </div>
                  </div>
                ) : isCheckingFreighter ? (
                  <div className="flex items-center gap-3 px-6 py-3 border border-white/5 bg-white/[0.02] rounded-2xl">
                    <div className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Verificando wallet...</span>
                  </div>
                ) : !hasFreighter ? (
                  <div className="w-full max-w-[280px]">
                    <div className="p-4 rounded-3xl bg-orange-500/5 border border-orange-500/20 mb-3">
                      <p className="text-[10px] font-bold text-orange-200/80 leading-relaxed mb-3">
                        No detectamos Freighter. Instálala para activar tus beneficios on-chain.
                      </p>
                      <a 
                        href="https://www.freighter.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[9px] font-black text-orange-400 hover:text-orange-300 uppercase tracking-widest transition-colors"
                      >
                        Instalar Freighter
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    </div>
                    <button 
                      disabled 
                      className="w-full px-8 py-3 rounded-2xl bg-white/5 text-neutral-600 font-black text-[10px] uppercase tracking-[0.2em] cursor-not-allowed border border-white/5"
                    >
                      VINCULAR WALLET
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleConnectWallet} 
                    disabled={loading} 
                    className="relative group overflow-hidden px-8 py-3 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    <span className="relative z-10">{loading ? 'CONECTANDO...' : 'VINCULAR WALLET'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                )}
                <p className="text-[9px] text-neutral-600 mt-3 text-right">
                  {stellarAddress ? 'Tu wallet es tu identidad educativa.' : (hasFreighter ? 'Conecta Freighter para puntos on-chain.' : 'Requerido para recompensas.')}
                </p>
              </div>
            </div>
          </section>

          {/* 2. SIGUE APRENDIENDO: Featured Content */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Sigue aprendiendo</h2>
              <p className="text-neutral-500 text-xs mt-1">Retoma tu progreso y acumula más puntos on-chain.</p>
            </div>
            {featured}
          </section>

          {/* 3. CANJEA TUS PUNTOS: Marketplace unificado */}
          <section className="py-12 border-y border-white/5">
            <div className="mb-10 text-center">
              <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Canjea tus puntos</h2>
              <p className="text-neutral-500 text-[10px] uppercase tracking-widest mt-2">Beneficios exclusivos para alumnos destacados</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Reward: Mentoría */}
              <div className="p-6 rounded-[32px] border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between gap-6 group">
                <div className="flex-1">
                  <span className="bg-yellow-400/10 text-yellow-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-yellow-400/20 mb-3 inline-block">
                    100 PTS
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight mb-1">Mentoría 1:1</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Sesión privada con expertos.</p>
                </div>
                <button 
                  onClick={handleOpenMentors}
                  disabled={points < 100 || (stellarNetwork?.toUpperCase() !== 'TESTNET' && !!stellarAddress)}
                  className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${points >= 100 && (stellarNetwork?.toUpperCase() === 'TESTNET' || !stellarAddress) ? 'bg-white text-black hover:bg-yellow-400' : 'bg-white/5 text-neutral-600 border border-white/5 cursor-not-allowed'}`}
                >
                  Canjear
                </button>
              </div>

              {/* Reward: Eventos */}
              <div className="p-6 rounded-[32px] border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-between gap-6 group">
                <div className="flex-1">
                  <span className="bg-yellow-400/10 text-yellow-400 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-yellow-400/20 mb-3 inline-block">
                    100 PTS
                  </span>
                  <h4 className="text-sm font-black uppercase tracking-tight mb-1">Entradas</h4>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">Blockchain Summit Latam.</p>
                </div>
                <button 
                  onClick={handleOpenEvents}
                  disabled={points < 100 || (stellarNetwork?.toUpperCase() !== 'TESTNET' && !!stellarAddress)}
                  className={`px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${points >= 100 && (stellarNetwork?.toUpperCase() === 'TESTNET' || !stellarAddress) ? 'bg-white text-black hover:bg-yellow-400' : 'bg-white/5 text-neutral-600 border border-white/5 cursor-not-allowed'}`}
                >
                  Canjear
                </button>
              </div>
            </div>
          </section>

          {/* 4. BIBLIOTECA: Library Content */}
          <section>
            <div className="mb-10">
              <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Tu Biblioteca</h2>
              <p className="text-neutral-500 text-xs mt-1">Explora otros cursos y expande tu conocimiento Web3.</p>
            </div>
            {library}
          </section>

          {/* 5. SECUNDARIOS: Footer & Info */}
          <footer className="pt-16 pb-8 border-t border-white/5 flex flex-col md:flex-row gap-12 items-start opacity-60 hover:opacity-100 transition-opacity">
            <div className="flex-1">
               {secondary}
            </div>
            <div className="flex-shrink-0 flex flex-col gap-4">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Próximamente</p>
               <p className="text-[10px] text-neutral-600 max-w-[200px] leading-relaxed">
                 Mercancía oficial, Certificados NFT y Gobernanza DAO para la comunidad.
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
      {/* Modal de Desvinculación */}
      {showUnlinkModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !unlinkLoading && setShowUnlinkModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 md:p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">¿Desvincular wallet?</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              Tu wallet dejará de estar asociada a esta cuenta de Crypto College. Esto no mueve fondos ni revoca permisos on-chain.
            </p>

            <div className="space-y-3">
              <button 
                onClick={confirmUnlinkWallet}
                disabled={unlinkLoading}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {unlinkLoading ? 'Desvinculando...' : 'Sí, desvincular'}
              </button>
              <button 
                onClick={() => setShowUnlinkModal(false)}
                disabled={unlinkLoading}
                className="w-full py-4 text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                Cancelar
              </button>
            </div>
            
            <p className="mt-6 text-[9px] text-neutral-600 uppercase tracking-widest">
              Revocar permisos se hace desde tu wallet.
            </p>
          </div>
        </div>
      )}
      {/* Modal de Necesitas Freighter */}
      {showFreighterModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFreighterModal(false)}></div>
          <div className="relative w-full max-w-sm bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 md:p-10 text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
               <Image 
                src="/logo.png" 
                alt="Freighter" 
                width={40} 
                height={40} 
                className="grayscale"
              />
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Necesitas Freighter</h3>
            <p className="text-neutral-400 text-sm leading-relaxed mb-8">
              Para vincular tu wallet Stellar en Crypto College, primero instala la extensión Freighter y luego vuelve a intentarlo.
            </p>

            <div className="space-y-3">
              <a 
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors"
              >
                Instalar Freighter
              </a>
              <button 
                onClick={() => setShowFreighterModal(false)}
                className="w-full py-4 text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-[0.2em] transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
