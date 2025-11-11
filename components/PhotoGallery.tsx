'use client'

import { motion } from 'framer-motion'
import { Photo } from '@/app/page'

interface PhotoGalleryProps {
  photos: Photo[]
  onDownload: (photo: Photo) => void
  onDelete: (photoId: string) => void
}

/**
 * Komponen PhotoGallery
 * Menampilkan galeri foto yang telah diambil dalam grid responsif
 */
export default function PhotoGallery({ photos, onDownload, onDelete }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="mt-12 text-center py-12">
        <div className="text-5xl mb-4">🖼️</div>
        <p className="text-gray-500 text-lg">Belum ada foto yang diambil</p>
        <p className="text-gray-400 text-sm mt-2">Ambil foto pertama Anda dengan menekan tombol Capture</p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Galeri Foto ({photos.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Foto */}
            <img
              src={photo.dataUrl}
              alt={`Photo ${index + 1}`}
              className="w-full h-48 object-cover"
            />

            {/* Overlay dengan tombol download dan delete */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDownload(photo)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
              >
                <span>⬇️</span>
                <span>Download</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(photo.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2"
              >
                <span>🗑️</span>
                <span>Hapus</span>
              </motion.button>
            </div>

            {/* Badge nomor foto */}
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              #{photos.length - index}
            </div>

            {/* Tombol delete di pojok kanan atas (selalu terlihat) */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(photo.id)
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity"
              title="Hapus foto"
            >
              <span className="text-lg">🗑️</span>
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

