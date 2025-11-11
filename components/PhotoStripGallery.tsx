'use client'

import { motion } from 'framer-motion'
import PhotoStrip, { PhotoStrip as PhotoStripType } from './PhotoStrip'

interface PhotoStripGalleryProps {
  strips: PhotoStripType[]
  onDownload: (strip: PhotoStripType) => void
  onDelete: (stripId: string) => void
}

/**
 * Komponen PhotoStripGallery
 * Menampilkan galeri photo strip dalam grid responsif
 */
export default function PhotoStripGallery({
  strips,
  onDownload,
  onDelete,
}: PhotoStripGalleryProps) {
  if (strips.length === 0) {
    return (
      <div className="mt-12 text-center py-12">
        <div className="text-5xl mb-4">🖼️</div>
        <p className="text-gray-500 text-lg">Belum ada photo strip yang dibuat</p>
        <p className="text-gray-400 text-sm mt-2">
          Ambil beberapa foto untuk membuat photo strip pertama Anda
        </p>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Galeri Photo Strip ({strips.length})
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {strips.map((strip, index) => (
          <PhotoStrip
            key={strip.id}
            strip={strip}
            onDownload={onDownload}
            onDelete={onDelete}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

