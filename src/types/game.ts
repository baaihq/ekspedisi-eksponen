export type TeamRole = 'Navigator' | 'Penghitung' | 'Pemeriksa' | 'Pencatat' | 'Penjelas' | 'Anggota';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
}

export interface TeamData {
  id: string;
  name: string;
  color: string;
  seed: number;
  sessionCode?: string;
  members: TeamMember[];
  createdAt: string;
}

export type DifficultyLevel = 'jelajah' | 'peneliti' | 'master';

export interface LevelInfo {
  id: DifficultyLevel;
  title: string;
  subtitle: string;
  icon: string;
  badge: string;
  description: string;
  targetObjective: string;
  estimatedMinutes: number;
  totalQuestions: number;
  pointsPerQuestion: number;
  penaltyPerWrong: number;
  timerSeconds?: number;
}

export interface QuestionData {
  id: string;
  level: DifficultyLevel;
  type: 'exponent_form' | 'numeric_value' | 'mixed' | 'conceptual_error' | 'sensor_mission';
  title: string;
  instruction: string;
  latexProblem: string;
  contextNarrative?: string;
  acceptableAnswers: string[];
  expectedExponentForm?: string;
  expectedNumericValue?: number | string;
  /** Set true hanya untuk soal yang memang menuntut kesetaraan bentuk (mis. sederhanakan √50 = 5√2). Default false agar menjawab dengan nilai polos tidak diterima. */
  allowNumericEquivalent?: boolean;
  hint: string;
  explanation: string;
  diagramSvgKey?: string;
}

export interface QuestionAttempt {
  questionId: string;
  level: DifficultyLevel;
  userAnswer: string;
  reason: string;
  isCorrect: boolean;
  hintUsed: boolean;
  attemptsCount: number;
  timestamp: string;
}

export interface TeamProgress {
  teamId: string;
  episodeId: string;
  selectedLevel: DifficultyLevel;
  currentQuestionIndex: number;
  completed: boolean;
  score: number;
  energyTokens: number;
  hintTokens: number;
  completedLevels: DifficultyLevel[];
  episode1Completed: boolean;
  attempts: Record<string, QuestionAttempt>;
  unlockedHints: string[]; // questionIds where hint has been unlocked
  unlockedCards?: string[]; // IDs of unlocked knowledge cards
}

export type SceneName =
  | 'setup'
  | 'intro'
  | 'map'
  | 'briefing'
  | 'challenge'
  | 'result'
  | 'teacher'
  | 'collection';

export interface DialogueLine {
  speaker: string;
  text: string;
  characterImage?: string;
  backgroundImage?: string;
  expression?: 'normal' | 'happy' | 'thinking' | 'alert' | 'proud';
}

export interface TeamAttemptDetail {
  id?: number | string;
  level: DifficultyLevel;
  questionId: string;
  answer: string;
  reason: string;
  isCorrect: boolean;
  hintUsed: boolean;
  attemptsCount: number;
  answeredAt: string;
}

export interface TeacherTeamSummary {
  teamId: string;
  teamName: string;
  teamColor: string;
  memberCount: number;
  members: { id: string; name: string; role: string }[];
  currentLevel: DifficultyLevel;
  progressPercent: number;
  score: number;
  energyTokens: number;
  hintsUsed: number;
  episode1Completed: boolean;
  completedLevels: string[];
  lastActive: string;
  attempts: TeamAttemptDetail[];
}

export interface TeacherSessionSummary {
  sessionCode: string;
  teacherName: string;
  teams: TeacherTeamSummary[];
}
