

# Update Milestone Level

## Perubahan
Update array `LEVELS` di `src/lib/constants.ts`:

- Level 1: Mulai Melangkah -- **300 poin** (tetap)
- Level 2: Terjaga -- **700 poin** (tetap)
- Level 3: Konsisten -- **1.500 poin** (dari 1.200)
- Level 4: Istiqomah -- **2.500 poin** (dari 1.600)
- Level 5: **Perfect** -- **3.500 poin** (baru)

## Detail Teknis

### File: `src/lib/constants.ts`
Update array `LEVELS` (baris 60-89):
- Ubah poin Level 3 dari 1200 menjadi 1500
- Ubah poin Level 4 dari 1600 menjadi 2500
- Tambah Level 5 dengan poin 3500, nama dan badge baru

Tidak ada perubahan di file lain karena semua komponen (`LevelProgress`, `BadgeCollection`, `storage.ts`) sudah membaca dari array `LEVELS` secara dinamis.

