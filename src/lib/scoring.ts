export interface AnswerReward {
  points: number;
  noHintBonus: number;
  timeBonus: number;
  total: number;
}

export function calculateAnswerReward(params: {
  pointsPerQuestion: number;
  penaltyPerWrong: number;
  timerSeconds?: number;
  isCorrect: boolean;
  alreadyCorrect: boolean;
  hintUsed: boolean;
  elapsedSeconds?: number;
}): AnswerReward {
  const {
    pointsPerQuestion,
    penaltyPerWrong,
    timerSeconds,
    isCorrect,
    alreadyCorrect,
    hintUsed,
    elapsedSeconds,
  } = params;

  // 1. alreadyCorrect true -> semua nol (mengulang tidak memberi hadiah)
  if (alreadyCorrect) {
    return {
      points: 0,
      noHintBonus: 0,
      timeBonus: 0,
      total: 0,
    };
  }

  // 2. Jawaban salah -> points = -penaltyPerWrong, kedua bonus 0, total = points
  if (!isCorrect) {
    return {
      points: -penaltyPerWrong,
      noHintBonus: 0,
      timeBonus: 0,
      total: -penaltyPerWrong,
    };
  }

  // 3. Jawaban benar
  const points = pointsPerQuestion;
  const noHintBonus = hintUsed ? 0 : Math.round(pointsPerQuestion * 0.2);

  let timeBonus = 0;
  if (
    timerSeconds !== undefined &&
    timerSeconds > 0 &&
    elapsedSeconds !== undefined &&
    elapsedSeconds >= 0
  ) {
    const fractionRemaining = (timerSeconds - elapsedSeconds) / timerSeconds;
    if (fractionRemaining > 0.5) {
      timeBonus = Math.round(pointsPerQuestion * 0.15);
    }
  }

  const total = points + noHintBonus + timeBonus;

  return {
    points,
    noHintBonus,
    timeBonus,
    total,
  };
}
