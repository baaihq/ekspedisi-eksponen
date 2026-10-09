import { DifficultyLevel, QuestionData } from '../types/game';
import { DeterministicRandom } from '../lib/seed';
import { toSuperscript } from '../lib/superscript';

/**
 * Generator soal dinamis untuk Episode 2: Serangan Mikro
 * (Pangkat Nol, Pangkat Bulat Negatif, dan Notasi Ilmiah).
 */
export function generateEpisode2Questions(level: DifficultyLevel, seed: number): QuestionData[] {
  const rng = new DeterministicRandom(seed + getLevelOffset(level));

  switch (level) {
    case 'jelajah':
      return generateJelajahQuestionsE2(rng);
    case 'peneliti':
      return generatePenelitiQuestionsE2(rng);
    case 'master':
      return generateMasterQuestionsE2(rng);
  }
}

function getLevelOffset(level: DifficultyLevel): number {
  if (level === 'jelajah') return 10000;
  if (level === 'peneliti') return 20000;
  return 30000;
}

/**
 * Menghasilkan berbagai variasi penulisan yang sah untuk notasi ilmiah:
 * - Titik dan koma desimal (4.5 dan 4,5)
 * - Simbol perkalian (×, x, *, ·)
 * - Dengan spasi dan tanpa spasi
 * - Pangkat caret biasa dan kurung kurawal (10^e, 10^{e})
 * - Pangkat superscript (10⁷)
 * - Notasi E (4.5e7, 4,5e7)
 */
function generateSciNotationAnswers(m: number | string, exp: number): string[] {
  const mNum = typeof m === 'number' ? m : parseFloat(String(m).replace(',', '.'));
  const mDot = String(mNum);
  const mComma = mDot.replace('.', ',');
  const expStr = String(exp);
  const expSuper = toSuperscript(expStr);

  const variations = new Set<string>();
  const mVariants = mDot === mComma ? [mDot] : [mDot, mComma];
  const operators = ['×', 'x', '*', '·'];

  for (const mv of mVariants) {
    // E-notation (4.5e7, 4,5e7)
    variations.add(`${mv}e${expStr}`);
    variations.add(`${mv}E${expStr}`);
    if (exp > 0) {
      variations.add(`${mv}e+${expStr}`);
      variations.add(`${mv}E+${expStr}`);
    }

    for (const op of operators) {
      // Dengan spasi: 4,5 × 10^7
      variations.add(`${mv} ${op} 10^${expStr}`);
      variations.add(`${mv} ${op} 10^{${expStr}}`);
      variations.add(`${mv} ${op} 10^(${expStr})`);
      variations.add(`${mv} ${op} 10${expSuper}`);

      // Tanpa spasi: 4,5×10^7
      variations.add(`${mv}${op}10^${expStr}`);
      variations.add(`${mv}${op}10^{${expStr}}`);
      variations.add(`${mv}${op}10^(${expStr})`);
      variations.add(`${mv}${op}10${expSuper}`);

      // Kata 'pangkat'
      variations.add(`${mv} ${op} 10 pangkat ${expStr}`);
      variations.add(`${mv}${op}10 pangkat ${expStr}`);
    }
  }

  return Array.from(variations);
}

// ==============================================================================
// 1. TINGKAT 1 — PEMULIH NOL (6 soal, tanpa timer)
// ==============================================================================
function generateJelajahQuestionsE2(rng: DeterministicRandom): QuestionData[] {
  // Soal 1: a⁰ dengan a ∈ {5,6,7,8,9} -> 1
  const a1 = rng.pick([5, 6, 7, 8, 9]);

  // Soal 2: a⁻ⁿ dengan a ∈ {2,3}, n ∈ {2,3,4} -> 1/aⁿ
  const a2 = rng.pick([2, 3]);
  const n2 = a2 === 2 ? rng.pick([2, 3, 4]) : rng.pick([2, 3]);
  const val2 = Math.pow(a2, n2);
  const fracDecimal2 = 1 / val2;

  // Soal 3: tulis 1/N sebagai pangkat, N = aⁿ dengan a ∈ {3,4,5}, n ∈ {2,3} -> a⁻ⁿ
  const a3 = rng.pick([3, 4, 5]);
  const n3 = a3 === 5 ? 2 : rng.pick([2, 3]);
  const val3 = Math.pow(a3, n3);

  // Soal 4: a⁻ᵐ × aⁿ dengan a ∈ {2,3,5}, m ∈ {2,3}, n ∈ {3,4}, n > m -> aⁿ⁻ᵐ
  const a4 = rng.pick([2, 3, 5]);
  const m4 = rng.pick([2, 3]);
  const n4 = m4 + rng.pick([1, 2]);
  const diffExp4 = n4 - m4;

  // Soal 5: (1/b)⁻² dengan b ∈ {2,3,4} -> b²
  const b5 = rng.pick([2, 3, 4]);
  const val5 = Math.pow(b5, 2);

  // Soal 6: teknisi menulis a⁰ = 0 untuk a ∈ {4,6,7,8}; tentukan nilai yang benar -> 1
  const a6 = rng.pick([4, 6, 7, 8]);

  return [
    {
      id: 'e2_jelajah_q1',
      level: 'jelajah',
      type: 'numeric_value',
      title: 'Tantangan 1: Nilai Daya Pangkat Nol',
      instruction: 'Hitung nilai daya terminal yang beroperasi pada frekuensi pangkat nol berikut.',
      latexProblem: `${a1}^{0} = \\dots`,
      expectedNumericValue: 1,
      allowNumericEquivalent: true,
      acceptableAnswers: ['1', `${a1}^0`, `${a1}^{0}`, `${a1} pangkat 0`],
      hint: 'Setiap bilangan real bukan nol yang dipangkatkan 0 selalu bernilai 1: a^0 = 1.',
      explanation: `Berdasarkan sifat eksponen, bilangan ${a1} dipangkatkan 0 selalu bernilai 1.`,
    },
    {
      id: 'e2_jelajah_q2',
      level: 'jelajah',
      type: 'numeric_value',
      title: 'Tantangan 2: Konversi Pangkat Bulat Negatif',
      instruction: 'Hitung nilai fraksional dari sinyal transmisi berpangkat bulat negatif berikut.',
      latexProblem: `${a2}^{-${n2}} = \\dots`,
      expectedNumericValue: fracDecimal2,
      allowNumericEquivalent: true,
      acceptableAnswers: [
        `1/${val2}`,
        `1 / ${val2}`,
        String(fracDecimal2),
        String(fracDecimal2).replace('.', ','),
        `${a2}^-${n2}`,
        `${a2}^{-${n2}}`,
      ],
      hint: 'Bilangan berpangkat bulat negatif diubah menjadi pecahan: a^-n = 1/a^n.',
      explanation: `Nilai dari ${a2}^-${n2} adalah 1/${a2}^${n2} = 1/${val2}.`,
    },
    {
      id: 'e2_jelajah_q3',
      level: 'jelajah',
      type: 'exponent_form',
      title: 'Tantangan 3: Menulis Pecahan ke Pangkat Negatif',
      instruction: 'Tuliskan bentuk pecahan penyusutan daya berikut ke dalam bentuk perpangkatan basis tunggal.',
      latexProblem: `\\frac{1}{${val3}} = \\dots`,
      expectedExponentForm: `${a3}^-${n3}`,
      acceptableAnswers: [
        `${a3}^-${n3}`,
        `${a3}^{-${n3}}`,
        `${a3}^(-${n3})`,
        `${a3} pangkat -${n3}`,
      ],
      hint: 'Pecahan 1/a^n dapat ditulis kembali sebagai bentuk pangkat negatif a^-n.',
      explanation: `Pecahan 1/${val3} = 1/${a3}^${n3} senilai dengan ${a3}^-${n3}.`,
    },
    {
      id: 'e2_jelajah_q4',
      level: 'jelajah',
      type: 'mixed',
      title: 'Tantangan 4: Perkalian Eksponen Berpangkat Negatif',
      instruction: 'Sederhanakan perkalian dua sinyal transmisi dengan basis yang sama berikut.',
      latexProblem: `${a4}^{-${m4}} \\times ${a4}^{${n4}} = \\dots`,
      allowNumericEquivalent: true,
      expectedExponentForm: `${a4}^${diffExp4}`,
      acceptableAnswers: [
        `${a4}^${diffExp4}`,
        `${a4}^{${diffExp4}}`,
        `${a4}^(${diffExp4})`,
        `${a4} pangkat ${diffExp4}`,
        ...(diffExp4 === 1 ? [String(a4)] : []),
      ],
      hint: 'Gunakan sifat perkalian basis sama: a^p × a^q = a^(p+q). Jumlahkan eksponennya.',
      explanation: `Hasil penyederhanaan adalah ${a4}^(-${m4}+${n4}) = ${a4}^${diffExp4}.`,
    },
    {
      id: 'e2_jelajah_q5',
      level: 'jelajah',
      type: 'numeric_value',
      title: 'Tantangan 5: Pangkat Negatif pada Pecahan',
      instruction: 'Hitung nilai daya terminal yang memiliki pecahan berpangkat negatif berikut.',
      latexProblem: `\\left(\\frac{1}{${b5}}\\right)^{-2} = \\dots`,
      expectedNumericValue: val5,
      allowNumericEquivalent: true,
      acceptableAnswers: [String(val5), `${b5}^2`, `${b5}^{2}`, `${b5} pangkat 2`],
      hint: 'Gunakan sifat pecahan berpangkat negatif: (1/b)^-n = b^n.',
      explanation: `Bentuk (1/${b5})^-2 dibalik menjadi ${b5}^2 = ${val5}.`,
    },
    {
      id: 'e2_jelajah_q6',
      level: 'jelajah',
      type: 'conceptual_error',
      title: 'Tantangan 6: Koreksi Kesalahan Pangkat Nol',
      instruction: `Seorang teknisi mencatat bahwa ${a6}^0 = 0. Tentukan nilai yang benar.`,
      latexProblem: `${a6}^{0} = \\dots`,
      expectedNumericValue: 1,
      allowNumericEquivalent: true,
      acceptableAnswers: ['1', `${a6}^0`, `${a6}^{0}`, `${a6} pangkat 0`],
      hint: 'Ingat kembali definisi pangkat nol: untuk bilangan a ≠ 0, nilai a^0 bukanlah 0 melainkan 1.',
      explanation: `Catatan teknisi keliru karena bilangan ${a6} dipangkatkan 0 menghasilkan 1, bukan 0.`,
    },
  ];
}

// ==============================================================================
// 2. TINGKAT 2 — NAVIGATOR MIKRO (6 soal, tanpa timer)
// ==============================================================================
function generatePenelitiQuestionsE2(rng: DeterministicRandom): QuestionData[] {
  // Soal 1: Bilangan besar (m ∈ {2.5, 3.5, 4.5}, e ∈ {6, 7, 8}) -> notasi ilmiah
  const m1 = rng.pick([2.5, 3.5, 4.5]);
  const e1 = rng.pick([6, 7, 8]);
  const val1 = m1 * Math.pow(10, e1);
  const formattedVal1 = val1.toLocaleString('id-ID');

  // Soal 2: Bilangan kecil (m ∈ {2.5, 3.2, 4.5}, e ∈ {5, 6, 7}) -> notasi ilmiah
  const m2 = rng.pick([2.5, 3.2, 4.5]);
  const e2 = rng.pick([5, 6, 7]);
  const zeroCount2 = e2 - 1;
  const digits2 = String(m2).replace('.', '');
  const formattedDec2 = `0,${'0'.repeat(zeroCount2)}${digits2}`;
  const katexDec2 = `0{,}${ '0'.repeat(zeroCount2) }${digits2}`;

  // Soal 3: Perkalian notasi ilmiah (m1 × 10^a) × (m2 × 10^b) dengan m1 × m2 < 10
  const m3a = rng.pick([2, 3]);
  const m3b = m3a === 3 ? 2 : rng.pick([2, 3]); // m3a * m3b in {4, 6}
  const a3 = rng.pick([3, 4, 5]);
  const b3 = rng.pick([2, 3, 4]);
  const prodM3 = m3a * m3b;
  const sumExp3 = a3 + b3;

  // Soal 4: Pembagian notasi ilmiah rapi
  const divM4 = rng.pick([2, 3]);
  const k4 = rng.pick([2, 3, 4]);
  const m4 = divM4 * k4;
  const a4 = rng.pick([6, 7, 8]);
  const b4 = rng.pick([2, 3, 4]);
  const diffExp4 = a4 - b4;

  // Soal 5: Pemangkatan notasi ilmiah (m × 10^a)²
  const m5 = rng.pick([2, 3]);
  const a5 = rng.pick([2, 3]);
  const mSq5 = m5 * m5;
  const expSq5 = a5 * 2;
  const totalVal5 = mSq5 * Math.pow(10, expSq5);

  // Soal 6: Bilangan kecil lain (mis. 0,00045 -> 4,5 × 10⁻⁴)
  const m6 = rng.pick([1.5, 4.5, 7.5]);
  const e6 = rng.pick([3, 4, 5]);
  const zeroCount6 = e6 - 1;
  const digits6 = String(m6).replace('.', '');
  const formattedDec6 = `0,${'0'.repeat(zeroCount6)}${digits6}`;
  const katexDec6 = `0{,}${ '0'.repeat(zeroCount6) }${digits6}`;

  return [
    {
      id: 'e2_peneliti_q1',
      level: 'peneliti',
      type: 'sensor_mission',
      title: 'Tantangan 1: Notasi Ilmiah Data Transmisi Besar',
      instruction: `Tuliskan jumlah paket data transmisi sebesar ${formattedVal1} ke dalam bentuk baku notasi ilmiah.`,
      latexProblem: `${formattedVal1.replace(/\./g, '{,}')} = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(m1, e1),
      hint: 'Bentuk baku ditulis a × 10^n dengan 1 ≤ a < 10. Geser koma hingga tersisa 1 angka di depan.',
      explanation: `Geser koma sebanyak ${e1} tempat ke kiri menghasilkan ${String(m1).replace('.', ',')} × 10^${e1}.`,
    },
    {
      id: 'e2_peneliti_q2',
      level: 'peneliti',
      type: 'sensor_mission',
      title: 'Tantangan 2: Notasi Ilmiah Ukuran Nanopartikel',
      instruction: `Tuliskan ukuran diameter partikel debu mikro sebesar ${formattedDec2} ke dalam notasi ilmiah.`,
      latexProblem: `${katexDec2} = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(m2, -e2),
      hint: 'Geser koma ke kanan hingga diperoleh bilangan antara 1 dan 10, lalu gunakan pangkat negatif 10^-n.',
      explanation: `Koma digeser ke kanan sebanyak ${e2} langkah menghasilkan ${String(m2).replace('.', ',')} × 10^-${e2}.`,
    },
    {
      id: 'e2_peneliti_q3',
      level: 'peneliti',
      type: 'mixed',
      title: 'Tantangan 3: Perkalian Bilangan Notasi Ilmiah',
      instruction: 'Selesaikan perkalian dua ukuran data berikut dan nyatakan hasilnya dalam notasi ilmiah.',
      latexProblem: `(${m3a} \\times 10^{${a3}}) \\times (${m3b} \\times 10^{${b3}}) = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(prodM3, sumExp3),
      hint: 'Kalikan koefisien m1 × m2, lalu kalikan basis 10 dengan menjumlahkan pangkatnya: 10^(a+b).',
      explanation: `(${m3a} × ${m3b}) × 10^(${a3}+${b3}) = ${prodM3} × 10^${sumExp3}.`,
    },
    {
      id: 'e2_peneliti_q4',
      level: 'peneliti',
      type: 'mixed',
      title: 'Tantangan 4: Pembagian Bilangan Notasi Ilmiah',
      instruction: 'Selesaikan pembagian nilai intensitas sensor berikut dan nyatakan hasilnya dalam notasi ilmiah.',
      latexProblem: `\\frac{${m4} \\times 10^{${a4}}}{${divM4} \\times 10^{${b4}}} = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(k4, diffExp4),
      hint: 'Bagikan koefisien m1 / m2, lalu kurangkan pangkat dari basis 10: 10^(a-b).',
      explanation: `(${m4} / ${divM4}) × 10^(${a4}-${b4}) = ${k4} × 10^${diffExp4}.`,
    },
    {
      id: 'e2_peneliti_q5',
      level: 'peneliti',
      type: 'numeric_value',
      title: 'Tantangan 5: Pemangkatan Notasi Ilmiah',
      instruction: 'Hitung nilai daya transmisi dari pemangkatan notasi ilmiah berikut.',
      latexProblem: `(${m5} \\times 10^{${a5}})^2 = \\dots`,
      expectedNumericValue: totalVal5,
      allowNumericEquivalent: true,
      acceptableAnswers: [...generateSciNotationAnswers(mSq5, expSq5), String(totalVal5)],
      hint: 'Kuadratkan koefisien m^2 dan kalikan eksponennya: (10^a)^2 = 10^(2a).',
      explanation: `(${m5})^2 × 10^(${a5}×2) = ${mSq5} × 10^${expSq5} = ${totalVal5}.`,
    },
    {
      id: 'e2_peneliti_q6',
      level: 'peneliti',
      type: 'sensor_mission',
      title: 'Tantangan 6: Bentuk Baku Ukuran Gelombang Mikro',
      instruction: `Nyatakan panjang gelombang mikro sebesar ${formattedDec6} dalam notasi ilmiah bentuk baku.`,
      latexProblem: `${katexDec6} = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(m6, -e6),
      hint: 'Bentuk baku a × 10^-n diperoleh dengan menggeser tanda koma ke kanan hingga 1 ≤ a < 10.',
      explanation: `Geser koma sebanyak ${e6} tempat ke kanan menghasilkan ${String(m6).replace('.', ',')} × 10^-${e6}.`,
    },
  ];
}

// ==============================================================================
// 3. TINGKAT 3 — ARSITEK KUANTUM (6 soal, timerSeconds 90)
// ==============================================================================
function generateMasterQuestionsE2(rng: DeterministicRandom): QuestionData[] {
  // Soal 1: massa satu virus m × 10⁻⁹ kg, jumlah n × 10⁶ virus
  // Pasangan terpilih yang menghasilkan m × n < 10
  const virusPair = rng.pick([
    { m: 1.2, n: 5.0, prod: 6.0 },
    { m: 2.4, n: 2.5, prod: 6.0 },
    { m: 1.2, n: 4.0, prod: 4.8 },
    { m: 2.4, n: 4.0, prod: 9.6 },
  ]);
  const m1 = virusPair.m;
  const n1 = virusPair.n;
  const prod1 = virusPair.prod;

  // Soal 2: jarak d × 10⁸ m dibagi kecepatan cahaya 3 × 10⁸ m/s, d ∈ {3.84, 6.0}
  const d2 = rng.pick([3.84, 6.0]);
  const t2 = d2 / 3;

  // Soal 3: ukuran berkas m × 10⁶ byte dikali n × 10³ berkas; nyatakan dalam GB (1 GB = 10⁹ byte)
  const m3 = rng.pick([2, 4, 5]);
  const n3 = rng.pick([2, 4, 5]);
  const gbVal3 = m3 * n3;

  // Soal 4: teknisi menulis 4,5 × 10⁻³ = 0,045; tentukan nilai yang benar (0,0045)
  // (tetap 0,0045)

  // Soal 5: (a⁻² × a⁰) ÷ a⁻³ dengan a ∈ {2,3,5} -> a
  const a5 = rng.pick([2, 3, 5]);

  // Soal 6: tulis 0,0000000042 ke notasi ilmiah -> 4,2 × 10⁻⁹
  const m6 = rng.pick([4.2, 3.6, 5.4]);
  const digits6 = String(m6).replace('.', '');
  const katexDec6 = `0{,}${ '0'.repeat(8) }${digits6}`;

  return [
    {
      id: 'e2_master_q1',
      level: 'master',
      type: 'sensor_mission',
      title: 'Tantangan 1: Kalkulasi Massa Total Mikrovirus',
      instruction: `Massa satu partikel mikrovirus adalah ${String(m1).replace('.', ',')} × 10^-9 kg. Jika terdeteksi ${String(n1).replace('.', ',')} × 10^6 partikel, hitung total massa dalam kg (dalam notasi ilmiah).`,
      latexProblem: `(${String(m1).replace('.', ',')} \\times 10^{-9}) \\times (${String(n1).replace('.', ',')} \\times 10^{6}) = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(prod1, -3),
      hint: 'Kalikan massa per partikel dengan jumlah partikel: (m × n) × 10^(-9+6).',
      explanation: `Total massa = (${String(m1).replace('.', ',')} × ${String(n1).replace('.', ',')}) × 10^(-9+6) = ${String(prod1).replace('.', ',')} × 10^-3 kg.`,
    },
    {
      id: 'e2_master_q2',
      level: 'master',
      type: 'numeric_value',
      title: 'Tantangan 2: Waktu Tempuh Transmisi Cahaya Kuantum',
      instruction: `Hitung waktu tempuh sinyal laser (dalam detik) jika jarak tempuh ${String(d2).replace('.', ',')} × 10^8 m dibagi kecepatan cahaya c = 3 × 10^8 m/s.`,
      latexProblem: `t = \\frac{${String(d2).replace('.', ',')} \\times 10^{8}}{3 \\times 10^{8}} = \\dots`,
      expectedNumericValue: t2,
      allowNumericEquivalent: true,
      acceptableAnswers:
        t2 === 2
          ? ['2', '2.0', '2,0', '2 s', '2 detik']
          : ['1.28', '1,28', '1.28 s', '1,28 s', '1.28 detik', '1,28 detik', '32/25'],
      hint: 'Eksponen 10^8 pada pembilang dan penyebut saling membagi habis (10^8 / 10^8 = 1), cukup bagi d dengan 3.',
      explanation: `Waktu tempuh adalah ${String(d2).replace('.', ',')} / 3 = ${String(t2).replace('.', ',')} detik.`,
    },
    {
      id: 'e2_master_q3',
      level: 'master',
      type: 'sensor_mission',
      title: 'Tantangan 3: Konversi Kapasitas Data Kuantum ke GB',
      instruction: `Sistem menyimpan ${n3} × 10^3 berkas yang masing-masing berukuran ${m3} × 10^6 byte. Nyatakan total kapasitas dalam Gigabyte (1 GB = 10^9 byte).`,
      latexProblem: `\\frac{(${m3} \\times 10^{6}) \\times (${n3} \\times 10^{3})}{10^{9}} = \\dots`,
      expectedNumericValue: gbVal3,
      allowNumericEquivalent: true,
      acceptableAnswers: [String(gbVal3), `${gbVal3} GB`, `${gbVal3}GB`, `${gbVal3} gigabyte`],
      hint: 'Total byte adalah (m × n) × 10^9 byte. Karena 1 GB = 10^9 byte, bagikan total byte dengan 10^9.',
      explanation: `(${m3} × ${n3}) × 10^9 / 10^9 = ${gbVal3} GB.`,
    },
    {
      id: 'e2_master_q4',
      level: 'master',
      type: 'conceptual_error',
      title: 'Tantangan 4: Koreksi Desimal Notasi Ilmiah Negatif',
      instruction: 'Seorang teknisi menulis 4,5 × 10^-3 = 0,045. Tuliskan nilai desimal yang benar.',
      latexProblem: `4{,}5 \\times 10^{-3} = \\dots`,
      expectedNumericValue: 0.0045,
      allowNumericEquivalent: true,
      acceptableAnswers: [
        '0.0045',
        '0,0045',
        '4.5e-3',
        '4,5e-3',
        '4.5 x 10^-3',
        '4,5 x 10^-3',
        '4.5 × 10^-3',
        '4,5 × 10^-3',
        '9/2000',
      ],
      hint: 'Eksponen 10^-3 berarti memindahkan koma 3 tempat ke kiri dari 4,5.',
      explanation: 'Memindahkan tanda koma 3 tempat ke kiri dari 4,5 menghasilkan 0,0045 (bukan 0,045 yang hanya 2 tempat).',
    },
    {
      id: 'e2_master_q5',
      level: 'master',
      type: 'numeric_value',
      title: 'Tantangan 5: Operasi Campuran Eksponen Sub-Atomik',
      instruction: 'Hitung nilai akhir dari penyederhanaan ekspresi eksponen daya berikut.',
      latexProblem: `\\frac{${a5}^{-2} \\times ${a5}^{0}}{${a5}^{-3}} = \\dots`,
      expectedNumericValue: a5,
      allowNumericEquivalent: true,
      acceptableAnswers: [String(a5), `${a5}^1`, `${a5}^{1}`, `${a5} pangkat 1`],
      hint: 'Gunakan sifat eksponen: pada pembilang tambahkan pangkat (-2 + 0), lalu kurangkan dengan pangkat penyebut -(-3).',
      explanation: `Pangkat akhir adalah -2 + 0 - (-3) = 1, sehingga nilainya adalah ${a5}^1 = ${a5}.`,
    },
    {
      id: 'e2_master_q6',
      level: 'master',
      type: 'sensor_mission',
      title: 'Tantangan 6: Kalibrasi Frekuensi Sektor Kuantum',
      instruction: `Tuliskan nilai gelombang sub-atomik sebesar 0,00000000${digits6} ke dalam bentuk baku notasi ilmiah.`,
      latexProblem: `${katexDec6} = \\dots`,
      acceptableAnswers: generateSciNotationAnswers(m6, -9),
      hint: 'Hitung jumlah pergeseran koma ke kanan hingga berada di belakang angka pertama bukan nol.',
      explanation: `Koma digeser ke kanan sebanyak 9 kali menghasilkan ${String(m6).replace('.', ',')} × 10^-9.`,
    },
  ];
}
