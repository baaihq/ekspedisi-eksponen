# Ekspedisi Eksponen: Misi Menyelamatkan Kota Data

Game petualangan edukasi matematika interaktif materi **Eksponen (Perpangkatan)** untuk fase E / SMA Kelas X. Dirancang khusus untuk pembelajaran kelompok kooperatif, eksplorasi konseptual, dan pemantauan langsung oleh guru (*real-time teacher dashboard*).

---

## 🚀 Fitur Utama

- **Alur Cerita & Gamifikasi Interaktif**: Siswa bertualang di Kota Data untuk memperbaiki sektor energi dengan memecahkan tantangan eksponen bertingkat (*Jelajah, Peneliti, Master*).
- **Struktur Materi Komprehensif (4 Episode)**:
  1. **Episode 1: Menyelamatkan Kota Data** — Konsep dasar perkalian berulang & sifat-sifat eksponen ($a^m \cdot a^n$, $a^m / a^n$, $(a^m)^n$, dsb.)
  2. **Episode 2: Serangan Mikro** — Pangkat nol, bilangan berpangkat bulat negatif, dan notasi ilmiah.
  3. **Episode 3: Bahasa Akar** — Pangkat pecahan, operasi bentuk akar, dan merasionalkan penyebut.
  4. **Episode 4: Gerbang Inti** — Pemecahan masalah kontekstual & asesmen terpadu.
- **Formulasi Alasan & Kolaborasi Tim**: Siswa wajib mendiskusikan dan menuliskan alasan/cara kerja kelompok sebelum mengirimkan jawaban.
- **Rendering KaTeX Presisi**: Tampilan rumus matematika bersih tanpa kebocoran kode LaTeX mentah ke siswa.
- **Offline-First & PWA**: Tetap dapat dimainkan tanpa koneksi internet menggunakan penyimpanan lokal browser (`localStorage`) dan dapat diinstal ke perangkat (*Progressive Web App*).
- **Dashboard Monitoring Guru Real-Time**: Guru memantau skor, progres soal, detail jawaban kelompok, dan alasan diskusi secara langsung per kode sesi kelas.
- **Web Audio Synthesizer**: Efek suara dan musik latar ambient prosedural yang responsif dan hemat sumber daya.
- **Dukungan Dark Mode**: Tampilan gelap/terang mulus tanpa kedipan (*zero FOUC*).

---

## 🛠️ Persyaratan Sistem & Teknologi

- **Runtime**: Node.js 18+ (atau Node.js 20+) & npm
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion
- **Matematika & Notasi**: KaTeX
- **Database & Backend**: Supabase (PostgreSQL, Row Level Security, RPC Security Definer, Supabase Auth)
- **PWA**: vite-plugin-pwa

---

## 💻 Cara Menjalankan Proyek

### 1. Kloning & Pemasangan Dependensi
```bash
git clone <url-repository>
cd ekspedisi-eksponen
npm install
```

### 2. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

### 3. Pengecekan Lint & TypeScript
```bash
npm run lint
```

### 4. Build untuk Produksi
```bash
npm run build
```
Hasil kompilasi produksi siap pakai akan berada di folder `dist/`.

---

## 🔐 Konfigurasi Supabase & Database

Aplikasi mendukung mode **Offline/Lokal** tanpa konfigurasi apapun, namun untuk mengaktifkan pemantauan kelas di Dashboard Guru secara online, ikuti langkah berikut:

### 1. Buat Proyek di Supabase
1. Buka [supabase.com](https://supabase.com) dan buat proyek baru.
2. Salin **Project URL** dan **anon/public API Key** dari menu *Project Settings -> API*.

### 2. Atur Variabel Lingkungan
Buat file `.env` di direktori utama:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> **Catatan Keamanan**: JANGAN PERNAH menaruh `service_role` secret key di aplikasi klien. Gunakan hanya `anon` publishable key.

### 3. Pasang Skema Database (Satu Sumber Kebenaran)
1. Buka **SQL Editor** di dashboard Supabase Anda.
2. Buka file `supabase/schema.sql` (atau klik tombol **Salin Skrip SQL** di Dashboard Guru aplikasi).
3. Tempel dan jalankan (*Run*) seluruh skrip SQL tersebut.
   Skrip ini akan membuat tabel (`teams`, `team_members`, `team_progress`, `question_attempts`, `episodes`, `profiles`), mengaktifkan RLS, serta memasang fungsi RPC `SECURITY DEFINER`.

---

## 👨‍🏫 Pembuatan Akun Guru

Akses ke Dashboard Guru diamankan menggunakan **Supabase Authentication**:

1. Buka dashboard Supabase Anda -> menu **Authentication** -> **Users**.
2. Klik **Add user** -> pilih **Create user**.
3. Masukkan **Email** dan **Password** akun guru, lalu klik buat.
4. *(Disarankan untuk keamanan kelas)*: Buka tab **Authentication** -> **Providers** / **Sign Up Settings**, lalu nonaktifkan **"Allow new users to sign up"** agar siswa tidak dapat membuat akun guru secara mandiri.
5. Guru kini dapat masuk di aplikasi melalui tombol **Mode Guru** di pojok kanan atas dengan memasukkan email dan password yang telah dibuat.

---

## 🛡️ Arsitektur Keamanan (RLS & RPC Security Definer)

Untuk melindungi kerahasiaan data kelompok siswa dan menjaga integritas penilaian:

1. **Siswa Bermain Tanpa Login (Anonim)**:
   - Siswa tidak memiliki akun terdaftar dan **tidak diberikan izin SELECT** ke tabel tim lain. Hal ini mencegah kelompok saling menyontek data jawaban.
2. **Penulisan Data Melalui RPC `SECURITY DEFINER`**:
   - Seluruh operasi penyimpanan tim, anggota kelompok, progres level, dan riwayat jawaban (`question_attempts`) dilakukan melalui 4 fungsi RPC tersertifikasi:
     - `game_save_team`
     - `game_save_team_members`
     - `game_save_progress`
     - `game_log_attempt`
   - Kebijakan RLS tidak memperbolehkan siswa umum melakukan direct `INSERT` atau `UPDATE` tabel secara liar.
3. **Guru Terautentikasi (Role `authenticated`)**:
   - Guru yang telah login memiliki kebijakan `SELECT` ke seluruh tabel data untuk kebutuhan pemantauan live di kelas.
4. **Offline-First Resilience**:
   - Jika koneksi internet kelas lambat atau terputus, sinkronisasi otomatis dialihkan ke `localStorage`. Banner status sinkronisasi akan memberi tahu pengguna tanpa mengganggu jalannya permainan siswa.
