export interface KnowledgeCard {
  id: string;
  episodeId: string;
  level?: string;
  emoji?: string;
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
    level: 'jelajah',
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
    level: 'peneliti',
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
    level: 'peneliti',
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
    level: 'master',
    title: 'Kartu Master: Inti Reaktor Eksponen',
    subtitle: 'Pemangkatan Bilangan Berpangkat & Sifat Campuran',
    topic: 'Sifat (aᵐ)ⁿ dan Penerapan',
    content:
      'Bila bilangan berpangkat dipangkatkan lagi, kalikan pangkatnya: (aᵐ)ⁿ = aᵐˣⁿ. Kombinasikan seluruh sifat perpangkatan untuk menyelesaikan analisis daya tingkat lanjut.',
    example: 'Contoh: (2³)² = 2³ˣ² = 2⁶ = 64.',
    unlockedAtRule: 'Selesaikan sektor Master Eksponen.',
  },
  {
    id: 'e1-card-cinta',
    episodeId: 'episode-1',
    level: 'cinta',
    emoji: '🕋',
    title: 'Syukur atas Keteraturan',
    subtitle: 'Refleksi Nilai Kehidupan',
    topic: 'Hikmah & Nilai Karakter',
    content:
      'QS. Al-Baqarah 261 menggambarkan pelipatgandaan pahala hingga 7 × 10² kali. Keteraturan pola inilah yang kita pelajari sebagai perpangkatan. Bagikan pemahamanmu kepada teman sebagai sedekah ilmu.',
    example: 'Kebaikan berlipat ganda: 1 butir benih menumbuhkan 7 tangkai, pada tiap tangkai ada 100 biji (7 × 10²).',
    unlockedAtRule: 'Tuntaskan seluruh Episode 1 untuk membuka kartu ini.',
  },
];

export const EPISODE_2_CARDS: KnowledgeCard[] = [
  {
    id: 'e2-card-nol',
    episodeId: 'episode-2',
    level: 'jelajah',
    emoji: '📘',
    title: 'Pangkat Nol & Pangkat Negatif',
    subtitle: 'Konsep Dasar Nilai Nol dan Kebalikan',
    topic: 'Definisi a⁰ & a⁻ⁿ',
    content: 'a⁰ = 1 untuk a ≠ 0, dan a⁻ⁿ = 1/aⁿ. Contoh: 5⁰ = 1 dan 2⁻³ = 1/8.',
    example: 'Contoh: 10⁰ = 1 dan 10⁻³ = 1/1000 = 0,001.',
    unlockedAtRule: 'Selesaikan sektor Pemulih Nol.',
  },
  {
    id: 'e2-card-ilmiah',
    episodeId: 'episode-2',
    level: 'peneliti',
    emoji: '📗',
    title: 'Notasi Ilmiah',
    subtitle: 'Bentuk Baku Bilangan Sangat Kecil & Besar',
    topic: 'Bentuk a × 10ⁿ',
    content:
      'Bilangan ditulis a × 10ⁿ dengan 1 ≤ a < 10. Contoh: 45.000.000 = 4,5 × 10⁷ dan 0,00032 = 3,2 × 10⁻⁴.',
    example: 'Contoh: 0,00000012 = 1,2 × 10⁻⁷.',
    unlockedAtRule: 'Selesaikan sektor Navigator Mikro.',
  },
  {
    id: 'e2-card-operasi',
    episodeId: 'episode-2',
    level: 'master',
    emoji: '📙',
    title: 'Operasi Notasi Ilmiah',
    subtitle: 'Perkalian & Pembagian Bentuk Baku',
    topic: 'Operasi Aljabar 10ⁿ',
    content: 'Saat dikalikan, pangkatnya dijumlahkan. Saat dibagi, pangkatnya dikurangkan.',
    example: 'Contoh: (2 × 10³) × (3 × 10⁴) = 6 × 10⁷.',
    unlockedAtRule: 'Selesaikan sektor Arsitek Kuantum.',
  },
  {
    id: 'e2-card-cinta',
    episodeId: 'episode-2',
    level: 'cinta',
    emoji: '🕋',
    title: 'Teliti pada Hal Kecil',
    subtitle: 'Refleksi Karakter & Ketekunan',
    topic: 'Hikmah & Nilai Karakter',
    content:
      'Bilangan yang sangat kecil pun memiliki nilai dan keteraturan. Rasulullah ﷺ mengajarkan bahwa amal yang paling dicintai Allah adalah yang dilakukan terus-menerus meskipun sedikit (HR. Bukhari dan Muslim). Ketelitian pada hal kecil adalah bagian dari belajar.',
    example: 'Ketelitian dalam detail mikro membentuk fondasi ilmu pengetahuan yang kokoh.',
    unlockedAtRule: 'Tuntaskan seluruh episode ini untuk membuka.',
  },
];

export const ALL_CARDS: KnowledgeCard[] = [...EPISODE_1_CARDS, ...EPISODE_2_CARDS];

export function getEpisodeCards(episodeId: string): KnowledgeCard[] {
  return ALL_CARDS.filter((card) => card.episodeId === episodeId);
}
