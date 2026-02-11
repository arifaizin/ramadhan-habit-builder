// Activity definitions with points
export const ACTIVITIES = [
  {
    id: 'ngaji',
    label: 'Ngaji (2 halaman mushaf Madinah)',
    points: 30,
    icon: '📖',
  },
  {
    id: 'sedekah',
    label: 'Sedekah (berapapun)',
    points: 15,
    icon: '💝',
  },
  {
    id: 'dzikir_pagi_petang',
    label: 'Dzikir pagi/petang',
    points: 10,
    icon: '🤲',
  },
  {
    id: 'tidak_tidur',
    label: 'Tidak tidur hingga matahari terbit',
    points: 10,
    icon: '🌅',
  },
  {
    id: 'dzikir_tidur',
    label: 'Dzikir sebelum tidur',
    points: 5,
    icon: '🌙',
  },
  {
    id: 'kebaikan',
    label: 'Berbuat kebaikan',
    points: 10,
    icon: '✨',
  },
] as const;

// Quiz points
export const QUIZ_POINTS = {
  correct: 10,
  wrong: 5,
  unanswered: 0,
} as const;

// Max daily points
export const MAX_DAILY_POINTS = 100;

// Streak bonuses (each can only be earned once per streak cycle)
export const STREAK_BONUSES = [
  { days: 3, points: 50, label: '3 hari berturut-turut' },
  { days: 7, points: 150, label: '7 hari berturut-turut' },
  { days: 14, points: 400, label: '14 hari berturut-turut' },
  { days: 21, points: 700, label: '21 hari berturut-turut' },
] as const;

// Level definitions
export const LEVELS = [
  {
    level: 1,
    name: 'Mulai Melangkah',
    points: 300,
    badge: '🌱',
    description: 'Starter',
  },
  {
    level: 2,
    name: 'Terjaga',
    points: 700,
    badge: '🕊️',
    description: 'Habit Builder',
  },
  {
    level: 3,
    name: 'Konsisten',
    points: 1500,
    badge: '🔥',
    description: 'Consistency Master',
  },
  {
    level: 4,
    name: 'Istiqomah',
    points: 2500,
    badge: '⭐',
    description: 'Istiqomah Lillah',
  },
  {
    level: 5,
    name: 'Perfect',
    points: 3500,
    badge: '👑',
    description: 'Perfect Achiever',
  },
] as const;

// Challenge period
export const CHALLENGE_START = '2026-02-18';
export const CHALLENGE_END = '2026-03-18';

// Sample quiz data (would come from backend in production)
export const SAMPLE_QUIZZES = [
  {
    day: 1,
    videoTitle: 'Kajian Ramadhan - Episode 1',
    videoUrl: 'https://youtube.com/playlist?list=PL0gi92PTPH63uLZqFJl3gjp1WOQP1kYRK',
    questions: [
      {
        id: 'q1',
        question: 'Apa hikmah utama berpuasa di bulan Ramadhan?',
        options: [
          'Untuk menahan lapar dan haus',
          'Untuk meningkatkan ketakwaan kepada Allah',
          'Untuk menurunkan berat badan',
          'Untuk menghemat makanan',
        ],
        correctIndex: 1,
      },
      {
        id: 'q2',
        question: 'Kapan waktu yang mustajab untuk berdoa saat puasa?',
        options: [
          'Saat sahur',
          'Saat berbuka',
          'Sebelum berbuka',
          'Semua waktu di atas',
        ],
        correctIndex: 3,
      },
    ],
  },
] as const;
