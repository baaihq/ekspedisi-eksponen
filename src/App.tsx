import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SceneName, TeamData, TeamProgress, DifficultyLevel, QuestionData } from './types/game';
import { syncService } from './services/syncService';
import { settingsService } from './services/settingsService';
import { EPISODES, generateQuestionsForEpisode } from './data/episodes';
import { GAME_LEVELS } from './data/levels';
import { audioManager } from './audio/audioManager';
import { calculateAnswerReward, AnswerReward } from './lib/scoring';

import { GameLayout } from './layouts/GameLayout';
import { SetupScene } from './scenes/SetupScene';
import { IntroScene } from './scenes/IntroScene';
import { MapScene } from './scenes/MapScene';
import { MissionBriefingScene } from './scenes/MissionBriefingScene';
import { ChallengeScene } from './scenes/ChallengeScene';
import { ResultScene } from './scenes/ResultScene';
import { TeacherDashboardScene } from './scenes/TeacherDashboardScene';
import { CollectionScene } from './scenes/CollectionScene';

function resolveInitialEpisodeId(): string {
  const saved = settingsService.getActiveEpisode();
  const found = EPISODES.find((e) => e.id === saved);
  return found && found.isActive ? found.id : 'episode-1';
}

export default function App() {
  // Global team state
  const [team, setTeam] = useState<TeamData | null>(() => syncService.loadCurrentTeam());

  // Active episode state (persisted across reloads)
  const [initialEpisodeId] = useState<string>(resolveInitialEpisodeId);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string>(initialEpisodeId);

  // Global progress state
  const [progress, setProgress] = useState<TeamProgress>(() => {
    const loaded = syncService.loadCurrentProgress(initialEpisodeId);
    if (loaded) return loaded;
    return {
      teamId: '',
      episodeId: initialEpisodeId,
      selectedLevel: 'jelajah',
      currentQuestionIndex: 0,
      completed: false,
      score: 0,
      energyTokens: 100,
      hintTokens: 5,
      completedLevels: [],
      episode1Completed: false,
      attempts: {},
      unlockedHints: [],
    };
  });

  // Current active scene
  const [currentScene, setCurrentScene] = useState<SceneName>(() => {
    const savedTeam = syncService.loadCurrentTeam();
    return savedTeam ? 'map' : 'setup';
  });

  // Active question set for current selected level and episode
  const [activeQuestions, setActiveQuestions] = useState<QuestionData[]>([]);

  // Optional timer mode (seconds per question)
  const [timerSeconds, setTimerSeconds] = useState<number | undefined>(undefined);
  // Last calculated reward for feedback display in ChallengeScene
  const [lastReward, setLastReward] = useState<AnswerReward | null>(null);

  // Update active questions whenever level, episode, or team seed changes
  useEffect(() => {
    if (team) {
      const q = generateQuestionsForEpisode(activeEpisodeId, progress.selectedLevel, team.seed);
      setActiveQuestions(q);
    }
  }, [team, activeEpisodeId, progress.selectedLevel]);

  // Ambience and music playback according to active scene
  useEffect(() => {
    if (currentScene === 'setup') {
      audioManager.playAmbience('city');
    } else if (currentScene === 'intro') {
      audioManager.playMusic('story');
    } else if (currentScene === 'map') {
      audioManager.playMusic('map');
    } else if (currentScene === 'briefing') {
      audioManager.playAmbience('briefing');
    } else if (currentScene === 'challenge') {
      audioManager.playMusic('challenge');
    } else if (currentScene === 'result') {
      audioManager.playMusic('victory');
    } else if (currentScene === 'teacher') {
      audioManager.stopAll();
    }
  }, [currentScene]);

  // Sync state whenever team or progress updates
  const updateProgress = (newProg: Partial<TeamProgress>) => {
    setProgress((prev) => {
      const updated = { ...prev, ...newProg, episodeId: activeEpisodeId };
      syncService.saveProgress(updated);
      return updated;
    });
  };

  // 1. Setup completed
  const handleSetupComplete = (newTeam: TeamData) => {
    setTeam(newTeam);
    syncService.saveTeam(newTeam);
    settingsService.setActiveEpisode('episode-1');
    setActiveEpisodeId('episode-1');

    const initialProgress: TeamProgress = {
      teamId: newTeam.id,
      episodeId: 'episode-1',
      selectedLevel: 'jelajah',
      currentQuestionIndex: 0,
      completed: false,
      score: 0,
      energyTokens: 100,
      hintTokens: 5,
      completedLevels: [],
      episode1Completed: false,
      attempts: {},
      unlockedHints: [],
    };

    setProgress(initialProgress);
    syncService.saveProgress(initialProgress);
    setCurrentScene('intro');
  };

  // Reset team from MapScene modal
  const handleResetTeam = () => {
    syncService.clearLocalTeam();
    settingsService.setActiveEpisode('episode-1');
    setTeam(null);
    setActiveEpisodeId('episode-1');
    setProgress({
      teamId: '',
      episodeId: 'episode-1',
      selectedLevel: 'jelajah',
      currentQuestionIndex: 0,
      completed: false,
      score: 0,
      energyTokens: 100,
      hintTokens: 5,
      completedLevels: [],
      episode1Completed: false,
      attempts: {},
      unlockedHints: [],
    });
    setCurrentScene('setup');
  };

  // Select episode from MapScene
  const handleSelectEpisode = (episodeId: string) => {
    const ep = EPISODES.find((e) => e.id === episodeId);
    if (!ep || !ep.isActive) return;

    settingsService.setActiveEpisode(episodeId);
    setActiveEpisodeId(episodeId);
    const existingProg = syncService.loadProgressForEpisode(episodeId);
    if (existingProg) {
      setProgress(existingProg);
    } else {
      const initialProgress: TeamProgress = {
        teamId: team?.id || '',
        episodeId,
        selectedLevel: 'jelajah',
        currentQuestionIndex: 0,
        completed: false,
        score: 0,
        energyTokens: 100,
        hintTokens: 5,
        completedLevels: [],
        episode1Completed: false,
        attempts: {},
        unlockedHints: [],
      };
      setProgress(initialProgress);
      syncService.saveProgress(initialProgress);
    }
    setCurrentScene('map');
  };

  // 2. Intro completed
  const handleIntroComplete = () => {
    setCurrentScene('map');
  };

  // 3. Level selected from Map
  const handleSelectLevel = (level: DifficultyLevel) => {
    updateProgress({ selectedLevel: level, currentQuestionIndex: 0 });
    setCurrentScene('briefing');
  };

  // 4. Briefing start mission
  const handleStartMission = () => {
    updateProgress({ currentQuestionIndex: 0 });
    setCurrentScene('challenge');
  };

  // 5. Answer submission in Challenge with differentiated level scoring & wrong penalty
  const handleAnswerSubmit = (
    questionId: string,
    userAnswer: string,
    reason: string,
    isCorrect: boolean,
    hintUsed: boolean,
    elapsedSeconds?: number
  ) => {
    const existingAttempt = progress.attempts[questionId];
    const alreadyCorrect = Boolean(existingAttempt?.isCorrect);
    const attemptsCount = (existingAttempt?.attemptsCount || 0) + 1;

    const levelConfig =
      GAME_LEVELS.find((l) => l.id === progress.selectedLevel) || GAME_LEVELS[0];

    const reward = calculateAnswerReward({
      pointsPerQuestion: levelConfig.pointsPerQuestion,
      penaltyPerWrong: levelConfig.penaltyPerWrong,
      timerSeconds,
      isCorrect,
      alreadyCorrect,
      hintUsed,
      elapsedSeconds,
    });
    setLastReward(reward);

    const newAttempt = {
      questionId,
      level: progress.selectedLevel,
      userAnswer,
      reason,
      isCorrect,
      hintUsed,
      attemptsCount,
      timestamp: new Date().toISOString(),
    };

    let newScore = progress.score;
    let newEnergy = progress.energyTokens;

    if (isCorrect) {
      if (!alreadyCorrect) {
        newScore = progress.score + reward.total;
        newEnergy = progress.energyTokens + 25;
      }
    } else {
      if (!alreadyCorrect) {
        newScore = Math.max(0, progress.score + reward.total); // reward.total is -penaltyPerWrong
      }
    }

    const updatedAttempts = {
      ...progress.attempts,
      [questionId]: newAttempt,
    };

    updateProgress({
      score: newScore,
      energyTokens: newEnergy,
      attempts: updatedAttempts,
    });

    if (team) {
      syncService.recordAttempt(team.id, progress.episodeId, newAttempt);
    }
  };

  // 6. Use hint in Challenge
  const handleUseHint = (questionId: string) => {
    if (progress.hintTokens <= 0) return;
    const alreadyUnlocked = progress.unlockedHints?.includes(questionId);
    if (alreadyUnlocked) return;

    const newTokens = Math.max(0, progress.hintTokens - 1);
    const newUnlocked = [...(progress.unlockedHints || []), questionId];

    updateProgress({
      hintTokens: newTokens,
      unlockedHints: newUnlocked,
    });
  };

  // 7. Next Question in Challenge
  const handleNextQuestion = () => {
    setLastReward(null);
    const nextIdx = progress.currentQuestionIndex + 1;
    updateProgress({ currentQuestionIndex: nextIdx });
  };

  // 8. Finish Level -> Go to Result & Buka Kartu Koleksi
  const handleFinishLevel = () => {
    setLastReward(null);
    const alreadyCompleted = progress.completedLevels?.includes(progress.selectedLevel);
    const newCompletedLevels = alreadyCompleted
      ? progress.completedLevels
      : [...(progress.completedLevels || []), progress.selectedLevel];

    // Buka kartu pengetahuan sesuai sektor yang diselesaikan
    const currentCards = new Set(progress.unlockedCards || []);
    if (progress.selectedLevel === 'jelajah') {
      currentCards.add('e1-card-definisi');
    } else if (progress.selectedLevel === 'peneliti') {
      currentCards.add('e1-card-perkalian');
      currentCards.add('e1-card-pembagian');
    } else if (progress.selectedLevel === 'master') {
      currentCards.add('e1-card-master');
    }

    updateProgress({
      completed: true,
      completedLevels: newCompletedLevels,
      unlockedCards: Array.from(currentCards),
    });

    setCurrentScene('result');
  };

  // 9. Finish Episode 1 in Result
  const handleFinishEpisode = () => {
    updateProgress({ episode1Completed: true });
  };

  // 10. Back to Map
  const handleBackToMap = () => {
    setCurrentScene('map');
  };

  // Teacher Mode toggle
  const handleToggleTeacherMode = () => {
    if (currentScene === 'teacher') {
      setCurrentScene(team ? 'map' : 'setup');
    } else {
      setCurrentScene('teacher');
    }
  };

  const currentLevelInfo =
    GAME_LEVELS.find((l) => l.id === progress.selectedLevel) || GAME_LEVELS[0];

  return (
    <GameLayout
      onOpenTeacherMode={handleToggleTeacherMode}
      isTeacherMode={currentScene === 'teacher'}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="w-full"
        >
          {/* SCENE 1: SETUP */}
          {currentScene === 'setup' && (
            <SetupScene
              onComplete={handleSetupComplete}
              initialData={team}
            />
          )}

          {/* SCENE 2: INTRO */}
          {currentScene === 'intro' && (
            <IntroScene onComplete={handleIntroComplete} />
          )}

          {/* SCENE 3: MAP */}
          {currentScene === 'map' && team && (
            <MapScene
              team={team}
              progress={progress}
              episodes={EPISODES}
              activeEpisodeId={activeEpisodeId}
              onSelectEpisode={handleSelectEpisode}
              onSelectLevel={handleSelectLevel}
              onResetTeam={handleResetTeam}
              onOpenCollection={() => setCurrentScene('collection')}
            />
          )}

          {/* SCENE 4: MISSION BRIEFING */}
          {currentScene === 'briefing' && (
            <MissionBriefingScene
              levelInfo={currentLevelInfo}
              progress={progress}
              timerSeconds={timerSeconds}
              onSelectTimer={setTimerSeconds}
              onStartMission={handleStartMission}
              onBackToMap={handleBackToMap}
            />
          )}

          {/* SCENE 5: CHALLENGE */}
          {currentScene === 'challenge' && (
            <ChallengeScene
              questions={activeQuestions}
              currentIndex={progress.currentQuestionIndex}
              progress={progress}
              timerSeconds={timerSeconds}
              lastReward={lastReward}
              onAnswerSubmit={handleAnswerSubmit}
              onNextQuestion={handleNextQuestion}
              onFinishLevel={handleFinishLevel}
              onUseHint={handleUseHint}
              onBackToMap={handleBackToMap}
            />
          )}

          {/* SCENE 6: RESULT */}
          {currentScene === 'result' && team && (
            <ResultScene
              team={team}
              progress={progress}
              questions={activeQuestions}
              onFinishEpisode={handleFinishEpisode}
              onBackToMap={handleBackToMap}
            />
          )}

          {/* SCENE 7: TEACHER DASHBOARD */}
          {currentScene === 'teacher' && (
            <TeacherDashboardScene
              onBackToGame={() => setCurrentScene(team ? 'map' : 'setup')}
            />
          )}

          {/* SCENE 8: KOLEKSI KARTU */}
          {currentScene === 'collection' && (
            <CollectionScene
              unlockedCards={progress.unlockedCards || []}
              onBackToMap={() => setCurrentScene('map')}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </GameLayout>
  );
}
