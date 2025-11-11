'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FilterType } from '@/app/page'

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  stream: MediaStream | null
  activeFilter: FilterType
  isMirrorMode: boolean
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
      default:
        return 'none'
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
        {/* Video Preview */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-auto ${isMirrorMode ? 'scale-x-[-1]' : ''}`}
          style={{
            filter: getFilterCSS(activeFilter),
            transform: isMirrorMode ? 'scaleX(-1)' : 'none',
          }}
        />

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

