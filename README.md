# SEAPEDIA (Software Engineering Academy COMPFEST 18)

SEAPEDIA adalah platform _e-commerce fullstack_ terintegrasi yang menghubungkan Pembeli (_Buyer_), Penjual (_Seller_), Pengemudi Pengiriman (_Delivery Driver_), dan Administrator (_Admin_) dalam satu ekosistem _marketplace_ multi-toko.

---

## 🌐 Tautan Produksi (Live Deployed URLs)

Aplikasi ini telah dideploy secara online dan dapat diakses langsung melalui tautan berikut:

- **Frontend (Vercel):** [https://sealabs.vercel.app](https://sealabs.vercel.app)
- **Backend (Railway):** [https://sealabs-production.up.railway.app](https://sealabs-production.up.railway.app)
- **Dokumentasi Swagger (Production):** [https://sealabs-production.up.railway.app/api](https://sealabs-production.up.railway.app/api)

---

## 🚀 Panduan Memulai (Setup & Run)

### 1. Prasyarat (_Prerequisites_)

- Node.js (versi 18 atau lebih baru) - (v24.15.0 ~ my version)
- NPM (versi 9 atau lebih baru) - (11.14.1 ~ my version)
- PostgreSQL database (direkomendasikan menggunakan Supabase/local PostgreSQL)

### 2. Konfigurasi Environment Variables (`.env`)

#### Backend (`/backend/.env`)

Buat berkas `.env` di folder `backend/` dan sesuaikan nilainya:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/seapedia?schema=public"
DIRECT_URL="postgresql://username:password@localhost:5432/seapedia?schema=public"
JWT_ACCESS_SECRET="ganti_dengan_key_rahasia_dan_panjang_disini"
```

#### Frontend (`/frontend/.env.local` - Opsional)

Jika backend berjalan di port selain `3000`, buat berkas `.env.local` di folder `frontend/`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

### 3. Instalasi dan Sinkronisasi Database (NestJS Backend)

Buka terminal baru, masuk ke direktori backend, pasang dependensi, jalankan migrasi database, populasi data awal (_seeding_), dan jalankan server backend:

```bash
cd backend
npm install

# Jalankan migrasi database untuk menyinkronkan skema PostgreSQL
npx prisma migrate dev

# Jalankan skrip seeding untuk membuat data awal
npx prisma db seed

# Jalankan backend dalam mode watch/development
npm run start:dev
```

_Backend Anda akan berjalan pada alamat: `http://localhost:3000`_

---

### 4. Instalasi dan Eksekusi Antarmuka (Next.js Frontend)

Buka terminal kedua, masuk ke direktori frontend, pasang dependensi, dan jalankan server pengembangan:

```bash
cd frontend
npm install

# Jalankan server Next.js frontend
npm run dev
```

_Frontend Anda akan berjalan pada alamat: `http://localhost:3001`_

---

## 🔑 Kredensial Akun Uji Coba (Demo Account)

Untuk mempermudah proses penilaian dan demonstrasi, skrip seed telah membuat **satu akun demo terpadu** yang memegang ke-4 peran sekaligus secara simultan:

- **Username:** `seapedia_demo`
- **Password:** `password123`
- **Peran yang Dimiliki:** `ADMIN`, `BUYER`, `SELLER`, `DRIVER`
- **Peran Aktif Awal:** `BUYER` (Dapat diubah secara dinamis melalui dashboard/navbar).
- **Aset Bawaan:** Saldo awal dompet sebesar **Rp500.000**, alamat rumah terdaftar, toko demo berpemilik bernama **"Toko Seapedia"**, dan 3 produk aktif terdaftar.

---

## 📖 Dokumentasi REST API (Swagger)

Backend SEAPEDIA dilengkapi dengan dokumentasi interaktif **Swagger / OpenAPI** yang secara otomatis mencantumkan seluruh rute API.

- **URL Dokumentasi Lokal:** [http://localhost:3000/api](http://localhost:3000/api)
- **URL Dokumentasi Production:** [https://sealabs-production.up.railway.app/api](https://sealabs-production.up.railway.app/api)
- **Cara Menggunakan Otorisasi di Swagger:**
  1. Lakukan request `POST /auth/login` menggunakan kredensial demo di atas melalui Swagger.
  2. Salin token `accessToken` yang dikembalikan dari respon JSON.
  3. Klik tombol **"Authorize"** di pojok kanan atas halaman Swagger.
  4. Masukkan token tersebut (Format: `Bearer <token_anda>`) dan klik **Authorize**.
  5. Seluruh endpoint terproteksi kini dapat Anda uji langsung di browser.

---

## 🗺️ Implementasi Aturan Bisnis E-Commerce

### 1. Keranjang Belanja Satu Toko (_Single-Store Checkout_)

- Keranjang belanja (_cart_) hanya boleh menyimpan barang dari **satu toko yang sama** dalam satu waktu.
- Jika pembeli mencoba menambahkan barang dari toko lain, program frontend dan backend secara konsisten menolak dan mendesak pembeli mengosongkan atau menyelesaikan keranjang lama terlebih dahulu.

### 2. Perhitungan Diskon & PPN 12%

- **Sistem Diskon:** Mendukung potongan kuota terbatas (**Voucher**) dan potongan berulang (**Promo**).
- **Rumus Perhitungan Transaksi Post-Discount:**
  $$\text{Subtotal} = \sum (\text{Harga Produk} \times \text{Kuantitas})$$
  $$\text{Potongan Diskon} = \text{Nilai Diskon (Voucher/Promo)}$$
  $$\text{PPN 12\%} = \text{Post-Discount Subtotal} \times 12\% = (\text{Subtotal} - \text{Potongan Diskon}) \times 0.12$$
  $$\text{Total Akhir} = (\text{Subtotal} - \text{Potongan Diskon}) + \text{PPN 12\%} + \text{Ongkos Kirim}$$

### 3. Skema Pendapatan Driver

- Pendapatan kurir/driver dihitung secara transaksional penuh sebesar **100% dari tarif pengiriman** (_delivery fee_) pesanan terkait. Pendapatan ini akan ditambahkan ke saldo dompet driver setelah driver mengirimkan pesanan dan menyelesaikan status pekerjaan (_confirm completed_).

### 4. SLA Overdue & Simulasi Jam Virtual

- **Batas Waktu Pengantaran (SLA):**
  - `INSTANT`: 24 Jam (1 Hari)
  - `NEXT_DAY`: 48 Jam (2 Hari)
  - `REGULAR`: 96 Jam (4 Hari)
- **Simulasi Pergeseran Hari:** Admin dapat memajukan waktu sistem virtual sebesar `+1 Hari` per klik tombol melalui dasbor Admin (`POST /admin/advance-time`).
- **Penanganan Keterlambatan (_Auto-Refund_):** Ketika tombol "Jalankan Cek Overdue" dipicu, sistem menscan seluruh pesanan aktif yang melebihi batas waktu SLA berdasarkan waktu virtual sistem. Pesanan tersebut otomatis dibatalkan (status `DIKEMBALIKAN`), stok produk dikembalikan, kurir dibatalkan, dan dana buyer dikembalikan 100% ke saldo dompet buyer (_reversal transaction_).

---

## 🛡️ Laporan Pengerasan Keamanan (Security Hardening Report)

### 1. SQL Injection Prevention

- Seluruh interaksi database backend diimplementasikan menggunakan **Prisma ORM** dengan PostgreSQL driver adapter. Prisma secara internal memformat kueri menggunakan _parameterized queries_ (SQL placeholders), memastikan data masukan dari client tidak dapat disisipkan sebagai sintaks SQL mentah.

### 2. XSS (Cross-Site Scripting) Mitigation

- **Backend Sanitization:** Berkas [reviews.service.ts] menerapkan HTML-encoding pada input `comment` dan `reviewerName` ulasan publik sebelum menyimpannya ke database. Karakter khusus HTML (`&`, `<`, `>`, `"`, `'`) dikonversi secara aman menjadi entitas HTML (seperti `&lt;` dan `&gt;`).
- **Frontend Safe-Rendering:** React secara bawaan meloloskan string pada sintaks JSX `{comment}`. Aplikasi ini juga tidak menggunakan atribut berisiko tinggi seperti `dangerouslySetInnerHTML`.

### 3. Input Validation Hardening (DTO)

- Modul backend divalidasi ketat menggunakan `ValidationPipe` global dengan konfigurasi:
  ```typescript
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true, // Menolak properti ilegal tak terdaftar
    }),
  );
  ```
- Semua data transfer object (DTO) dilengkapi dengan dekorator validasi dari `class-validator` (seperti `@IsInt()`, `@Min()`, `@IsEmail()`) untuk memastikan tipe data, rentang angka, dan kelengkapan masukan sudah bersih sebelum diproses oleh server.

### 4. Session & Route Hardening

- **JWT Expiration:** Masa berlaku JWT diset wajar selama `1d` (24 jam) untuk mengurangi risiko penyalahgunaan token yang tercuri.
- **Logout Server-Side Invalidation:** Menggunakan mekanisme `tokenVersion`. Saat tombol logout ditekan, backend menaikkan `tokenVersion` user di database. `JwtStrategy` membandingkan version di payload token dengan database; jika berbeda (token lama sesudah logout), request otomatis ditolak dengan `401 Unauthorized`.
- **Next.js Proxy Route Protection:** Berkas [proxy.ts] (Middleware Next.js 16) mencegat akses rute di level jaringan. Semua rute privat (`/dashboard/*`, `/admin`, `/cart`, `/checkout`, `/orders/*`, `/deliveries/*`) diblokir dan dialihkan langsung ke `/login` jika cookie token otorisasi kosong.
- **Active Role Verification (Server-Side RBAC):** Otorisasi peran diverifikasi ketat di sisi server. Pengguna dengan multi-role hanya dapat mengakses endpoint yang diizinkan oleh **peran aktifnya saat itu** (misal: jika `activeRole` di database adalah `BUYER`, maka akses ke endpoint khusus `SELLER` atau `DRIVER` otomatis ditolak oleh Guard server-side, meskipun pengguna tersebut memiliki peran tersebut). Endpoint khusus `ADMIN` dilindungi secara absolut dari pengguna non-admin.
- **Resource Ownership Protection:** Backend memverifikasi kepemilikan data sebelum mengizinkan modifikasi sumber daya. Pengguna dilarang memanipulasi atau mengakses sumber daya milik pengguna lain (misalnya, penjual tidak dapat mengubah produk milik toko lain, pembeli tidak dapat melihat detail pesanan pembeli lain, dan pengemudi tidak dapat menyelesaikan pekerjaan pengiriman milik pengemudi lain). Verifikasi ini dilakukan dengan membandingkan ID pemilik data di database dengan ID pengguna yang terverifikasi dari token JWT.

---

## 🧪 Skenario Pengujian Alur Demo E2E (End-to-End Testing)

Untuk memverifikasi seluruh modul sistem berjalan harmonis, Anda dapat melakukan uji coba alur transaksi penuh berikut ini:

1.  **Login & Pilih Peran:**
    - Buka `http://localhost:3001/login`, masuk menggunakan akun `seapedia_demo` / `password123`.
    - Pilih peran aktif Anda sebagai **Buyer**.
2.  **Belanja Produk (Buyer):**
    - Buka katalog produk di halaman utama, pilih produk dari toko Anda sendiri ("Toko Seapedia"), masukkan ke keranjang.
    - Buka halaman `/cart`, kuantitas produk dapat disesuaikan.
3.  **Proses Checkout & Voucher (Buyer):**
    - Klik **"Checkout"**, pilih alamat demo dan kurir.
    - Anda dapat mengetikkan kode diskon uji coba di bagian samping ringkasan belanja untuk melihat pemotongan harga pasca-diskon beserta kalkulasi PPN 12%.
    - Klik **"Buat Pesanan"** (Saldo dompet Anda otomatis berkurang sesuai total tagihan). Status pesanan awal: `Sedang Dikemas`.
4.  **Proses Pesanan (Seller):**
    - Di pojok kanan atas (profile menu), ganti peran aktif Anda menjadi **Seller**.
    - Buka halaman dasbor Seller, cari pesanan baru tersebut di tabel "Pesanan Masuk".
    - Klik tombol **"Proses Pesanan"**. Status pesanan berpindah menjadi `Menunggu Pengirim`.
5.  **Pengantaran Pesanan (Driver):**
    - Ganti peran aktif Anda menjadi **Driver**.
    - Masuk ke halaman lowongan pekerjaan kurir aktif, cari pekerjaan pengiriman yang berstatus `AVAILABLE` sesuai pesanan tadi.
    - Klik tombol **"Ambil Pekerjaan"** (Status pesanan berpindah ke `Sedang Dikirim`).
    - Klik tombol **"Konfirmasi Selesai"** (Status pesanan berpindah ke `Pesanan Selesai`. Pendapatan tarif ongkir otomatis masuk ke saldo dompet driver).
6.  **Simulasi Waktu & Auto-Refund (Admin):**
    - Buat transaksi checkout pesanan baru sebagai Buyer, bayar hingga status pesanan menjadi `Sedang Dikemas`.
    - Ganti peran aktif menjadi **Admin**, buka panel kontrol Admin (`/admin`).
    - Klik tombol **"+1 Hari"** sebanyak beberapa kali untuk memajukan waktu sistem virtual melampaui batas SLA kurir yang Anda pilih.
    - Klik tombol **"Jalankan Cek Overdue"**.
    - Sistem akan otomatis mendeteksi keterlambatan pesanan tersebut, membatalkannya ke status `DIKEMBALIKAN`, mengembalikan stok barang, dan melakukan _refund_ saldo dompet Buyer Anda sebesar 100%.
