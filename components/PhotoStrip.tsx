'use client'

import { motion } from 'framer-motion'

// Tipe untuk satu foto dalam strip
export interface StripPhoto {
  id: string
  dataUrl: string
}

// Tipe untuk satu strip (berisi beberapa foto)
export interface PhotoStrip {
  id: string
  photos: StripPhoto[]
  timestamp: number
}

interface PhotoStripProps {
  strip: PhotoStrip
  onDownload: (strip: PhotoStrip) => void
  onDelete: (stripId: string) => void
  index: number
}

/**
 * Komponen PhotoStrip
 * Menampilkan layout strip photobooth dengan beberapa foto dalam satu frame
 */
export default function PhotoStrip({ strip, onDownload, onDelete, index }: PhotoStripProps) {
  const photoCount = strip.photos.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Frame Strip dengan border dan shadow */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800 p-4">
        {/* Header Strip (opsional) */}
        <div className="text-center mb-2 pb-2 border-b-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">PhotoBooth Studio</h3>
          <p className="text-xs text-gray-500">#{index + 1}</p>
        </div>

        {/* Container untuk foto-foto dalam strip */}
        <div
          className={`grid gap-2 ${
            photoCount === 3
              ? 'grid-cols-1'
              : photoCount === 4
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {strip.photos.map((photo, photoIndex) => (
            <div
              key={photo.id}
              className="relative overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100"
              style={{
                aspectRatio: '3/4', // Format portrait seperti photobooth strip
              }}
            >
              <img
                src={photo.dataUrl}
                alt={`Photo ${photoIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Nomor foto di pojok */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                {photoIndex + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Footer dengan watermark */}
        <div className="text-center mt-2 pt-2 border-t-2 border-gray-200">
          <p className="text-xs text-gray-600 font-medium">PhotoBooth by namaku</p>
          <p className="text-xs text-gray-400">
            {new Date(strip.timestamp).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Overlay dengan tombol action */}
      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDownload(strip)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
        >
          <span>⬇️</span>
          <span>Download Strip</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(strip.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
        >
          <span>🗑️</span>
          <span>Hapus</span>
        </motion.button>
      </div>

      {/* Tombol delete kecil di pojok */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          onDelete(strip.id)
        }}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity z-10"
        title="Hapus strip"
      >
        <span className="text-lg">🗑️</span>
      </motion.button>
    </motion.div>
  )
}

