import { DifficultyLevel, LevelInfo, QuestionData } from '../types/game';
import { GAME_LEVELS } from './levels';
import { generateQuestionsForLevel } from './questions';
import { generateEpisode2Questions } from './questionsEpisode2';

export interface EpisodeInfo {
  id: string;
  episodeNumber: number;
  title: string;
  theme: string;
  curriculumTopic: string;
  description: string;
  isActive: boolean;
  levels: LevelInfo[];
}

export const EPISODE_2_LEVELS: LevelInfo[] = [
  {
    id: 'jelajah',
    title: 'Pemulih Nol',
    subtitle: 'Pangkat Nol & Pangkat Bulat Negatif',
    icon: '🌱',
    badge: 'Tingkat 1',
    description: 'Selidiki fenomena nilai pangkat nol dan ubah bilangan berpangkat bulat negatif menjadi pecahan dalam terowongan bawah tanah Kota Data.',
    targetObjective: 'Memulihkan sensor awal transmisi daya mikroskopis dengan memahami konsep pangkat nol dan bulat negatif.',
    estimatedMinutes: 10,
    totalQuestions: 6,
    pointsPerQuestion: 150,
    penaltyPerWrong: 40,
  },
  {
    id: 'peneliti',
    title: 'Navigator Mikro',
    subtitle: 'Notasi Ilmiah & Bilangan Sangat Kecil',
    icon: '🔬',
    badge: 'Tingkat 2',
    description: 'Navigasi transmisi data mikroskopis dengan mengonversi ukuran nanopartikel ke dalam bentuk baku notasi ilmiah a × 10ⁿ.',
    targetObjective: 'Menstabilkan jaringan navigasi dari serangan mikrovirus berukuran sangat kecil menggunakan notasi ilmiah.',
    estimatedMinutes: 15,
    totalQuestions: 6,
    pointsPerQuestion: 250,
    penaltyPerWrong: 60,
  },
  {
    id: 'master',
    title: 'Arsitek Kuantum',
    subtitle: 'Penerapan Kontekstual & Operasi Campuran',
    icon: '🏆',
    badge: 'Tingkat 3',
    description: 'Lakukan operasi aljabar campuran notasi ilmiah dan analisis kontekstual skala kuantum dalam batas waktu tantangan.',
    targetObjective: 'Merekonstruksi arsitektur kuantum sektor mikro untuk membersihkan ancaman anomali data secara permanen.',
    estimatedMinutes: 20,
    totalQuestions: 6,
    pointsPerQuestion: 350,
    penaltyPerWrong: 80,
    timerSeconds: 90,
  },
];

export const EPISODES: EpisodeInfo[] = [
  {
    id: 'episode-1',
    episodeNumber: 1,
    title: 'Menyelamatkan Kota Data',
    theme: 'Desa Generator & Transmisi Jaringan',
    curriculumTopic: 'P1: Definisi & Konsep Dasar + P2: Sifat-Sifat Perpangkatan',
    description: 'Bantu tim ekspedisi memulihkan Generator Perkalian yang kehilangan stabilitas daya dengan menguasai konsep dan sifat-sifat perpangkatan.',
    isActive: true,
    levels: GAME_LEVELS,
  },
  {
    id: 'episode-2',
    episodeNumber: 2,
    title: 'Serangan Mikro',
    theme: 'Terowongan Bayangan & Nanopartikel',
    curriculumTopic: 'P3: Pangkat Nol, Bulat Negatif & Notasi Ilmiah',
    description: 'Selidiki fluktuasi sub-atomik mikroskopis pada terowongan bawah tanah Kota Data menggunakan pangkat negatif dan notasi ilmiah.',
    isActive: true,
    levels: EPISODE_2_LEVELS,
  },
  {
    id: 'episode-3',
    episodeNumber: 3,
    title: 'Bahasa Akar',
    theme: 'Kepulauan Pecahan & Laboratorium Kristal',
    curriculumTopic: 'P4: Pangkat Pecahan + P5: Operasi Bentuk Akar & Rasionalisasi',
    description: 'Pecahkan kode resonansi kristal energi dan sederhanakan bentuk akar fraksional untuk membuka jembatan antar-pulau data.',
    isActive: false, // Segera
    levels: [],
  },
  {
    id: 'episode-4',
    episodeNumber: 4,
    title: 'Gerbang Inti',
    theme: 'Pusat Reaktor Utama Kota Data',
    curriculumTopic: 'P6: Penerapan Kontekstual & Asesmen Bab Eksponen',
    description: 'Satukan seluruh fragmen inti dan kalibrasikan sistem kecerdasan Kota Data melalui asesmen komprehensif bab perpangkatan.',
    isActive: false, // Segera
    levels: [],
  },
];

export function getEpisode(id: string): EpisodeInfo | undefined {
  return EPISODES.find((ep) => ep.id === id) || EPISODES[0];
}

export function getEpisodeLevels(episodeId: string): LevelInfo[] {
  const ep = EPISODES.find((e) => e.id === episodeId);
  return ep ? ep.levels : [];
}

export function generateQuestionsForEpisode(
  episodeId: string,
  level: DifficultyLevel,
  seed: number
): QuestionData[] {
  if (episodeId === 'episode-2') {
    return generateEpisode2Questions(level, seed);
  }
  if (episodeId === 'episode-1') {
    return generateQuestionsForLevel(level, seed);
  }
  return [];
}


