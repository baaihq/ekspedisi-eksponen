import { generateQuestionsForEpisode } from '../src/data/episodes';
import { GAME_LEVELS } from '../src/data/levels';
import { createGroupSeed } from '../src/lib/seed';
import { verifyAnswer, normalizeMathAnswer } from '../src/lib/normalize';
import { formatPowerText } from '../src/lib/superscript';
import { DifficultyLevel, QuestionData } from '../src/types/game';

const TEAM_NAMES = [
  'Tim Alpha',
  'Tim Beta',
  'Tim Sigma Eksponen',
  'Kelompok 1',
  'Tim Delta',
  'Ahmad',
  '12345',
  'Kota Data',
];

const LEVELS: DifficultyLevel[] = ['jelajah', 'peneliti', 'master'];

interface ProblemReport {
  level: DifficultyLevel;
  team: string;
  seed: number;
  questionId?: string;
  check: string;
  message: string;
}

async function runCheck() {
  console.log('🚀 Menjalankan pemeriksaan soal (check-questions)...');
  console.log('----------------------------------------------------');

  let totalQuestionsChecked = 0;
  const problems: ProblemReport[] = [];

  const levelInfoMap = new Map<string, number>();
  for (const lvl of GAME_LEVELS) {
    levelInfoMap.set(lvl.id, lvl.totalQuestions);
  }

  for (const teamName of TEAM_NAMES) {
    const seed = createGroupSeed(teamName);

    for (const level of LEVELS) {
      const questions = generateQuestionsForEpisode('episode-1', level, seed);

      // (h) Jumlah soal per level sama dengan totalQuestions pada levels.ts
      const expectedTotal = levelInfoMap.get(level) ?? 4;
      if (questions.length !== expectedTotal) {
        problems.push({
          level,
          team: teamName,
          seed,
          check: 'h. totalQuestions',
          message: `Jumlah soal (${questions.length}) tidak sama dengan totalQuestions pada levels.ts (${expectedTotal})`,
        });
      }

      for (const q of questions) {
        totalQuestionsChecked++;

        // (g) Field wajib tidak kosong
        const mandatoryFields: Array<{ name: keyof QuestionData; val: any }> = [
          { name: 'id', val: q.id },
          { name: 'level', val: q.level },
          { name: 'title', val: q.title },
          { name: 'instruction', val: q.instruction },
          { name: 'latexProblem', val: q.latexProblem },
          { name: 'hint', val: q.hint },
          { name: 'explanation', val: q.explanation },
        ];

        for (const f of mandatoryFields) {
          if (!f.val || (typeof f.val === 'string' && f.val.trim().length === 0)) {
            problems.push({
              level,
              team: teamName,
              seed,
              questionId: q.id,
              check: 'g. mandatoryFields',
              message: `Field '${f.name}' kosong atau tidak valid`,
            });
          }
        }

        if (!Array.isArray(q.acceptableAnswers) || q.acceptableAnswers.length === 0) {
          problems.push({
            level,
            team: teamName,
            seed,
            questionId: q.id,
            check: 'g. mandatoryFields',
            message: 'acceptableAnswers harus berupa array dan tidak boleh kosong',
          });
        }

        // (a) Setiap acceptableAnswers lolos verifyAnswer terhadap dirinya sendiri
        if (Array.isArray(q.acceptableAnswers)) {
          for (const ans of q.acceptableAnswers) {
            const verification = verifyAnswer(ans, q.acceptableAnswers, q.expectedNumericValue);
            if (!verification.isCorrect) {
              problems.push({
                level,
                team: teamName,
                seed,
                questionId: q.id,
                check: 'a. acceptableAnswers self-verify',
                message: `Jawaban '${ans}' gagal memverifikasi dirinya sendiri`,
              });
            }
          }
        }

        // (b) expectedNumericValue (jika ada) lolos verifyAnswer
        if (
          q.expectedNumericValue !== undefined &&
          q.expectedNumericValue !== null &&
          q.expectedNumericValue !== ''
        ) {
          const numStr = String(q.expectedNumericValue);
          const verification = verifyAnswer(numStr, q.acceptableAnswers, q.expectedNumericValue);
          if (!verification.isCorrect) {
            problems.push({
              level,
              team: teamName,
              seed,
              questionId: q.id,
              check: 'b. expectedNumericValue verify',
              message: `expectedNumericValue '${numStr}' tidak lolos verifyAnswer`,
            });
          }
        }

        // (c) expectedExponentForm (jika ada) sama dengan salah satu acceptableAnswers setelah normalizeMathAnswer
        if (q.expectedExponentForm) {
          const normExp = normalizeMathAnswer(q.expectedExponentForm);
          const matched = q.acceptableAnswers.some(
            (ans) => normalizeMathAnswer(ans) === normExp
          );
          if (!matched) {
            problems.push({
              level,
              team: teamName,
              seed,
              questionId: q.id,
              check: 'c. expectedExponentForm normalize match',
              message: `expectedExponentForm '${q.expectedExponentForm}' (norm: '${normExp}') tidak cocok dengan acceptableAnswers`,
            });
          }
        }

        // (d) Jawaban "zzzz" tidak lolos (uji negatif)
        const negativeVerification = verifyAnswer('zzzz', q.acceptableAnswers, q.expectedNumericValue);
        if (negativeVerification.isCorrect) {
          problems.push({
            level,
            team: teamName,
            seed,
            questionId: q.id,
            check: 'd. negative test "zzzz"',
            message: 'Jawaban salah "zzzz" justru dianggap benar',
          });
        }

        // (e) instruction, hint, explanation, dan title yang sudah diproses formatPowerText tidak mengandung \ atau ^
        const textsToCheck = [
          { name: 'title', val: q.title },
          { name: 'instruction', val: q.instruction },
          { name: 'hint', val: q.hint },
          { name: 'explanation', val: q.explanation },
        ];

        for (const t of textsToCheck) {
          const formatted = formatPowerText(t.val);
          if (formatted.includes('\\')) {
            problems.push({
              level,
              team: teamName,
              seed,
              questionId: q.id,
              check: 'e. formatPowerText no backslash',
              message: `Field '${t.name}' setelah formatPowerText masih mengandung '\\': "${formatted}"`,
            });
          }
          if (formatted.includes('^')) {
            problems.push({
              level,
              team: teamName,
              seed,
              questionId: q.id,
              check: 'e. formatPowerText no caret',
              message: `Field '${t.name}' setelah formatPowerText masih mengandung '^': "${formatted}"`,
            });
          }
        }

        // (f) Jumlah { dan } pada latexProblem seimbang
        const openBraces = (q.latexProblem.match(/\{/g) || []).length;
        const closeBraces = (q.latexProblem.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
          problems.push({
            level,
            team: teamName,
            seed,
            questionId: q.id,
            check: 'f. latexProblem braces balance',
            message: `Braces tidak seimbang pada latexProblem: '{' (${openBraces}) vs '}' (${closeBraces})`,
          });
        }
      }
    }
  }

  console.log(`\n📊 Ringkasan Pemeriksaan Soal:`);
  console.log(`- Total soal diperiksa : ${totalQuestionsChecked}`);
  console.log(`- Total masalah         : ${problems.length}`);

  if (problems.length > 0) {
    console.error('\n❌ Masalah terdeteksi:');
    problems.forEach((p, idx) => {
      console.error(
        `  ${idx + 1}. [${p.check}] Level: ${p.level}, Tim: "${p.team}" (seed: ${p.seed}), Soal: ${p.questionId || 'N/A'}`
      );
      console.error(`     Pesan: ${p.message}`);
    });
    process.exit(1);
  } else {
    console.log('✅ Semua pemeriksaan soal lolos dengan sempurna (0 masalah)!');
  }

  // ==============================================================================
  // Uji Format Jawaban (Notasi Ilmiah, Pecahan, Akar, Eksponen)
  // ==============================================================================
  console.log('\n🧪 Menjalankan Uji Format Jawaban...');
  console.log('----------------------------------------------------');

  interface FormatTestCase {
    name: string;
    userAnswer: string;
    acceptableAnswers: string[];
    expectedNumericValue?: number | string;
    shouldPass: boolean;
  }

  const formatTestCases: FormatTestCase[] = [
    // 1. Notasi Ilmiah
    {
      name: 'Notasi ilmiah (4,5 × 10^7)',
      userAnswer: '4,5 × 10^7',
      acceptableAnswers: ['45000000', '4.5e7'],
      expectedNumericValue: 45000000,
      shouldPass: true,
    },
    {
      name: 'Notasi ilmiah (4.5e7)',
      userAnswer: '4.5e7',
      acceptableAnswers: ['45000000'],
      expectedNumericValue: 45000000,
      shouldPass: true,
    },
    {
      name: 'Notasi ilmiah (45×10^6)',
      userAnswer: '45×10^6',
      acceptableAnswers: ['45000000'],
      expectedNumericValue: 45000000,
      shouldPass: true,
    },
    {
      name: 'Notasi ilmiah superscript (4,5·10⁷)',
      userAnswer: '4,5·10⁷',
      acceptableAnswers: ['45000000'],
      expectedNumericValue: 45000000,
      shouldPass: true,
    },

    // 2. Pemisah Ribuan Gaya Indonesia
    {
      name: 'Pemisah ribuan titik (45.000.000)',
      userAnswer: '45.000.000',
      acceptableAnswers: ['45000000'],
      expectedNumericValue: 45000000,
      shouldPass: true,
    },
    {
      name: 'Pemisah ribuan titik (45.000)',
      userAnswer: '45.000',
      acceptableAnswers: ['45000'],
      expectedNumericValue: 45000,
      shouldPass: true,
    },
    {
      name: 'Desimal koma (4,5)',
      userAnswer: '4,5',
      acceptableAnswers: ['4.5'],
      expectedNumericValue: 4.5,
      shouldPass: true,
    },

    // 3. Pecahan
    {
      name: 'Pecahan sederhana (1/8)',
      userAnswer: '1/8',
      acceptableAnswers: ['0.125'],
      expectedNumericValue: 0.125,
      shouldPass: true,
    },
    {
      name: 'Pecahan desimal koma (1/8 vs 0,125)',
      userAnswer: '1/8',
      acceptableAnswers: ['0,125'],
      expectedNumericValue: '0,125',
      shouldPass: true,
    },

    // 4. Bentuk Pangkat
    {
      name: 'Pangkat standar (2^5 = 32)',
      userAnswer: '2^5',
      acceptableAnswers: ['32'],
      expectedNumericValue: 32,
      shouldPass: true,
    },
    {
      name: 'Pangkat kurung kurawal (2^{5} = 32)',
      userAnswer: '2^{5}',
      acceptableAnswers: ['32'],
      expectedNumericValue: 32,
      shouldPass: true,
    },
    {
      name: 'Pangkat basis 10 (10^7)',
      userAnswer: '10^7',
      acceptableAnswers: ['10000000'],
      expectedNumericValue: 10000000,
      shouldPass: true,
    },
    {
      name: 'Pangkat negatif (2^-3 = 0.125)',
      userAnswer: '2^-3',
      acceptableAnswers: ['0.125', '1/8'],
      expectedNumericValue: 0.125,
      shouldPass: true,
    },

    // 5. Bentuk Akar
    {
      name: 'Bentuk akar tunggal (√50)',
      userAnswer: '√50',
      acceptableAnswers: ['5√2'],
      shouldPass: true,
    },
    {
      name: 'Bentuk akar perkalian implisit (5√2)',
      userAnswer: '5√2',
      acceptableAnswers: ['√50'],
      shouldPass: true,
    },
    {
      name: 'Bentuk akar pembagian (√2/2)',
      userAnswer: '√2/2',
      acceptableAnswers: ['1/√2'],
      shouldPass: true,
    },
    {
      name: 'Bentuk akar perkalian (2√3 = √12)',
      userAnswer: '2√3',
      acceptableAnswers: ['√12'],
      shouldPass: true,
    },
    {
      name: 'Bentuk akar penjumlahan (√5+√3 = √3+√5)',
      userAnswer: '√5+√3',
      acceptableAnswers: ['√3+√5'],
      shouldPass: true,
    },

    // 6. Uji Negatif
    {
      name: 'Uji negatif (jawaban acak zzzz)',
      userAnswer: 'zzzz',
      acceptableAnswers: ['32'],
      expectedNumericValue: 32,
      shouldPass: false,
    },
    {
      name: 'Uji negatif (nilai tidak cocok 2^4 != 32)',
      userAnswer: '2^4',
      acceptableAnswers: ['32'],
      expectedNumericValue: 32,
      shouldPass: false,
    },
    {
      name: 'Uji batas panjang >200 karakter',
      userAnswer: '1'.repeat(205),
      acceptableAnswers: ['1'],
      expectedNumericValue: 1,
      shouldPass: false,
    },
  ];

  let formatFailed = 0;
  for (const tc of formatTestCases) {
    const res = verifyAnswer(tc.userAnswer, tc.acceptableAnswers, tc.expectedNumericValue);
    const passed = res.isCorrect === tc.shouldPass;
    if (passed) {
      console.log(`  ✓ [LULUS] ${tc.name} -> isCorrect: ${res.isCorrect}`);
    } else {
      formatFailed++;
      console.error(
        `  ✗ [GAGAL] ${tc.name} -> didapat isCorrect: ${res.isCorrect}, diharapkan: ${tc.shouldPass}`
      );
    }
  }

  console.log(`\n📊 Ringkasan Uji Format:`);
  console.log(`- Total kasus uji : ${formatTestCases.length}`);
  console.log(`- Kasus gagal     : ${formatFailed}`);

  if (formatFailed > 0) {
    console.error(`\n❌ Ada ${formatFailed} kasus uji format yang gagal.`);
    process.exit(1);
  }

  console.log('✅ Semua uji format jawaban lolos dengan sukses!');
  process.exit(0);
}

runCheck().catch((err) => {
  console.error('Fatal error running check-questions:', err);
  process.exit(1);
});
