import { Question, Round, Player, QuestionCategory } from '@/types/game';

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    category: 'C1',
    type: 'true_false',
    question: 'Aset adalah sumber daya yang dikuasai oleh entitas sebagai akibat dari peristiwa masa lalu.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q2',
    category: 'C1',
    type: 'true_false',
    question: 'Liabilitas adalah hak residual atas aset entitas setelah dikurangi semua liabilitas.',
    correctAnswer: false,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q3',
    category: 'C2',
    type: 'true_false',
    question: 'Pendapatan diakui ketika terjadi peningkatan manfaat ekonomi.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q4',
    category: 'C2',
    type: 'true_false',
    question: 'Beban adalah penurunan manfaat ekonomi selama periode akuntansi.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q5',
    category: 'C3',
    type: 'true_false',
    question: 'Jurnal umum digunakan untuk mencatat transaksi secara kronologis.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q6',
    category: 'C3',
    type: 'true_false',
    question: 'Buku besar adalah kumpulan akun-akun yang saling berhubungan.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q7',
    category: 'C4',
    type: 'true_false',
    question: 'Neraca saldo disusun setelah posting ke buku besar.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q8',
    category: 'C4',
    type: 'true_false',
    question: 'Jurnal penyesuaian dibuat di awal periode akuntansi.',
    correctAnswer: false,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q9',
    category: 'C5',
    type: 'true_false',
    question: 'Laporan laba rugi menunjukkan posisi keuangan perusahaan.',
    correctAnswer: false,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q10',
    category: 'C5',
    type: 'true_false',
    question: 'Laporan arus kas terdiri dari tiga aktivitas: operasi, investasi, dan pendanaan.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q11',
    category: 'C6',
    type: 'true_false',
    question: 'Jurnal penutup dibuat untuk menutup akun nominal.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
  {
    id: 'q12',
    category: 'C6',
    type: 'true_false',
    question: 'Akun riil tidak perlu ditutup pada akhir periode.',
    correctAnswer: true,
    timeLimit: 30,
    points: 100,
  },
];

export const mockRounds: Round[] = [
  {
    id: 'round1',
    name: 'Babak 1 - Dasar Akuntansi',
    questionCounts: { C1: 2, C2: 2, C3: 2, C4: 0, C5: 0, C6: 0 },
    totalQuestions: 6,
  },
  {
    id: 'round2',
    name: 'Babak 2 - Siklus Akuntansi',
    questionCounts: { C1: 1, C2: 1, C3: 2, C4: 2, C5: 0, C6: 0 },
    totalQuestions: 6,
  },
  {
    id: 'round3',
    name: 'Babak 3 - Laporan Keuangan',
    questionCounts: { C1: 0, C2: 0, C3: 1, C4: 1, C5: 2, C6: 2 },
    totalQuestions: 6,
  },
];

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    name: 'Ahmad Rizki',
    score: 500,
    correctAnswers: 5,
    wrongAnswers: 1,
    roundId: 'round1',
    completedAt: new Date('2024-01-15'),
  },
  {
    id: 'p2',
    name: 'Siti Nurhaliza',
    score: 400,
    correctAnswers: 4,
    wrongAnswers: 2,
    roundId: 'round1',
    completedAt: new Date('2024-01-15'),
  },
  {
    id: 'p3',
    name: 'Budi Santoso',
    score: 300,
    correctAnswers: 3,
    wrongAnswers: 3,
    roundId: 'round2',
    completedAt: new Date('2024-01-14'),
  },
];

export const DEFAULT_ADMIN_PIN = '1234';

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  C1: 'Konsep Dasar',
  C2: 'Pengakuan',
  C3: 'Pencatatan',
  C4: 'Penyesuaian',
  C5: 'Pelaporan',
  C6: 'Penutupan',
};

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  C1: 'bg-blue-700',
  C2: 'bg-purple-700',
  C3: 'bg-primary',
  C4: 'bg-yellow-700',
  C5: 'bg-teal-700',
  C6: 'bg-red-700',
};
