'use client'

import { useEffect, useRef, useState } from 'react'
import type { FaceLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision'
import { MotionProps, motion } from 'framer-motion'

export type FaceEffectType = 'none' | 'blush' | 'freckles' | 'flowers' | 'glitter'

interface FaceEffectsOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement>
  effect: FaceEffectType
  canvasExternalRef?: React.RefObject<HTMLCanvasElement>
  mirror?: boolean
}

/**
 * FaceEffectsOverlay
 * Menggunakan MediaPipe FaceLandmarker untuk mendeteksi landmark wajah secara realtime,
 * lalu menggambar efek/emoji/stiker di canvas overlay mengikuti titik wajah.
 */
export default function FaceEffectsOverlay({ videoRef, effect, canvasExternalRef, mirror = false }: FaceEffectsOverlayProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = canvasExternalRef ?? internalCanvasRef
  const [isReady, setIsReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)
  const rafRef = useRef<number>()
  // beauty (skin smoothing) intensity shared by parent via dataset to avoid prop churn
  const getBeautyIntensity = (): number => {
    const v = (canvasRef.current as any)?.dataset?.beauty
    const parsed = Number(v)
    return Number.isFinite(parsed) ? parsed : 0
  }

  // Load model FaceLandmarker (WASM) sekali
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const tasksVision = await import('@mediapipe/tasks-vision')
        const vision = await tasksVision.FilesetResolver.forVisionTasks(
          // WASM base
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.7/wasm'
        )
        if (cancelled) return
        const lm = await tasksVision.FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            // Model stabil
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
        if (!cancelled) {
          setLandmarker(lm)
          setIsReady(true)
        }
      } catch (e: any) {
        console.error('FaceLandmarker init error', e)
        if (!cancelled) setLoadError('Gagal memuat AR')
      }
    })()
    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Render loop
  useEffect(() => {
    const loop = () => {
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [landmarker, effect])

  const draw = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // Sinkronkan ukuran canvas dengan video
    const vw = video.videoWidth || 0
    const vh = video.videoHeight || 0
    if (vw === 0 || vh === 0) return
    if (canvas.width !== vw || canvas.height !== vh) {
      canvas.width = vw
      canvas.height = vh
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!landmarker) return

    try {
      const nowMs = performance.now()
      const result = landmarker.detectForVideo(video, nowMs)
      if (!result.faceLandmarks || result.faceLandmarks.length === 0) return
      const landmarks = result.faceLandmarks[0]

      // Beauty smoothing (simple blur inside an estimated face ellipse)
      const beauty = getBeautyIntensity()
      if (beauty > 0) {
        const bx = Math.min(Math.max(beauty, 0), 100)
        const blurPx = Math.max(1, Math.round((bx / 100) * Math.min(vw, vh) * 0.02))
        // Offscreen draw blurred video
        const off = document.createElement('canvas')
        off.width = vw
        off.height = vh
        const octx = off.getContext('2d')
        if (octx) {
          octx.filter = `blur(${blurPx}px)`
          octx.drawImage(video, 0, 0, vw, vh)
          // Build an ellipse from face bounds
          const xs = landmarks.map(p => p.x)
          const ys = landmarks.map(p => p.y)
          const minx = Math.min(...xs) * vw
          const maxx = Math.max(...xs) * vw
          const miny = Math.min(...ys) * vh
          const maxy = Math.max(...ys) * vh
          const cx = (minx + maxx) / 2
          const cy = (miny + maxy) / 2
          const rx = (maxx - minx) * 0.6
          const ry = (maxy - miny) * 0.7
          ctx.save()
          ctx.globalAlpha = 0.9
          ctx.beginPath()
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(off, 0, 0)
          ctx.restore()
        }
      }

      if (effect === 'blush') {
        drawBlush(ctx, landmarks, vw, vh)
      } else if (effect === 'freckles') {
        drawFreckles(ctx, landmarks, vw, vh)
      } else if (effect === 'flowers') {
        drawFlowers(ctx, landmarks, vw, vh)
      } else if (effect === 'glitter') {
        drawGlitter(ctx, landmarks, vw, vh)
      }
    } catch {
      // ignore occasional detect errors while loading
    }
  }

  // Efek: Blush di pipi
  const drawBlush = (ctx: CanvasRenderingContext2D, lm: NormalizedLandmark[], w: number, h: number) => {
    // Indeks pipi kira-kira area dekat landmark 234 (kiri) dan 454 (kanan) di FaceMesh
    const leftCheek = lm[234]
    const rightCheek = lm[454]
    if (!leftCheek || !rightCheek) return
    ctx.save()
    ctx.globalAlpha = 0.25
    ctx.fillStyle = '#ff6b6b'
    const radius = Math.max(w, h) * 0.06
    ctx.beginPath()
    ctx.ellipse(leftCheek.x * w, leftCheek.y * h, radius, radius * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(rightCheek.x * w, rightCheek.y * h, radius, radius * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Efek: Freckles (bintik) di pipi dan hidung
  const drawFreckles = (ctx: CanvasRenderingContext2D, lm: NormalizedLandmark[], w: number, h: number) => {
    const pts = [lm[4], lm[94], lm[129], lm[234], lm[454], lm[197], lm[6]].filter(Boolean) as NormalizedLandmark[]
    ctx.save()
    ctx.fillStyle = 'rgba(120, 72, 48, 0.65)'
    pts.forEach((p) => {
      for (let i = 0; i < 8; i++) {
        const ox = (Math.random() - 0.5) * 16
        const oy = (Math.random() - 0.5) * 12
        const r = 1 + Math.random() * 1.8
        ctx.beginPath()
        ctx.arc(p.x * w + ox, p.y * h + oy, r, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.restore()
  }

  // Efek: Flowers (emoji bunga) tersebar di sekitar wajah
  const drawFlowers = (ctx: CanvasRenderingContext2D, lm: NormalizedLandmark[], w: number, h: number) => {
    const center = lm[168] || lm[1]
    if (!center) return
    const cx = center.x * w
    const cy = center.y * h
    const emojis = ['🌼', '🌸', '💮', '🌻', '🌷']
    ctx.save()
    ctx.font = `${Math.round(Math.max(w, h) * 0.04)}px serif`
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const radius = Math.max(w, h) * (0.12 + Math.random() * 0.05)
      const x = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 20
      const y = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 20
      const e = emojis[i % emojis.length]
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(((Math.random() - 0.5) * Math.PI) / 8)
      ctx.fillText(e, 0, 0)
      ctx.restore()
    }
    ctx.restore()
  }

  // Utility: gambar satu bintang kecil
  const star = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((Math.random() * Math.PI) / 2)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(0.8, r * 0.15)
    ctx.globalAlpha = 0.85
    // cross
    ctx.beginPath()
    ctx.moveTo(-r, 0)
    ctx.lineTo(r, 0)
    ctx.moveTo(0, -r)
    ctx.lineTo(0, r)
    ctx.stroke()
    // small diagonals
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.moveTo(-r * 0.7, -r * 0.7)
    ctx.lineTo(r * 0.7, r * 0.7)
    ctx.moveTo(r * 0.7, -r * 0.7)
    ctx.lineTo(-r * 0.7, r * 0.7)
    ctx.stroke()
    ctx.restore()
  }

  // Efek: Glitter (bintang kecil berkilau) di pipi/dahi
  const drawGlitter = (ctx: CanvasRenderingContext2D, lm: NormalizedLandmark[], w: number, h: number) => {
    // area target: pipi kiri/kanan, dahi tengah
    const leftCheek = lm[234]
    const rightCheek = lm[454]
    const forehead = lm[10] || lm[151]
    if (!leftCheek || !rightCheek || !forehead) return
    const areas = [
      { x: leftCheek.x * w, y: leftCheek.y * h },
      { x: rightCheek.x * w, y: rightCheek.y * h },
      { x: forehead.x * w, y: forehead.y * h - h * 0.06 },
    ]

    // jumlah glitter dipengaruhi resolusi
    const baseCount = 16
    const jitter = (n: number) => (Math.random() - 0.5) * n
    ctx.save()
    // warna shimmer acak
    const colors = ['#ffd966', '#fff1a6', '#ffffff', '#ffb3ec', '#a3e0ff']
    for (const a of areas) {
      for (let i = 0; i < baseCount; i++) {
        const r = Math.max(1.2, Math.random() * Math.min(w, h) * 0.008)
        const x = a.x + jitter(40)
        const y = a.y + jitter(32)
        const color = colors[(Math.random() * colors.length) | 0]
        // flicker
        if (Math.random() > 0.3) {
          star(ctx, x, y, r, color)
        }
      }
    }
    // sedikit sparkle halus (noise) dengan titik kecil
    ctx.globalAlpha = 0.35
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < baseCount * 2; i++) {
      const t = areas[(Math.random() * areas.length) | 0]
      const x = t.x + jitter(42)
      const y = t.y + jitter(34)
      const r = Math.random() * 1.2
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none ${mirror ? 'scale-x-[-1]' : ''}`}
        style={{ transform: mirror ? 'scaleX(-1)' : undefined }}
      />
      {!isReady && !loadError && (
        <div className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded pointer-events-none">
          Memuat AR…
        </div>
      )}
      {loadError && (
        <div className="absolute top-2 left-2 text-xs bg-red-600/80 text-white px-2 py-1 rounded pointer-events-none">
          {loadError}
        </div>
      )}
    </>
  )
}


