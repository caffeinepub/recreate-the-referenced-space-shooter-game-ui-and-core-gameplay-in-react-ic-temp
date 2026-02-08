import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import { useSavedStats } from './game/persistence/useSavedStats';
import { useInProgressRun } from './game/persistence/useInProgressRun';
import { useDynamicViewport } from './hooks/useDynamicViewport';
import type { GamePhase } from './game/types';

type GameState = 'menu' | 'playing';

interface ResumeData {
  score: number;
  level: number;
  progress: number;
  phase?: GamePhase;
  destroyedNormalObstacles?: number;
  bossProgressPct?: number;
  timeRemainingSeconds?: number;
}

function App() {
  useDynamicViewport();
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [highScore, setHighScore] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);

  const { stats: savedStats, isLoading: isLoadingStats, saveStatsMutation } = useSavedStats();
  const { hasRun, runData, clearRun } = useInProgressRun();

  useEffect(() => {
    if (savedStats) {
      setHighScore(Number(savedStats.highScore));
    }
  }, [savedStats]);

  const handleStartGame = () => {
    // Clear any existing saved run when starting fresh
    clearRun();
    setResumeData(null);
    setGameState('playing');
  };

  const handleContinueGame = () => {
    if (runData) {
      setResumeData({
        score: runData.currentScore,
        level: runData.currentLevel,
        progress: runData.progress,
        phase: runData.phase,
        destroyedNormalObstacles: runData.destroyedNormalObstacles,
        bossProgressPct: runData.bossProgressPct,
        timeRemainingSeconds: runData.timeRemainingSeconds
      });
      setGameState('playing');
    }
  };

  const handleExitGame = () => {
    setGameState('menu');
  };

  const handleGameOver = (finalScore: number, finalLevel: number) => {
    // Clear saved run on game over
    clearRun();
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      saveStatsMutation.mutate({
        highScore: BigInt(finalScore),
        lastCompletedLevel: BigInt(finalLevel),
      });
    }
    setGameState('menu');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen w-full">
        {gameState === 'menu' && (
          <MenuScreen
            highScore={highScore}
            onStartGame={handleStartGame}
            onContinueGame={handleContinueGame}
            hasSavedRun={hasRun}
            isLoadingStats={isLoadingStats}
          />
        )}
        {gameState === 'playing' && (
          <GameScreen 
            onExit={handleExitGame} 
            onGameOver={handleGameOver}
            resumeData={resumeData}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
