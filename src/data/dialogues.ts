import { DialogueLine } from '../types/game';

export const INTRO_DIALOGUES: DialogueLine[] = [
  {
    speaker: 'Aria (AI Navigator)',
    text: 'Halo Tim Penyelamat! Selamat datang di pusat kendali darurat Kota Data. Situasi kita saat ini sangat kritis.',
    expression: 'alert',
    characterImage: '/img/karakter-pendamping.jpg',
    backgroundImage: '/img/peta-kota.jpg',
  },
  {
    speaker: 'Aria (AI Navigator)',
    text: 'Kota Data kehilangan energi utama. Generator Perkalian rusak setelah terjadi lonjakan anomali sistem sub-stasiun.',
    expression: 'alert',
    characterImage: '/img/karakter-pendamping.jpg',
    backgroundImage: '/img/generator-perkalian.jpg',
  },
  {
    speaker: 'Aria (AI Navigator)',
    text: 'Generator Perkalian hanya dapat dinyalakan kembali jika kalian memahami hubungan mendasar antara perkalian berulang dan perpangkatan.',
    expression: 'thinking',
    characterImage: '/img/karakter-pendamping.jpg',
    backgroundImage: '/img/ilustrasi-preangkatan.jpg',
  },
  {
    speaker: 'Aria (AI Navigator)',
    text: 'Di dalam tim, bagi peran kalian secara cermat: Navigator, Penghitung, Pemeriksa, Pencatat, dan Penjelas. Diskusikan setiap langkah di lembar kerja sebelum memasukkan jawaban ke konsol.',
    expression: 'happy',
    characterImage: '/img/karakter-pendamping.jpg',
    backgroundImage: '/img/5-karakter-utama.jpg',
  },
  {
    speaker: 'Aria (AI Navigator)',
    text: 'Buka peta kota, pilih wilayah misi, dan pulihkan Fragmen Inti. Saya akan mendampingi dan menyediakan token petunjuk jika kalian menemui hambatan. Mari kita mulai!',
    expression: 'proud',
    characterImage: '/img/karakter-pendamping.jpg',
    backgroundImage: '/img/peta-kota.jpg',
  },
];
