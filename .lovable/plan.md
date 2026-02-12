

# Kebutuhan Database dari PRD

## Kondisi Saat Ini
Semua data (user, check-in, quiz, streak, badge) disimpan di **localStorage** browser. Ini berarti data hilang jika user ganti device/browser, dan admin tidak bisa melihat data agregat.

## Tabel yang Perlu Dibuat di Supabase

### 1. `profiles`
Menyimpan data user yang terdaftar.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK, FK auth.users) | Link ke Supabase Auth |
| name | text | Nama peserta |
| email | text | Email peserta |
| community_code | text | Kode komunitas |
| created_at | timestamptz | Waktu registrasi |

### 2. `communities`
Daftar kode komunitas yang valid.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| code | text (unique) | Kode komunitas |
| name | text | Nama komunitas |
| created_at | timestamptz | |

### 3. `daily_checkins`
Centang aktivitas harian per user per hari.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| user_id | uuid (FK profiles) | |
| date | date | Tanggal check-in |
| activities_checked | text[] | Array ID aktivitas |
| activity_notes | jsonb | Catatan per aktivitas (opsional) |
| daily_score | integer | Skor hari itu (maks 100, belum termasuk quiz) |
| created_at | timestamptz | Waktu submit (untuk audit) |
| **UNIQUE(user_id, date)** | | Satu entry per user per hari |

### 4. `quiz_answers`
Jawaban quiz harian per user.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| user_id | uuid (FK profiles) | |
| date | date | Tanggal quiz |
| answers | jsonb | Array jawaban (questionId + selectedIndex) |
| quiz_score | integer | Skor quiz (maks 20) |
| created_at | timestamptz | |
| **UNIQUE(user_id, date)** | | Submit 1x per hari, tidak bisa diulang |

### 5. `quizzes`
Konten quiz harian (dikelola admin).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| quiz_date | date (unique) | Tanggal quiz ditampilkan |
| video_title | text | Judul kajian |
| video_url | text | Link video |
| questions | jsonb | Array soal (question, options, correctIndex) |
| created_at | timestamptz | |

### 6. `streaks`
Tracking streak per user.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| user_id | uuid (FK profiles, unique) | |
| current_streak | integer | Streak saat ini |
| last_checkin_date | date | Tanggal check-in terakhir |
| earned_bonuses | integer[] | Bonus yang sudah diklaim (3, 7, 14, 21) |

### 7. `badges`
Badge yang sudah diraih user.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| user_id | uuid (FK profiles) | |
| badge_name | text | Nama level/badge |
| unlocked_at | timestamptz | Waktu unlock |
| **UNIQUE(user_id, badge_name)** | | Tidak bisa duplikat |

### 8. `user_roles` (untuk Admin Dashboard)
Mengatur role admin vs user biasa.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | uuid (PK) | |
| user_id | uuid (FK auth.users) | |
| role | app_role enum | 'admin', 'user' |
| **UNIQUE(user_id, role)** | | |

## RLS (Row Level Security) yang Diperlukan

- **profiles**: User hanya bisa baca/update profil sendiri
- **daily_checkins**: User hanya bisa baca/insert/update data sendiri; insert diblokir jika tanggal lebih dari 2 hari lalu (backfill limit)
- **quiz_answers**: User hanya bisa baca/insert data sendiri; update diblokir (submit 1x)
- **quizzes**: Semua authenticated user bisa baca; hanya admin bisa insert/update
- **streaks**: User hanya bisa baca/update data sendiri
- **badges**: User hanya bisa baca data sendiri
- **communities**: Semua authenticated user bisa baca
- **user_roles**: Menggunakan security definer function `has_role()`

## Authentication

Menggunakan Supabase Auth dengan email/password. Trigger otomatis membuat row di `profiles` saat user register.

## Hal yang Perlu Diperhatikan

1. **Migrasi dari localStorage**: Perlu strategi transisi -- data lama di localStorage tidak otomatis pindah
2. **Validasi backfill 2 hari**: Diterapkan via RLS policy pada `daily_checkins`
3. **Challenge period lock**: Setelah 19 Maret, semua insert/update diblokir via RLS atau app logic
4. **Admin dashboard**: Menggunakan aggregate query (COUNT, SUM) per community_code -- tidak menampilkan data individu
5. **Quiz konten**: Perlu mekanisme admin untuk input quiz harian (bisa via Supabase dashboard atau admin UI)

## Urutan Implementasi

1. Buat tabel `communities` dan `profiles` + trigger auto-create profile
2. Buat `user_roles` + function `has_role()`
3. Implementasi Supabase Auth (register/login)
4. Buat tabel data (`daily_checkins`, `quiz_answers`, `quizzes`, `streaks`, `badges`)
5. Terapkan semua RLS policies
6. Migrasi logic dari localStorage ke Supabase client calls
7. Buat Admin Dashboard dengan aggregate queries

