'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import CameraView from '@/components/CameraView'
import PhotoGallery from '@/components/PhotoGallery'
import PhotoStripGallery from '@/components/PhotoStripGallery'
import ControlPanel from '@/components/ControlPanel'
import { PhotoStrip, StripPhoto } from '@/components/PhotoStrip'

export interface Photo {
    id: string
    dataUrl: string
    timestamp: number
}

// Filter
export type FilterType = 'normal' | 'grayscale' | 'sepia' | 'blur' | 'brightness'

// Layout
export type PhotoMode = 'single' | 'strip'

export default function Home() {
  // State untuk menyimpan stream kamera
  const [stream, setStream] = useState<MediaStream | null>(null)
  // State untuk menyimpan daftar foto yang diambil (mode single)
  const [photos, setPhotos] = useState<Photo[]>([])
  // State untuk menyimpan photo strips (mode strip)
  const [photoStrips, setPhotoStrips] = useState<PhotoStrip[]>([])
  // State untuk mode photobooth
  const [photoMode, setPhotoMode] = useState<PhotoMode>('strip')
  // State untuk jumlah foto per strip
  const [photosPerStrip, setPhotosPerStrip] = useState(4)
  // State untuk foto sementara saat membuat strip
  const [currentStripPhotos, setCurrentStripPhotos] = useState<StripPhoto[]>([])
  // State untuk filter yang aktif
  const [activeFilter, setActiveFilter] = useState<FilterType>('normal')
  // State untuk mode mirror
  const [isMirrorMode, setIsMirrorMode] = useState(true)
  // State untuk daftar kamera yang tersedia
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  // State untuk index kamera yang sedang digunakan
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  // State untuk efek flash
  const [isFlashing, setIsFlashing] = useState(false)

  // Ref untuk video element
  const videoRef = useRef<HTMLVideoElement>(null)
  // Ref untuk canvas element (untuk capture)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Fungsi untuk mendapatkan daftar kamera yang tersedia
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Minta izin kamera dulu agar deviceId terisi
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setAvailableCameras(videoDevices)
        // Set stream yang sudah didapat
        setStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error getting cameras:', error)
        alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.')
      }
    }
    getCameras()
  }, [])

  // Fungsi untuk memulai kamer
  const startCamera = async (deviceId?: string) => {
    try {
      // Hentikan stream yang sedang berjalan
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'user' }, // Default ke kamera depan
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.')
    }
  }

  // Inisialisasi kamera saat komponen dimount
  useEffect(() => {
    if (availableCameras.length > 0 && availableCameras[currentCameraIndex]) {
      startCamera(availableCameras[currentCameraIndex].deviceId)
    } else if (availableCameras.length === 0) {
      startCamera()
    }

    // Cleanup saat unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCameraIndex])

  // Fungsi untuk mengambil foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set ukuran canvas sesuai video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Terapkan filter CSS ke canvas
    ctx.filter = getFilterCSS(activeFilter)

    // Gambar frame video ke canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Tambahkan watermark
    addWatermark(ctx, canvas.width, canvas.height)

    // Konversi ke data URL
    const dataUrl = canvas.toDataURL('image/png')

    // Efek flash
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 200)

    // Mode single: langsung tambahkan ke galeri
    if (photoMode === 'single') {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        dataUrl,
        timestamp: Date.now(),
      }
      setPhotos(prev => [newPhoto, ...prev])
    } 
    // Mode strip: tambahkan ke strip sementara
    else {
      const newStripPhoto: StripPhoto = {
        id: Date.now().toString(),
        dataUrl,
      }
      
      const updatedStripPhotos = [...currentStripPhotos, newStripPhoto]
      setCurrentStripPhotos(updatedStripPhotos)

      // Jika sudah mencapai jumlah foto yang diinginkan, buat strip
      if (updatedStripPhotos.length >= photosPerStrip) {
        const newStrip: PhotoStrip = {
          id: Date.now().toString(),
          photos: updatedStripPhotos,
          timestamp: Date.now(),
        }
        setPhotoStrips(prev => [newStrip, ...prev])
        setCurrentStripPhotos([]) // Reset untuk strip berikutnya
      }
    }
  }

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

  // Fungsi untuk menambahkan watermark
  const addWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save()
    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.lineWidth = 2
    const text = 'PhotoBooth by namaku'
    const textMetrics = ctx.measureText(text)
    const x = width - textMetrics.width - 20
    const y = height - 20
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
    ctx.restore()
  }

  // Fungsi untuk mengunduh foto
  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.download = `photobooth-${photo.timestamp}.png`
    link.href = photo.dataUrl
    link.click()
  }

  // Fungsi untuk menghapus foto
  const deletePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId))
  }

  // Fungsi untuk menghapus photo strip
  const deletePhotoStrip = (stripId: string) => {
    setPhotoStrips(prev => prev.filter(strip => strip.id !== stripId))
  }

  // Fungsi untuk mengunduh photo strip
  const downloadPhotoStrip = async (strip: PhotoStrip) => {
    // Buat canvas untuk menggabungkan semua foto dalam strip
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const photoCount = strip.photos.length
    const photoWidth = 400 // Lebar setiap foto
    const photoHeight = 600 // Tinggi setiap foto
    const padding = 20
    const headerHeight = 60
    const footerHeight = 60
    const gap = 10

    // Hitung ukuran canvas
    if (photoCount === 3) {
      // Layout vertikal untuk 3 foto
      canvas.width = photoWidth + padding * 2
      canvas.height = headerHeight + photoHeight * 3 + gap * 2 + footerHeight + padding * 2
    } else {
      // Layout 2x2 untuk 4 foto
      canvas.width = photoWidth * 2 + gap + padding * 2
      canvas.height = headerHeight + photoHeight * 2 + gap + footerHeight + padding * 2
    }

    // Background putih
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Header
    ctx.fillStyle = '#1f2937'
    ctx.fillRect(0, 0, canvas.width, headerHeight)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('PhotoBooth Studio', canvas.width / 2, headerHeight / 2 + 8)

    // Load semua gambar terlebih dahulu
    const loadImages = strip.photos.map(
      (photo) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.src = photo.dataUrl
        })
    )

    try {
      const images = await Promise.all(loadImages)

      // Gambar setiap foto
      images.forEach((img, index) => {
        let x = 0
        let y = headerHeight + padding

        if (photoCount === 3) {
          // Layout vertikal
          x = padding
          y = headerHeight + padding + index * (photoHeight + gap)
        } else {
          // Layout 2x2
          const row = Math.floor(index / 2)
          const col = index % 2
          x = padding + col * (photoWidth + gap)
          y = headerHeight + padding + row * (photoHeight + gap)
        }

        // Gambar foto dengan border
        ctx.strokeStyle = '#9ca3af'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, photoWidth, photoHeight)
        ctx.drawImage(img, x, y, photoWidth, photoHeight)

        // Nomor foto
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(x + 5, y + 5, 30, 25)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 14px Arial'
        ctx.textAlign = 'left'
        ctx.fillText(`${index + 1}`, x + 20, y + 22)
      })

      // Footer
      const footerY = canvas.height - footerHeight
      ctx.fillStyle = '#f3f4f6'
      ctx.fillRect(0, footerY, canvas.width, footerHeight)
      ctx.fillStyle = '#6b7280'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PhotoBooth by namaku', canvas.width / 2, footerY + 25)
      ctx.font = '12px Arial'
      ctx.fillText(
        new Date(strip.timestamp).toLocaleDateString('id-ID'),
        canvas.width / 2,
        footerY + 45
      )

      // Download
      const link = document.createElement('a')
      link.download = `photobooth-strip-${strip.timestamp}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error creating photo strip:', error)
      alert('Gagal membuat photo strip. Silakan coba lagi.')
    }
  }

  // Fungsi untuk reset strip yang sedang dibuat
  const resetCurrentStrip = () => {
    setCurrentStripPhotos([])
  }

  // Fungsi untuk beralih kamera
  const switchCamera = () => {
    if (availableCameras.length > 1) {
      setCurrentCameraIndex((prev) => (prev + 1) % availableCameras.length)
    } else {
      // Jika hanya satu kamera, coba ganti antara front dan back
      const currentFacingMode = stream?.getVideoTracks()[0]?.getSettings().facingMode
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
      // Hentikan stream yang sedang berjalan
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      // Mulai dengan facing mode baru
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: false,
      }).then(mediaStream => {
        setStream(mediaStream)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      }).catch(error => {
        console.error('Error switching camera:', error)
      })
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            📸 PhotoBooth Studio
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Camera View dengan Flash Effect */}
        <div className="relative mb-8">
          <div className={`absolute inset-0 bg-white transition-opacity duration-200 z-10 ${isFlashing ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
          <CameraView
            videoRef={videoRef}
            stream={stream}
            activeFilter={activeFilter}
            isMirrorMode={isMirrorMode}
          />
        </div>

        {/* Progress Strip (jika mode strip) */}
        {photoMode === 'strip' && currentStripPhotos.length > 0 && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Progress Strip: {currentStripPhotos.length} / {photosPerStrip} foto
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetCurrentStrip}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Reset
              </motion.button>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: photosPerStrip }).map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded ${
                    index < currentStripPhotos.length
                      ? 'bg-blue-600'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Control Panel */}
        <ControlPanel
          onCapture={capturePhoto}
          onSwitchCamera={switchCamera}
          onFilterChange={setActiveFilter}
          activeFilter={activeFilter}
          isMirrorMode={isMirrorMode}
          onMirrorToggle={setIsMirrorMode}
          canSwitchCamera={availableCameras.length > 1}
          photoMode={photoMode}
          onPhotoModeChange={setPhotoMode}
          photosPerStrip={photosPerStrip}
          onPhotosPerStripChange={setPhotosPerStrip}
        />

        {/* Photo Gallery - Mode Single */}
        {photoMode === 'single' && (
          <PhotoGallery
            photos={photos}
            onDownload={downloadPhoto}
            onDelete={deletePhoto}
          />
        )}

        {/* Photo Strip Gallery - Mode Strip */}
        {photoMode === 'strip' && (
          <PhotoStripGallery
            strips={photoStrips}
            onDownload={downloadPhotoStrip}
            onDelete={deletePhotoStrip}
          />
        )}

        {/* Hidden Canvas untuk Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  )
}

