import { DifficultyLevel, QuestionData } from '../types/game';
import { DeterministicRandom } from '../lib/seed';
import { powerText } from '../lib/superscript';

/**
 * Generates deterministic questions for a specific group seed and level.
 */
export function generateQuestionsForLevel(level: DifficultyLevel, seed: number): QuestionData[] {
  const rng = new DeterministicRandom(seed + getLevelOffset(level));

  switch (level) {
    case 'jelajah':
      return generateJelajahQuestions(rng);
    case 'peneliti':
      return generatePenelitiQuestions(rng);
    case 'master':
      return generateMasterQuestions(rng);
  }
}

function getLevelOffset(level: DifficultyLevel): number {
  if (level === 'jelajah') return 1000;
  if (level === 'peneliti') return 2000;
  return 3000;
}

// ==============================================================================
// 1. LEVEL JELAJAH PEMULA (Konsep Dasar Perpangkatan)
// ==============================================================================
function generateJelajahQuestions(rng: DeterministicRandom): QuestionData[] {
  // Soal 1: Perkalian berulang -> Bentuk pangkat
  // Variasi base: 2, 3, 5, 7; count: 4, 5, 6
  const base1 = rng.pick([2, 3, 4, 5]);
  const exp1 = rng.pick([4, 5, 6]);
  const repeatedFactors1 = Array(exp1).fill(base1).join(' \\times ');
  const expectedPow1 = `${base1}^${exp1}`;

  // Soal 2: Bentuk pangkat -> Perkalian berulang
  const base2 = rng.pick([3, 4, 6, 7]);
  const exp2 = rng.pick([3, 4, 5]);
  const repeatedFactors2 = Array(exp2).fill(base2).join(' * ');

  // Soal 3: Menentukan basis dan eksponen
  const base3 = rng.pick([5, 6, 8, 9]);
  const exp3 = rng.pick([7, 8, 9]);

  // Soal 4: Menghitung nilai pangkat sederhana
  const base4 = rng.pick([2, 3, 4, 5]);
  const exp4 = base4 === 2 ? rng.pick([4, 5]) : base4 === 3 ? rng.pick([3, 4]) : rng.pick([2, 3]);
  const value4 = Math.pow(base4, exp4);

  return [
    {
      id: 'jelajah_q1',
      level: 'jelajah',
      type: 'exponent_form',
      title: 'Tantangan 1: Mengubah Perkalian Berulang ke Bentuk Pangkat',
      instruction:
        'Sederhanakan susunan perkalian berulang faktor daya generator berikut ke dalam bentuk perpangkatan ringkas.',
      latexProblem: repeatedFactors1,
      acceptableAnswers: [
        expectedPow1,
        `${base1}^{${exp1}}`,
        `${base1} pangkat ${exp1}`,
      ],
      expectedExponentForm: expectedPow1,
      hint: `Hitung berapa kali bilangan ${base1} dikalikan secara berulang. Bilangan pokok adalah ${base1} dan banyak pengulangan (${exp1}) menjadi eksponen. Tuliskan dalam format: ${expectedPow1}.`,
      explanation: `Perkalian berulang bilangan pokok ${base1} sebanyak ${exp1} kali disederhanakan menjadi bentuk pangkat ${base1}^${exp1}.`,
    },
    {
      id: 'jelajah_q2',
      level: 'jelajah',
      type: 'numeric_value',
      title: 'Tantangan 2: Menuliskan Perkalian Berulang dari Bentuk Pangkat',
      instruction:
        `Uraikan bentuk perpangkatan modul energi ${powerText(base2, exp2)} ke dalam bentuk perkalian berulang lengkap.`,
      latexProblem: `${base2}^{${exp2}}`,
      acceptableAnswers: [
        repeatedFactors2,
        Array(exp2).fill(base2).join(' * '),
        Array(exp2).fill(base2).join(' x '),
        Array(exp2).fill(base2).join(' × '),
        Array(exp2).fill(base2).join('*'),
      ],
      hint: `Pangkat ${exp2} menandakan bahwa bilangan basis (${base2}) dikalikan dengan dirinya sendiri sebanyak ${exp2} faktor. Gunakan tanda perkalian (x atau *), contoh: ${Array(exp2).fill(base2).join(' x ')}.`,
      explanation: `Bentuk ${base2}^${exp2} berarti mengalikan bilangan ${base2} sebanyak ${exp2} kali: ${Array(exp2).fill(base2).join(' × ')}.`,
    },
    {
      id: 'jelajah_q3',
      level: 'jelajah',
      type: 'mixed',
      title: 'Tantangan 3: Menentukan Basis dan Eksponen',
      instruction:
        `Pada modul generator ${powerText(base3, exp3)}, tentukan bilangan mana yang berperan sebagai basis (bilangan pokok) dan berapa nilai eksponennya. Tuliskan jawaban dalam format: basis, eksponen (contoh: 2, 5).`,
      latexProblem: `${base3}^{${exp3}}`,
      acceptableAnswers: [
        `${base3}, ${exp3}`,
        `${base3},${exp3}`,
        `basis ${base3}, eksponen ${exp3}`,
        `basis: ${base3}, eksponen: ${exp3}`,
        `basis=${base3}, eksponen=${exp3}`,
        `${base3} dan ${exp3}`,
      ],
      hint: `Pada notasi a^b, bilangan a yang berada di bawah adalah basis, sedangkan angka b yang berada di atas adalah eksponen (pangkat). Jadi basis = ${base3} dan eksponen = ${exp3}.`,
      explanation: `Pada ${base3}^${exp3}, bilangan pokok (basis) adalah ${base3} dan pangkat (eksponen) adalah ${exp3}.`,
    },
    {
      id: 'jelajah_q4',
      level: 'jelajah',
      type: 'numeric_value',
      title: 'Tantangan 4: Menghitung Nilai Perpangkatan Sederhana',
      instruction:
        `Hitung nilai daya akhir yang dihasilkan oleh inti kristal ${powerText(base4, exp4)}.`,
      latexProblem: `${base4}^{${exp4}} = \\dots`,
      acceptableAnswers: [
        String(value4),
        `${base4}^${exp4} = ${value4}`,
      ],
      expectedNumericValue: value4,
      hint: `Kalikan bilangan ${base4} secara berulang sebanyak ${exp4} kali: ${Array(exp4).fill(base4).join(' × ')}. Hasil akhirnya adalah ${value4}.`,
      explanation: `Perhitungan ${base4}^${exp4} adalah ${Array(exp4).fill(base4).join(' × ')} = ${value4}.`,
    },
    // Pengayaan Aljabar: Perkalian berulang variabel
    {
      id: 'jelajah_q5',
      level: 'jelajah',
      type: 'exponent_form',
      title: 'Tantangan 5: Notasi Perpangkatan Variabel Aljabar',
      instruction:
        'Sederhanakan perkalian berulang variabel aljabar kristal daya berikut ke dalam notasi perpangkatan aljabar ringkas.',
      latexProblem: 'a \\times a \\times a \\times a',
      acceptableAnswers: [
        'a^4',
        'a^{4}',
        'a⁴',
        'a pangkat 4',
      ],
      expectedExponentForm: 'a^4',
      hint: 'Variabel a dikalikan berulang sebanyak 4 kali, sehingga bentuk pangkatnya adalah a⁴ atau a^4.',
      explanation: 'Perkalian berulang a × a × a × a memiliki bilangan pokok a dengan 4 faktor berulang, menghasilkan a⁴ atau a^4.',
    },
  ];
}

// ==============================================================================
// 2. LEVEL PENELITI MENENGAH (Penerapan Sifat-Sifat Perpangkatan)
// ==============================================================================
function generatePenelitiQuestions(rng: DeterministicRandom): QuestionData[] {
  // Sifat 1: Perkalian basis sama: a^m * a^n = a^(m+n)
  const base1 = rng.pick([2, 3, 5, 7]);
  const m1 = rng.pick([2, 3, 4]);
  const n1 = rng.pick([3, 4, 5]);
  const sum1 = m1 + n1;

  // Sifat 2: Pembagian basis sama: a^m / a^n = a^(m-n)
  const base2 = rng.pick([2, 3, 4, 5]);
  const n2 = rng.pick([2, 3]);
  const diff2 = rng.pick([2, 3, 4]);
  const m2 = n2 + diff2;

  // Sifat 3: Pangkat dari pangkat: (a^m)^n = a^(m*n)
  const base3 = rng.pick([2, 3, 5]);
  const m3 = rng.pick([2, 3]);
  const n3 = rng.pick([3, 4]);
  const prod3 = m3 * n3;

  // Sifat 4: Campuran perkalian dan pembagian / sifat gabungan
  const base4 = rng.pick([2, 3]);
  const p4 = 4;
  const q4 = 3;
  const r4 = 5;
  const resultExp4 = p4 + q4 - r4; // 4 + 3 - 5 = 2

  return [
    {
      id: 'peneliti_q1',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 1: Perkalian dengan Basis yang Sama',
      instruction:
        'Sederhanakan perkalian aliran energi berikut ke dalam satu bentuk perpangkatan tunggal menggunakan sifat perkalian berpangkat.',
      latexProblem: `${base1}^{${m1}} \\times ${base1}^{${n1}}`,
      acceptableAnswers: [
        `${base1}^${sum1}`,
        `${base1}^{${sum1}}`,
        `${base1} pangkat ${sum1}`,
        powerText(base1, sum1),
      ],
      expectedExponentForm: `${base1}^${sum1}`,
      hint: `Gunakan sifat perkalian perpangkatan dengan basis sama: aᵐ × aⁿ = aᵐ⁺ⁿ. Jumlahkan pangkatnya: ${m1} + ${n1} = ${sum1}. Jadi hasilnya adalah ${base1}^${sum1}.`,
      explanation: `Berdasarkan sifat aᵐ × aⁿ = aᵐ⁺ⁿ, maka ${base1}^${m1} × ${base1}^${n1} = ${base1}^(${m1}+${n1}) = ${base1}^${sum1}.`,
    },
    {
      id: 'peneliti_q2',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 2: Pembagian dengan Basis yang Sama',
      instruction:
        'Sederhanakan pembagian distribusi data berikut ke dalam satu bentuk perpangkatan tunggal.',
      latexProblem: `\\frac{${base2}^{${m2}}}{${base2}^{${n2}}}`,
      acceptableAnswers: [
        `${base2}^${diff2}`,
        `${base2}^{${diff2}}`,
        `${base2} pangkat ${diff2}`,
        powerText(base2, diff2),
      ],
      expectedExponentForm: `${base2}^${diff2}`,
      hint: `Gunakan sifat pembagian perpangkatan dengan basis sama: aᵐ / aⁿ = aᵐ⁻ⁿ. Kurangkan pangkat pembilang dengan penyebut: ${m2} - ${n2} = ${diff2}. Jadi hasilnya adalah ${base2}^${diff2}.`,
      explanation: `Berdasarkan sifat aᵐ / aⁿ = aᵐ⁻ⁿ, maka ${base2}^${m2} / ${base2}^${n2} = ${base2}^(${m2}-${n2}) = ${base2}^${diff2}.`,
    },
    {
      id: 'peneliti_q3',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 3: Pemangkatan Suatu Perpangkatan',
      instruction:
        'Sederhanakan penguatan daya berulang berikut menjadi bentuk pangkat tunggal.',
      latexProblem: `(${base3}^{${m3}})^{${n3}}`,
      acceptableAnswers: [
        `${base3}^${prod3}`,
        `${base3}^{${prod3}}`,
        `${base3} pangkat ${prod3}`,
        powerText(base3, prod3),
      ],
      expectedExponentForm: `${base3}^${prod3}`,
      hint: `Gunakan sifat pemangkatan suatu perpangkatan: (aᵐ)ⁿ = aᵐˣⁿ. Kalikan kedua pangkatnya: ${m3} × ${n3} = ${prod3}. Tuliskan dalam bentuk ${base3}^${prod3}.`,
      explanation: `Berdasarkan sifat (aᵐ)ⁿ = aᵐˣⁿ, maka (${base3}^${m3})^${n3} = ${base3}^(${m3} × ${n3}) = ${base3}^${prod3}.`,
    },
    {
      id: 'peneliti_q4',
      level: 'peneliti',
      type: 'mixed',
      title: 'Tantangan 4: Operasi Campuran Sifat Perpangkatan',
      instruction:
        'Selesaikan penggabungan modul energi berikut menjadi bentuk perpangkatan paling sederhana.',
      latexProblem: `\\frac{${base4}^{${p4}} \\times ${base4}^{${q4}}}{${base4}^{${r4}}}`,
      acceptableAnswers: [
        `${base4}^${resultExp4}`,
        `${base4}^{${resultExp4}}`,
        String(Math.pow(base4, resultExp4)),
        powerText(base4, resultExp4),
      ],
      expectedExponentForm: `${base4}^${resultExp4}`,
      expectedNumericValue: Math.pow(base4, resultExp4),
      hint: `Lakukan perkalian pada pembilang terlebih dahulu: ${base4}^${p4} × ${base4}^${q4} = ${base4}^(${p4}+${q4}) = ${base4}^${p4 + q4}. Kemudian bagi dengan ${base4}^${r4} dengan mengurangkan eksponennya: ${p4 + q4} - ${r4} = ${resultExp4}.`,
      explanation: `Pembilang menjadi ${base4}^(${p4}+${q4}) = ${base4}^7. Lalu dibagi ${base4}^5 menjadi ${base4}^(7-5) = ${base4}^${resultExp4} (atau nilainya = ${Math.pow(base4, resultExp4)}).`,
    },
    // Pengayaan Aljabar Peneliti:
    {
      id: 'peneliti_q5',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 5: Perkalian Aljabar Basis Variabel',
      instruction:
        'Sederhanakan perkalian variabel aljabar transmisi energi berikut ke dalam bentuk pangkat tunggal.',
      latexProblem: 'a^5 \\times a^3',
      acceptableAnswers: ['a^8', 'a^{8}', 'a⁸', 'a pangkat 8'],
      expectedExponentForm: 'a^8',
      hint: 'Gunakan sifat aᵐ × aⁿ = aᵐ⁺ⁿ. Karena basisnya sama-sama variabel a, jumlahkan pangkatnya: 5 + 3 = 8.',
      explanation: 'Berdasarkan sifat perkalian basis sama aᵐ × aⁿ = aᵐ⁺ⁿ, maka a⁵ × a³ = a⁵⁺³ = a⁸.',
    },
    {
      id: 'peneliti_q6',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 6: Pembagian Aljabar Basis Variabel',
      instruction:
        'Sederhanakan pembagian variabel aljabar data jaringan berikut menjadi satu suku berpangkat.',
      latexProblem: '\\frac{x^7}{x^2}',
      acceptableAnswers: ['x^5', 'x^{5}', 'x⁵', 'x pangkat 5'],
      expectedExponentForm: 'x^5',
      hint: 'Gunakan sifat pembagian basis sama: xᵐ / xⁿ = xᵐ⁻ⁿ. Kurangkan eksponen pembilang dengan penyebut: 7 - 2 = 5.',
      explanation: 'Berdasarkan sifat xᵐ / xⁿ = xᵐ⁻ⁿ, maka x⁷ / x² = x⁷⁻² = x⁵.',
    },
    {
      id: 'peneliti_q7',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 7: Pemangkatan Aljabar Berulang',
      instruction:
        'Sederhanakan penguatan aljabar sinyal data berikut ke dalam bentuk pangkat tunggal.',
      latexProblem: '(y^2)^3',
      acceptableAnswers: ['y^6', 'y^{6}', 'y⁶', 'y pangkat 6'],
      expectedExponentForm: 'y^6',
      hint: 'Gunakan sifat pemangkatan pangkat: (yᵐ)ⁿ = yᵐˣⁿ. Kalikan pangkatnya: 2 × 3 = 6.',
      explanation: 'Berdasarkan sifat (yᵐ)ⁿ = yᵐˣⁿ, maka (y²)³ = y²ˣ³ = y⁶.',
    },
    {
      id: 'peneliti_q8',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 8: Pemangkatan Suku Berkoefisien',
      instruction:
        'Sederhanakan pemangkatan suku aljabar berkoefisien penguat kuantum berikut.',
      latexProblem: '(2a^3)^2',
      acceptableAnswers: [
        '4a^6',
        '4a^{6}',
        '4a⁶',
        '4 * a^6',
        '4 * a⁶',
        '4 a^6',
      ],
      expectedExponentForm: '4a^6',
      hint: 'Pangkatkan koefisien dan variabelnya secara terpisah: 2² = 4, dan (a³)² = a³ˣ² = a⁶. Gabungkan menjadi 4a⁶.',
      explanation: 'Sesuai sifat (c · aᵐ)ⁿ = cⁿ · aᵐˣⁿ, maka (2a³)² = 2² · a³ˣ² = 4a⁶.',
    },
    {
      id: 'peneliti_q9',
      level: 'peneliti',
      type: 'exponent_form',
      title: 'Tantangan 9: Operasi Campuran Multivariabel',
      instruction:
        'Sederhanakan pembagian multivariabel penyaring distorsi frekuensi berikut.',
      latexProblem: '\\frac{(a^2 b^3)^2}{a b^4}',
      acceptableAnswers: [
        'a^3 b^2',
        'a^3b^2',
        'a³ b²',
        'a³b²',
        'a^3 * b^2',
        'a^{3} b^{2}',
        'a^{3}b^{2}',
      ],
      expectedExponentForm: 'a^3 b^2',
      hint: 'Sederhanakan pembilang terlebih dahulu: (a² b³)² = a⁴ b⁶. Kemudian bagi dengan penyebut: (a⁴ / a) = a³ dan (b⁶ / b⁴) = b². Hasil akhirnya adalah a³ b².',
      explanation: 'Pembilang menjadi a^(2×2) b^(3×2) = a⁴ b⁶. Lalu dibagi penyebut a¹ b⁴: a^(4-1) b^(6-4) = a³ b².',
    },
  ];
}

// ==============================================================================
// 3. LEVEL MASTER EKSPONEN (Analisis, Konteks, Pemecahan Masalah)
// ==============================================================================
function generateMasterQuestions(rng: DeterministicRandom): QuestionData[] {
  // Soal 1: Analisis Kesalahan Konsep
  // Misal seorang teknisi menulis 2^4 = 8 karena mengalikan 2 x 4
  const misBase = rng.pick([2, 3, 5]);
  const misExp = rng.pick([3, 4]);
  const wrongVal = misBase * misExp;
  const correctVal = Math.pow(misBase, misExp);

  // Soal 2: Misi Sensor
  const sensorBase = rng.pick([2, 3]);
  const sensorCount = sensorBase === 2 ? rng.pick([4, 5, 6]) : rng.pick([3, 4]);
  const sensorMultiplication = Array(sensorCount).fill(sensorBase).join(' \\times ');
  const sensorPow = `${sensorBase}^${sensorCount}`;
  const sensorVal = Math.pow(sensorBase, sensorCount);

  // Soal 3: Pola Pertumbuhan Eksponensial Virus Komputer di Kota Data
  const r3 = rng.pick([2, 3]);
  const t3 = rng.pick([3, 4, 5]);
  const growthVal = Math.pow(r3, t3);

  // Soal 4: Merancang bentuk perpangkatan berulang dari suatu nilai total
  const targetBases = [
    { base: 2, exp: 6, val: 64 },
    { base: 3, exp: 4, val: 81 },
    { base: 5, exp: 3, val: 125 },
    { base: 4, exp: 3, val: 64 },
  ];
  const designProblem = rng.pick(targetBases);

  return [
    {
      id: 'master_q1',
      level: 'master',
      type: 'conceptual_error',
      title: 'Tantangan 1: Analisis Kesalahan Konsep Teknisi',
      instruction:
        `Seorang teknisi magang Kota Data mencatat kalkulasi modul: ${powerText(misBase, misExp)} = ${wrongVal} karena ia mengalikan ${misBase} × ${misExp}. Analisislah kesalahannya dan tentukan nilai hasil perhitungan yang benar!`,
      latexProblem: `${misBase}^{${misExp}} \\neq ${wrongVal}`,
      acceptableAnswers: [
        String(correctVal),
        `${misBase}^${misExp} = ${correctVal}`,
        `${correctVal}`,
      ],
      expectedNumericValue: correctVal,
      hint: `Teknisi melakukan kekeliruan dengan mengalikan basis dan pangkat (${misBase} × ${misExp} = ${wrongVal}). Konsep sebenarnya adalah perkalian berulang basis sebanyak ${misExp} kali: ${Array(misExp).fill(misBase).join(' × ')} = ${correctVal}.`,
      explanation: `Pangkat bukan mengalikan basis dengan eksponen. ${misBase}^${misExp} adalah ${Array(misExp).fill(misBase).join(' × ')} = ${correctVal}.`,
    },
    {
      id: 'master_q2',
      level: 'master',
      type: 'sensor_mission',
      title: 'Tantangan 2: Misi Sensor Pengirim Data Kota',
      instruction:
        `Sebuah sensor transmisi Kota Data mengirim paket daya dengan pola perkalian berulang berikut. Tuliskan bentuk pangkatnya dan tentukan nilainya! (Contoh jawaban: ${powerText(sensorBase, sensorCount)} = ${sensorVal} atau cukup tuliskan ${powerText(sensorBase, sensorCount)} atau ${sensorVal}).`,
      latexProblem: sensorMultiplication,
      acceptableAnswers: [
        sensorPow,
        String(sensorVal),
        `${sensorPow} = ${sensorVal}`,
        `${sensorBase}^{${sensorCount}}`,
        `${sensorBase}^${sensorCount} = ${sensorVal}`,
      ],
      expectedExponentForm: sensorPow,
      expectedNumericValue: sensorVal,
      hint: `Ada ${sensorCount} faktor ${sensorBase}. Banyak faktor tersebut menjadi eksponen. Jadi tulis ${sensorPow}, kemudian hitung nilainya (${sensorVal}).`,
      explanation: `Pola perkalian berulang menampilkan ${sensorCount} kali angka ${sensorBase}, sehingga bentuk pangkatnya adalah ${sensorPow} dan nilai totalnya adalah ${sensorVal}.`,
    },
    {
      id: 'master_q3',
      level: 'master',
      type: 'numeric_value',
      title: 'Tantangan 3: Pemodelan Multiplikasi Reaktor Energi',
      instruction:
        `Energi cadangan generator membelah dan berlipat ganda menjadi ${r3} kali lipat setiap siklus menit. Jika pada awal siklus reaktor diaktifkan, berapa total unit energi yang dihasilkan pada menit ke-${t3}? (Gunakan rumus E = ${powerText(r3, 't')})`,
      latexProblem: `E = ${r3}^{${t3}}`,
      acceptableAnswers: [
        String(growthVal),
        `${r3}^${t3} = ${growthVal}`,
        `${growthVal} unit`,
      ],
      expectedNumericValue: growthVal,
      hint: `Pertumbuhan berlipat ganda dimodelkan dengan perpangkatan: ${r3}^${t3}. Hitung perkalian: ${Array(t3).fill(r3).join(' × ')} = ${growthVal}.`,
      explanation: `Pada siklus ke-${t3}, energi bernilai ${r3}^${t3} = ${growthVal} unit.`,
    },
    {
      id: 'master_q4',
      level: 'master',
      type: 'mixed',
      title: 'Tantangan 4: Rekonstruksi Kode Daya Generator',
      instruction:
        `Sistem inti memerlukan kode aktivasi berupa bentuk perpangkatan aᵇ (dengan a > 1 dan b > 1) yang bernilai tepat ${designProblem.val}. Tuliskan bentuk pangkat yang sesuai!`,
      latexProblem: `a^b = ${designProblem.val}`,
      acceptableAnswers: [
        `${designProblem.base}^${designProblem.exp}`,
        `${designProblem.base}^{${designProblem.exp}}`,
        powerText(designProblem.base, designProblem.exp),
        ...(designProblem.val === 64 ? ['2^6', '4^3', '8^2', '2^{6}', '4^{3}', '8^{2}'] : []),
        ...(designProblem.val === 81 ? ['3^4', '9^2', '3^{4}', '9^{2}'] : []),
      ],
      expectedExponentForm: `${designProblem.base}^${designProblem.exp}`,
      hint: `Carilah bilangan pokok dan pangkat yang jika dikalikan berulang menghasilkan ${designProblem.val}. Cobalah faktorkan: ${designProblem.val} dapat dibentuk dari ${designProblem.base}^${designProblem.exp}.`,
      explanation: `Bilangan ${designProblem.val} dapat dituliskan sebagai perpangkatan ${designProblem.base}^${designProblem.exp} karena ${Array(designProblem.exp).fill(designProblem.base).join(' × ')} = ${designProblem.val}.`,
    },
  ];
}
