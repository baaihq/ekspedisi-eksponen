import { DifficultyLevel, LevelInfo, QuestionData } from '../types/game';
import { GAME_LEVELS } from './levels';
import { generateQuestionsForLevel } from './questions';

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
    isActive: false, // Segera
    levels: [],
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

export function generateQuestionsForEpisode(
  episodeId: string,
  level: DifficultyLevel,
  seed: number
): QuestionData[] {
  // Episode selain Episode 1 belum aktif dan tidak memiliki soal
  if (episodeId !== 'episode-1') {
    return [];
  }
  // Episode 1 menggunakan generator modul bab 1
  return generateQuestionsForLevel(level, seed);
}


