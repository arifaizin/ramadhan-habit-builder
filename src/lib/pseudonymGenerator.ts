const ADJECTIVES = [
    'Pejuang', 'Pencari', 'Cahaya', 'Bintang', 'Embun',
    'Gema', 'Lentera', 'Penjaga', 'Penyemai', 'Pemuda',
    'Mutiara', 'Sahabat', 'Hamba', 'Pecinta', 'Sinar',
    'Tunas', 'Langkah', 'Zikir', 'Doa', 'Iman'
];

const NOUNS = [
    'Ikhlas', 'Taqwa', 'Ramadhan', 'Pahala', 'Surga',
    'Kebaikan', 'Sabar', 'Syukur', 'Hidayah', 'Berkah',
    'Mulia', 'Sholeh', 'Istiqomah', 'Sunnah', 'Umat',
    'Langit', 'Fajar', 'Senja', 'Rahmat', 'Cinta'
];

export function generatePseudonym(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const suffix = Math.floor(Math.random() * 999).toString().padStart(3, '0');

    return `${adj} ${noun} ${suffix}`;
}
