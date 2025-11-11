'use client'

import { useEffect, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { AspectRatio, FilterType } from '@/app/page'
import FaceEffectsOverlay, { FaceEffectType } from './FaceEffectsOverlay'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  stream: MediaStream | null
  activeFilter: FilterType
  isMirrorMode: boolean
  aspectRatio?: AspectRatio
  faceEffect?: FaceEffectType
  overlayCanvasRef?: React.RefObject<HTMLCanvasElement>
  beautyIntensity?: number
}

/**
 * Komponen CameraView
 * Menampilkan live preview dari kamera dengan filter dan mode mirror
 */
export default function CameraView({
  videoRef,
  stream,
  activeFilter,
  isMirrorMode,
  aspectRatio = '1:1',
  faceEffect = 'none',
  overlayCanvasRef,
  beautyIntensity = 0,
}: CameraViewProps) {
  // Update video source saat stream berubah
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, videoRef])

  // Fungsi untuk mendapatkan CSS filter
  const getFilterCSS = (filter: FilterType): string => {
    switch (filter) {
      case 'grayscale':
        return 'grayscale(100%)'
      case 'sepia':
        return 'sepia(100%)'
      case 'blur':
        return 'blur(2px)'
      case 'brightness':
        return 'brightness(1.3)'
      case 'clarendon':
        return 'contrast(1.2) saturate(1.35) brightness(1.05)'
      case 'gingham':
        return 'brightness(1.05) hue-rotate(-10deg)'
      case 'juno':
        return 'saturate(1.4) contrast(1.15)'
      case 'lark':
        return 'brightness(1.1) saturate(1.1)'
      case 'aden':
        return 'hue-rotate(-20deg) saturate(0.85) brightness(1.05)'
      case 'perpetua':
        return 'saturate(1.1) contrast(1.05)'
      default:
        return 'none'
    }
  }

  // Overlay tambahan untuk filter gaya Instagram (diterapkan di live preview)
  const getFilterOverlayStyle = (filter: FilterType): CSSProperties | undefined => {
    switch (filter) {
      case 'clarendon':
        return {
          background: 'linear-gradient(to bottom, rgba(0, 32, 96, 0.18), rgba(255,255,255,0))',
          mixBlendMode: 'screen',
          opacity: 0.8,
        }
      case 'gingham':
        return {
          background: 'rgba(245, 235, 255, 0.25)',
          mixBlendMode: 'soft-light',
          opacity: 0.8,
        }
      case 'juno':
        return {
          background: 'linear-gradient(135deg, rgba(255, 196, 140, 0.25), rgba(255, 255, 255, 0))',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }
      case 'lark':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(173, 247, 255, 0.2))',
          mixBlendMode: 'screen',
          opacity: 0.8,
        }
      case 'aden':
        return {
          background: 'rgba(210, 240, 255, 0.25)',
          mixBlendMode: 'soft-light',
          opacity: 0.8,
        }
      case 'perpetua':
        return {
          background: 'linear-gradient(to top, rgba(0, 120, 255, 0.18), rgba(0, 255, 180, 0.12))',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }
      default:
        return undefined
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Aspect ratio wrapper */}
        <div
          className="relative w-full"
          style={{
            paddingTop:
              aspectRatio === '1:1'
                ? '100%'
                : aspectRatio === '4:5'
                ? '125%'
                : '56.25%', // 16:9
          }}
        >
          {/* Video Preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover ${isMirrorMode ? 'scale-x-[-1]' : ''}`}
            style={{
              filter: getFilterCSS(activeFilter),
              transform: isMirrorMode ? 'scaleX(-1)' : 'none',
            }}
          />
          {/* Filter overlay visual */}
          {getFilterOverlayStyle(activeFilter) && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={getFilterOverlayStyle(activeFilter)}
            />
          )}
          {/* Kirim beauty intensity ke overlay via dataset (agar frame-sync) */}
          <div
            className="absolute inset-0 pointer-events-none"
            ref={(el) => {
              // store as data attribute on overlay canvas if available
              const canvas = overlayCanvasRef?.current as any
              if (canvas && el) {
                canvas.dataset = canvas.dataset || {}
                canvas.dataset.beauty = String(beautyIntensity ?? 0)
              }
            }}
          />
          {/* Face Effects Overlay */}
          <FaceEffectsOverlay
            videoRef={videoRef}
            effect={faceEffect}
            canvasExternalRef={overlayCanvasRef}
            mirror={isMirrorMode}
          />
        </div>

        {/* Overlay untuk efek visual */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Filter
            </div>
            {isMirrorMode && (
              <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                Mirror Mode
              </div>
            )}
          </div>
        </div>

        {/* Placeholder jika kamera belum aktif */}
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 font-medium">Memuat kamera...</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

