'use client'

import React, { useState } from 'react'
// import { claimLessonReward } from '@/app/actions/rewards' // Removido para evitar mezcla cliente/servidor

interface LessonButtonProps {
  lessonId: string
  videoUrl: string
  isRewarded: boolean
}

export default function LessonButton({ lessonId, videoUrl, isRewarded }: LessonButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Llamar a la API route para registrar la recompensa
      const response = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId }),
      })
      
      if (!response.ok) {
        console.warn('Error en la respuesta de recompensa')
      } else {
        const data = await response.json()
        console.log('Recompensa procesada:', data)
      }
      
      // Abrir el video en una nueva pestaña
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error al reclamar recompensa:', error)
      // Aun si falla la recompensa, abrimos el video para no romper la UX
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full text-center px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg ${
        loading 
          ? 'bg-neutral-800 text-neutral-500 cursor-wait' 
          : 'bg-white text-black hover:bg-yellow-400'
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESANDO...
        </span>
      ) : (
        'VER CONTENIDO'
      )}
    </button>
  )
}
