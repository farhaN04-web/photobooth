'use client'

import { motion } from 'framer-motion'
import { FilterType, PhotoMode } from '@/app/page'

interface ControlPanelProps {
  onCapture: () => void
  onSwitchCamera: () => void
  onFilterChange: (filter: FilterType) => void
  activeFilter: FilterType
  isMirrorMode: boolean
  onMirrorToggle: (value: boolean) => void
  canSwitchCamera: boolean
  photoMode: PhotoMode
  onPhotoModeChange: (mode: PhotoMode) => void
  photosPerStrip: number
  onPhotosPerStripChange: (count: number) => void
}

/**
 * Komponen ControlPanel
 * Berisi semua kontrol utama: Capture, Switch Camera, Filter, dan Mirror Mode
 */
export default function ControlPanel({
  onCapture,
  onSwitchCamera,
  onFilterChange,
  activeFilter,
  isMirrorMode,
  onMirrorToggle,
  canSwitchCamera,
  photoMode,
  onPhotoModeChange,
  photosPerStrip,
  onPhotosPerStripChange,
}: ControlPanelProps) {
  const filters: { value: FilterType; label: string; icon: string }[] = [
    { value: 'normal', label: 'Normal', icon: '✨' },
    { value: 'grayscale', label: 'Grayscale', icon: '⚫' },
    { value: 'sepia', label: 'Sepia', icon: '🟤' },
    { value: 'blur', label: 'Blur', icon: '🌫️' },
    { value: 'brightness', label: 'Brightness', icon: '☀️' },
  ]

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Mode Photobooth
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPhotoModeChange('single')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              photoMode === 'single'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
            }`}
          >
            <span className="mr-2">📷</span>
            Single Photo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPhotoModeChange('strip')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              photoMode === 'strip'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
            }`}
          >
            <span className="mr-2">🎞️</span>
            Photo Strip
          </motion.button>
        </div>

        {/* Opsi jumlah foto per strip (hanya untuk mode strip) */}
        {photoMode === 'strip' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">
              Jumlah Foto per Strip
            </h4>
            <div className="flex flex-wrap justify-center gap-2">
              {[3, 4].map((count) => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPhotosPerStripChange(count)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    photosPerStrip === count
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {count} Foto
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tombol Utama: Capture dan Switch Camera */}
      <div className="flex flex-wrap justify-center gap-4">
        {/* Tombol Capture */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCapture}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3 min-w-[180px] justify-center"
        >
          <span className="text-2xl">📸</span>
          <span>Ambil Foto</span>
        </motion.button>

        {/* Tombol Switch Camera */}
        {canSwitchCamera && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSwitchCamera}
            className="bg-white text-gray-700 border-2 border-gray-300 px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg hover:border-blue-500 transition-all flex items-center gap-3 min-w-[180px] justify-center"
          >
            <span className="text-2xl">🔄</span>
            <span>Switch Camera</span>
          </motion.button>
        )}

        {/* Toggle Mirror Mode */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onMirrorToggle(!isMirrorMode)}
          className={`px-8 py-4 rounded-xl font-semibold text-lg shadow-md hover:shadow-lg transition-all flex items-center gap-3 min-w-[180px] justify-center ${
            isMirrorMode
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
          }`}
        >
          <span className="text-2xl">🪞</span>
          <span>Mirror {isMirrorMode ? 'ON' : 'OFF'}</span>
        </motion.button>
      </div>

      {/* Filter Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Pilih Filter Foto
        </h3>
        <div className="flex flex-wrap justify-center gap-3">
          {filters.map((filter) => (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange(filter.value)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeFilter === filter.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
              }`}
            >
              <span className="mr-2">{filter.icon}</span>
              {filter.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

