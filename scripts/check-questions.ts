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
    process.exit(0);
  }
}

runCheck().catch((err) => {
  console.error('Fatal error running check-questions:', err);
  process.exit(1);
});
