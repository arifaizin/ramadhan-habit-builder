
# Fitur Check-in Hari Sebelumnya (Maks 2 Hari)

## Ringkasan
Menambahkan pemilih tanggal di atas daftar aktivitas sehingga pengguna bisa mengisi check-in untuk **hari ini, kemarin, dan 2 hari lalu**. Jika lupa mengisi, masih ada kesempatan untuk melengkapi dalam 2 hari.

## Cara Kerja
1. Di atas daftar aktivitas muncul **3 tombol tanggal**: 2 hari lalu, kemarin, dan hari ini
2. Tanggal yang sudah pernah diisi ditandai centang hijau dan terkunci (tidak bisa diubah)
3. Klik tanggal yang belum diisi untuk mencentang aktivitas dan menyimpan
4. Quiz harian hanya tersedia jika tanggal yang dipilih adalah **hari ini**
5. Setelah simpan, streak dihitung ulang berdasarkan semua data check-in

## Aturan
- Maksimal mundur 2 hari dari hari ini
- Tanggal yang sudah di-check-in terkunci
- Streak dihitung ulang secara menyeluruh setiap kali ada check-in baru
- Badge dan level tetap diperbarui berdasarkan total poin

---

## Detail Teknis

### 1. Komponen Baru: `src/components/DateSelector.tsx`
Membuat komponen berisi 3 tombol tanggal horizontal:

- Menampilkan **nama hari** (Sen, Sel, ...) dan **tanggal** (7, 8, 9)
- Hari ini diberi label "Hari Ini"
- Tanggal yang sudah di-check-in diberi ikon centang hijau
- Tanggal yang sedang dipilih di-highlight dengan warna primary
- Props: `selectedDate`, `onSelectDate`, `checkedDates` (array tanggal yang sudah terisi)

### 2. Perubahan di `src/lib/storage.ts`
Menambah 3 fungsi baru dan merefaktor streak:

- **`getCheckinForDate(userId, date)`** -- mengambil check-in untuk tanggal tertentu (generalisasi dari `getTodayCheckin`)
- **`getCheckedDates(userId)`** -- mengembalikan array tanggal-tanggal yang sudah ada check-in-nya
- **`recalculateStreak(userId)`** -- menggantikan `updateStreak`. Menghitung streak dengan cara:
  1. Ambil semua tanggal check-in user, urutkan dari terbaru
  2. Mulai dari hari ini, hitung mundur hari berturut-turut yang ada check-in-nya
  3. Hitung bonus streak yang sesuai
  4. Simpan ke storage dan kembalikan hasilnya

Fungsi `getTodayCheckin` tetap dipertahankan agar tidak ada breaking change, tapi Dashboard akan menggunakan `getCheckinForDate`.

### 3. Perubahan di `src/pages/Dashboard.tsx`
Perubahan utama pada halaman dashboard:

- Tambah state `selectedDate` (default: hari ini)
- Tambah state `checkedDates` (tanggal-tanggal yang sudah ada check-in)
- Import dan tampilkan komponen `DateSelector` di atas daftar aktivitas
- Ganti `hasCheckedInToday` menjadi `hasCheckedInSelected` -- cek apakah tanggal yang dipilih sudah punya check-in
- Saat tanggal berubah via `DateSelector`:
  - Muat check-in untuk tanggal tersebut (`getCheckinForDate`)
  - Update `checkedActivities` dan skor sesuai tanggal yang dipilih
  - Update `hasCheckedInSelected`
- Label "Aktivitas Hari Ini" berubah menjadi label dinamis, contoh: "Aktivitas - Senin, 7 Feb" jika bukan hari ini
- Skor card kiri menampilkan "Poin Hari Ini" atau "Poin [tanggal]" sesuai tanggal yang dipilih
- Saat simpan check-in: simpan ke `selectedDate` (bukan selalu hari ini), lalu panggil `recalculateStreak`
- Quiz harian (`DailyQuiz`) hanya di-render jika `selectedDate === getTodayDate()`
- Setelah check-in disimpan, update `checkedDates` agar tombol tanggal menampilkan centang

### 4. Tidak Ada Perubahan pada Komponen Lain
- `DailyQuiz`, `ActivityCard`, `StreakDisplay`, `LevelProgress`, `BadgeCollection` tidak perlu diubah

### Alur Pengguna

```text
Dashboard
  |
  +-- [ 2 hari lalu ] [ Kemarin ] [ Hari Ini ]
  |      (kosong)       (centang)   (terpilih)
  |
  +-- Poin: 0 (untuk tanggal terpilih)
  |
  +-- Streak: dihitung dari semua check-in
  |
  +-- "Aktivitas Hari Ini" (atau "Aktivitas - Sabtu, 7 Feb")
  |   - Daftar aktivitas (bisa dicentang jika belum check-in)
  |
  +-- [Simpan Check-in]
  |
  +-- Quiz (hanya muncul kalau tanggal = hari ini)
```

### File yang Diubah
| File | Perubahan |
|------|-----------|
| `src/components/DateSelector.tsx` | **Baru** -- komponen pemilih 3 tanggal |
| `src/lib/storage.ts` | Tambah `getCheckinForDate`, `getCheckedDates`, `recalculateStreak` |
| `src/pages/Dashboard.tsx` | Integrasi date selector, logika multi-tanggal |

### Edge Cases
- Check-in untuk 2 hari lalu setelah streak sudah reset: streak akan "pulih" jika mengisi gap
- Tanggal yang sudah di-check-in tidak bisa diedit ulang
- Tidak bisa check-in untuk masa depan
- Batas mundur tepat 2 hari, tidak lebih
