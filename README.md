# 📸 PhotoBooth Studio

Website Photobooth interaktif yang dapat dijalankan langsung di browser desktop maupun mobile.

## ✨ Fitur Utama

- **Live Camera Preview**: Akses kamera perangkat (webcam laptop, kamera PC, atau kamera depan/belakang HP)
- **Capture Photo**: Ambil foto dari video stream secara real-time
- **Download Photo**: Unduh hasil jepretan sebagai file PNG
- **Photo Gallery**: Tampilkan semua foto yang telah diambil dalam grid responsif
- **Photo Filters**: Pilih dari berbagai filter (Normal, Grayscale, Sepia, Blur, Brightness)
- **Switch Camera**: Beralih antara kamera depan dan belakang (jika tersedia)
- **Mirror Mode**: Mode cermin untuk selfie yang lebih natural
- **Flash Effect**: Efek kilat putih saat foto diambil
- **Watermark**: Watermark otomatis "PhotoBooth by namaku" pada setiap foto
- **Smooth Animations**: Animasi halus menggunakan Framer Motion

## 🚀 Instalasi

### Prerequisites

- Node.js 18+ dan npm/yarn terinstall
- Browser modern yang mendukung `getUserMedia()` API (Chrome, Firefox, Safari, Edge)

### Langkah Instalasi

1. **Clone atau download project ini**

2. **Install dependencies**
   ```bash
   npm install
   ```
   atau
   ```bash
   yarn install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   ```
   atau
   ```bash
   yarn dev
   ```

4. **Buka browser dan akses**
   ```
   http://localhost:3000
   ```

5. **Izinkan akses kamera** saat browser meminta izin

## 📦 Build untuk Production

```bash
npm run build
npm start
```

## 🎨 Teknologi yang Digunakan

- **Next.js 14**: Framework React untuk production
- **React 18**: Library UI
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Library animasi untuk React

## 📁 Struktur Project

```
photobooth/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Halaman utama dengan logika utama
│   └── globals.css         # Global styles dengan Tailwind
├── components/
│   ├── CameraView.tsx      # Komponen untuk live preview kamera
│   ├── PhotoGallery.tsx    # Komponen galeri foto
│   └── ControlPanel.tsx    # Komponen panel kontrol (tombol & filter)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🔧 Fitur Detail

### Camera Access
- Menggunakan `navigator.mediaDevices.getUserMedia()` untuk akses kamera
- Otomatis mendeteksi semua kamera yang tersedia
- Mendukung switch antara kamera depan dan belakang

### Photo Filters
- **Normal**: Tanpa filter
- **Grayscale**: Foto hitam putih
- **Sepia**: Efek vintage
- **Blur**: Efek blur ringan
- **Brightness**: Peningkatan kecerahan

### Watermark
Setiap foto yang diambil otomatis memiliki watermark "PhotoBooth by namaku" di pojok kanan bawah.

### Responsive Design
Website dirancang responsif dan dapat digunakan dengan baik di:
- Desktop/Laptop
- Tablet
- Mobile (Android & iOS)

## 🎯 Cara Menggunakan

1. **Buka website** di browser
2. **Izinkan akses kamera** saat diminta
3. **Pilih filter** (opsional) dari panel filter
4. **Aktifkan Mirror Mode** jika ingin tampilan seperti selfie
5. **Klik "Ambil Foto"** untuk mengambil foto
6. **Lihat hasil** di galeri di bawah
7. **Hover pada foto** di galeri untuk melihat tombol download
8. **Klik "Download"** untuk mengunduh foto

## ⚠️ Catatan Penting

- Website memerlukan **HTTPS** atau **localhost** untuk mengakses kamera (kecuali browser tertentu yang mengizinkan HTTP)
- Pastikan browser Anda mendukung **getUserMedia API**
- Beberapa browser mungkin memerlukan izin eksplisit untuk akses kamera
- Untuk production, deploy ke hosting yang mendukung HTTPS

## 🐛 Troubleshooting

### Kamera tidak muncul
- Pastikan izin kamera telah diberikan
- Cek apakah browser mendukung getUserMedia
- Coba refresh halaman

### Foto tidak tersimpan
- Pastikan browser mengizinkan download
- Cek storage browser tidak penuh

### Switch camera tidak bekerja
- Pastikan perangkat memiliki lebih dari satu kamera
- Beberapa perangkat mobile mungkin tidak mendukung switch camera

## 📝 Lisensi

Project ini dibuat untuk keperluan edukasi dan personal use.

## 👤 Author

PhotoBooth Studio - Dibuat dengan ❤️

---

**Selamat menggunakan PhotoBooth Studio! 📸✨**

