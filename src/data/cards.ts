export interface KnowledgeCard {
  id: string;
  episodeId: string;
  title: string;
  subtitle: string;
  topic: string;
  content: string;
  example: string;
  unlockedAtRule: string;
}

export const EPISODE_1_CARDS: KnowledgeCard[] = [
  {
    id: 'e1-card-definisi',
    episodeId: 'episode-1',
    title: 'Kartu Konsep: Fondasi Eksponen',
    subtitle: 'Definisi Perkalian Berulang',
    topic: 'Definisi aⁿ',
    content:
      'Perpangkatan aⁿ adalah perkalian berulang dari bilangan basis a sebanyak n faktor: aⁿ = a × a × ... × a (sebanyak n kali).',
    example: 'Contoh: 2⁵ = 2 × 2 × 2 × 2 × 2 = 32.',
    unlockedAtRule: 'Selesaikan sektor Jelajah Pemula.',
  },
  {
    id: 'e1-card-perkalian',
    episodeId: 'episode-1',
    title: 'Kartu Sifat: Arus Perkalian',
    subtitle: 'Perkalian Basis Sama',
    topic: 'Sifat aᵐ × aⁿ',
    content:
      'Jika dua bilangan berpangkat dengan basis yang sama dikalikan, jumlahkan pangkatnya: aᵐ × aⁿ = aᵐ⁺ⁿ.',
    example: 'Contoh: 3² × 3⁴ = 3²⁺⁴ = 3⁶ = 729.',
    unlockedAtRule: 'Selesaikan sektor Peneliti Menengah.',
  },
  {
    id: 'e1-card-pembagian',
    episodeId: 'episode-1',
    title: 'Kartu Sifat: Aliran Pembagian',
    subtitle: 'Pembagian Basis Sama',
    topic: 'Sifat aᵐ / aⁿ',
    content:
      'Jika dua bilangan berpangkat dengan basis yang sama dibagi, kurangkan pangkatnya: aᵐ / aⁿ = aᵐ⁻ⁿ (dengan a ≠ 0).',
    example: 'Contoh: 5⁶ / 5² = 5⁶⁻² = 5⁴ = 625.',
    unlockedAtRule: 'Selesaikan sektor Peneliti Menengah.',
  },
  {
    id: 'e1-card-master',
    episodeId: 'episode-1',
    title: 'Kartu Master: Inti Reaktor Eksponen',
    subtitle: 'Pemangkatan Bilangan Berpangkat & Sifat Campuran',
    topic: 'Sifat (aᵐ)ⁿ dan Penerapan',
    content:
      'Bila bilangan berpangkat dipangkatkan lagi, kalikan pangkatnya: (aᵐ)ⁿ = aᵐˣⁿ. Kombinasikan seluruh sifat perpangkatan untuk menyelesaikan analisis daya tingkat lanjut.',
    example: 'Contoh: (2³)² = 2³ˣ² = 2⁶ = 64.',
    unlockedAtRule: 'Selesaikan sektor Master Eksponen.',
  },
];
