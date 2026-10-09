# Panduan Lengkap Guru & Operator: Ekspedisi Eksponen

Dokumen ini berisi panduan teknis dan operasional untuk guru, instruktur, dan operator sekolah dalam menyiapkan, mengonfigurasi, serta mendampingi pelaksanaan pembelajaran berbasis game **Ekspedisi Eksponen: Misi Menyelamatkan Kota Data**.

---

## Daftar Isi
- [A. Menjalankan Game Lokal Tanpa Supabase (Mode Mandiri/Offline)](#a-menjalankan-game-lokal-tanpa-supabase-mode-mandirioffline)
- [B. Mengaktifkan Dashboard Guru dengan Supabase](#b-mengaktifkan-dashboard-guru-dengan-supabase)
- [C. Skenario Penggunaan di Kelas (Siswa & Guru)](#c-skenario-penggunaan-di-kelas-siswa--guru)
- [D. Panduan Build & Deploy ke Layanan Web](#d-panduan-build--deploy-ke-layanan-web)
- [E. Troubleshooting (Penyelesaian Masalah)](#e-troubleshooting-penyelesaian-masalah)
- [F. Catatan Arsitektur & Keamanan Data](#f-catatan-arsitektur--keamanan-data)

---

## A. Menjalankan Game Lokal Tanpa Supabase (Mode Mandiri/Offline)

Game ini dirancang dengan prinsip **offline-first**. Siswa dan guru dapat langsung memainkan game secara penuh di perangkat masing-masing tanpa memerlukan koneksi internet maupun akun Supabase. Progres permainan akan disimpan otomatis di penyimpanan lokal browser (`localStorage`).

### Langkah Cepat Menjalankan:
1. Pastikan komputer Anda telah terpasang **Node.js 18+ atau 20+** dan **npm**.
2. Buka terminal di direktori proyek:
   ```bash
   npm install
   npm run dev
   ```
3. Buka peramban (browser) di alamat:
   ```text
   http://localhost:3000
   ```
4. Siswa dapat langsung membuat nama tim, memilih peran anggota, dan menyelesaikan Episode 1. Data progres tersimpan di peramban masing-masing tanpa memerlukan konfigurasi database.

---

## B. Mengaktifkan Dashboard Guru dengan Supabase

Untuk memantau aktivitas siswa secara langsung (*real-time monitoring*), melihat alasan/diskusi tiap kelompok, skor, dan token energi di layar proyektor/laptop guru, hubungkan game ke Supabase.

### 1. Membuat Project Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com) dan masuk atau daftar akun gratis.
2. Klik tombol **New Project**, pilih nama organisasi, masukkan nama proyek (contoh: `ekspedisi-eksponen`), buat *Database Password* yang kuat, lalu pilih Region terdekat (misal: *Singapore / Southeast Asia*).
3. Tunggu 1–2 menit hingga penyediaan database selesai.

### 2. Mengambil Kredensial URL & Publishable Key
1. Masuk ke menu **Project Settings** (ikon gerigi di bilah kiri bawah) -> **API**.
2. Temukan informasi berikut:
   - **Project URL**: URL dengan format `https://[PROJECT-REF].supabase.co`
   - **Project API Keys**: Salin kunci berlabel `anon` / `public`.
   > ⚠️ **PENTING**: Jangan pernah menggunakan atau menyalin `service_role` (secret key). Klien web hanya boleh memakai `anon` key.

### 3. Mengatur Variabel Lingkungan Lokal
Buat file bernama `.env.local` pada direktori akar proyek (atau salin dari `.env.example`):
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Menjalankan Skrip Skema Database
1. Buka menu **SQL Editor** pada bilah kiri dashboard Supabase Anda.
2. Buka file `supabase/schema.sql` yang ada di proyek ini, salin seluruh kodenya, lalu tempel (*paste*) ke SQL Editor Supabase.
3. Klik tombol **Run** (atau tombol panah hijau).
4. Pastikan keluar pesan `Success. No rows returned`. Skrip ini secara otomatis membuat:
   - Tabel `profiles`, `episodes`, `teams`, `team_members`, `team_progress`, dan `question_attempts`.
   - Mengaktifkan Row Level Security (RLS) pada seluruh tabel.
   - Menginisialisasi 4 fungsi RPC bertanda `SECURITY DEFINER` (`game_save_team`, `game_save_team_members`, `game_save_progress`, `game_log_attempt`).

### 5. Membuat Akun Guru & Mengamankan Pendaftaran
1. Buka menu **Authentication** -> **Users** pada dashboard Supabase.
2. Klik tombol **Add user** -> pilih **Create user**.
3. Masukkan **Email** guru (contoh: `guru@sekolah.sch.id`) dan **Password** guru.
4. Centang opsi **Auto Confirm User** (agar tidak perlu verifikasi link via email).
5. Klik **Create user**. Akun guru telah siap dipakai untuk login di aplikasi.
6. **Kunci Pendaftaran Publik**:
   - Buka menu **Authentication** -> **Configuration** (atau **Sign Up Settings** / **Providers**).
   - Matikan (nonaktifkan) pilihan **"Allow new users to sign up"** (atau *Enable Email Signup*).
   - Langkah ini memastikan siswa tidak dapat membuat akun guru secara mandiri untuk membuka dashboard.

---

## C. Skenario Penggunaan di Kelas (Siswa & Guru)

### 1. Persiapan Sebelum Kelas Dimulai (Guru)
1. Buka aplikasi game di laptop guru, klik tombol **Mode Guru** di pojok kanan atas.
2. Masukkan email dan password guru yang telah dibuat pada langkah sebelumnya.
3. Pada halaman kontrol guru, buat atau tentukan **Kode Sesi Kelas**, misalnya `KELAS-XA` atau `MAT-101`.
4. Berikan kode sesi tersebut kepada seluruh siswa di kelas.

### 2. Alur Bermain Siswa (Di Perangkat Kelompok / HP Siswa)
1. Siswa mengakses URL game di browser mereka.
2. Pada layar pendaftaran kelompok (**Setup Tim**):
   - Masukkan **Nama Tim** (contoh: `Tim Alpha`, `Kelompok Newton`). Nama tim digunakan sebagai *seed* generator matematis sehingga setiap tim mendapatkan angka variasi yang adil dan deterministik.
   - Masukkan **Kode Sesi Kelas** yang diberikan oleh guru (misal: `KELAS-XA`).
   - Masukkan nama anggota kelompok dan pilih peran kooperatif: *Navigator*, *Penghitung*, *Pemeriksa*, *Pencatat*, *Penjelas*.
3. Siswa memulai petualangan di **Episode 1: Menyelamatkan Kota Data**.
4. Di setiap tantangan level (*Jelajah*, *Peneliti*, *Master*):
   - Siswa menganalisis soal matematika dan berdiskusi.
   - Siswa **wajib mengetikkan alasan / langkah pengerjaan kelompok** di kolom penjelasan sebelum menekan tombol Kirim Jawaban.
   - Jawaban dapat dituliskan dalam format desimal, pecahan, perkalian berulang, atau notasi pangkat (contoh: `2^5`, `32`, `2*2*2*2*2`, `2⁵`).

### 3. Pemantauan Langsung & Intervensi Guru
- Pada Dashboard Guru, guru dapat melihat tabel seluruh tim yang memasukkan kode sesi tersebut:
  - Indikator tim aktif (*live pulse*).
  - Skor, token energi tersisa, dan level yang sedang dikerjakan.
  - Jumlah petunjuk (*hint*) yang dikonsumsi tim.
  - **Audit Jawaban & Alasan**: Klik nama tim untuk membaca alasan diskusi mereka, kesalahan konsep (*misconception alert*), dan riwayat percobaan.
- Guru dapat memberikan bimbingan langsung kepada kelompok yang kehilangan banyak energi atau berulang kali salah pada sifat perpangkatan tertentu.

---

## D. Panduan Build & Deploy ke Layanan Web

### 1. Penting: Penanaman Variabel Lingkungan Saat Build
Vite menyematkan variabel lingkungan yang berawalan `VITE_` secara statis ke dalam bundel JavaScript saat perintah `npm run build` dijalankan (*build-time embedding*).
- Sebelum menjalankan perintah build atau mengonfigurasi platform CI/CD, pastikan nilai `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` sudah terisi di Environment Variables penyedia hosting Anda.

### 2. Perintah Kompilasi Produksi
```bash
npm run build
```
Hasil kompilasi akan berada di folder `dist/`. Anda dapat mempratinjau hasil build secara lokal dengan:
```bash
npm run preview
```

### 3. Rekomendasi Platform Hosting
- **Vercel / Netlify / Cloudflare Pages**:
  - *Build Command*: `npm run build`
  - *Output Directory*: `dist`
  - *Environment Variables*: Masukkan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
- **Progressive Web App (PWA)**:
  Setelah dideploy dengan HTTPS, siswa dapat mengetuk tombol browser **"Install App"** atau **"Add to Home Screen"** untuk memasang aplikasi di tablet/ponsel tanpa perlu mengunduh dari App Store.

---

## E. Troubleshooting (Penyelesaian Masalah)

| Gejala Masalah | Kemungkinan Penyebab | Langkah Solusi Konkret |
| :--- | :--- | :--- |
| Tombol kirim jawaban atau sinkronisasi berstatus "Koneksi Offline" | Koneksi internet kelas terputus atau URL Supabase belum diatur di `.env.local`. | Game tetap bisa dimainkan! Data tersimpan di `localStorage`. Sambungkan kembali WiFi atau periksa `VITE_SUPABASE_URL`. Begitu online, data akan tersinkronisasi. |
| Dashboard Guru kosong / data tim siswa tidak muncul | Kode sesi kelas tidak cocok antara siswa dan guru, atau siswa belum memasukkan kode sesi. | Pastikan siswa mengetikkan **Kode Sesi** yang sama persis (huruf besar/kecil tidak sensitif) pada saat pendaftaran kelompok. |
| Muncul pesan "Function game_save_progress does not exist" atau error RPC | Skrip `supabase/schema.sql` belum dijalankan di SQL Editor Supabase. | Buka Supabase -> **SQL Editor**, salin seluruh isi `supabase/schema.sql`, dan klik **Run**. |
| Guru gagal login ("Invalid login credentials") | Akun guru belum dibuat di Supabase Authentication, atau salah email/password. | Masuk ke dashboard Supabase -> **Authentication** -> **Users** -> buat user baru dengan opsi *Auto Confirm User* dicentang. |
| Siswa dapat mengakses dashboard guru | Pendaftaran publik di Supabase masih terbuka. | Nonaktifkan opsi *"Allow new users to sign up"* di Supabase Authentication settings. Hanya guru yang didaftarkan manual yang memiliki akses login. |
| Rumus matematika tidak tampil rapi / berantakan | Font KaTeX belum termuat atau JavaScript diblokir browser. | Periksa apakah peramban memblokir skrip pihak ketiga, atau segarkan (*refresh*) halaman untuk memuat stylesheet KaTeX lokal. |
| Progres tim hilang saat berganti komputer | Data disimpan di `localStorage` perangkat lokal dan belum tersinkron ke akun cloud. | Masukkan kode sesi kelas yang sama sebelum bermain agar progres tersimpan ke database pusat Supabase. |

---

## F. Catatan Arsitektur & Keamanan Data

Aplikasi ini mengadopsi prinsip keamanan modern untuk melindungi integritas penilaian kelas:

1. **Prinsip Hak Akses Minimal (Least Privilege)**:
   - Klien siswa hanya berinteraksi menggunakan `anon` key publik.
   - Tabel database dilindungi dengan **Row Level Security (RLS)**. Siswa tidak memiliki izin baca (*SELECT*) ke tabel kelompok lain, sehingga tidak mungkin menyontek jawaban tim lain melalui inspeksi jaringan (*Network tab*).
2. **Penulisan Aman via RPC `SECURITY DEFINER`**:
   - Penyimpanan data tim dan progres dilakukan melalui fungsi khusus berparameter ketat: `game_save_team`, `game_save_team_members`, `game_save_progress`, dan `game_log_attempt`.
   - Hal ini mencegah injeksi manipulasi kolom database secara langsung dari sisi peramban.
3. **Pemisahan Peran Guru & Siswa**:
   - Halaman Dashboard Guru mengecek status otentikasi Supabase (`supabase.auth.getUser()`).
   - Hanya pengguna dengan sesi terautentikasi (*role authenticated*) yang diizinkan melakukan pembacaan (*SELECT*) menyeluruh terhadap rekaman seluruh tim di kelas.
