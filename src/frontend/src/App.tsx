import { useState, useEffect } from 'react';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import { useSavedStats } from './game/persistence/useSavedStats';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

export type GameState = 'menu' | 'playing';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [highScore, setHighScore] = useState(0);
  const { stats, isLoading, saveStatsMutation } = useSavedStats();

  // Load high score from backend on mount
  useEffect(() => {
    if (stats) {
      setHighScore(Number(stats.highScore));
    }
  }, [stats]);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleExitToMenu = () => {
    setGameState('menu');
  };

  const handleGameOver = (finalScore: number, finalLevel: number) => {
    // Update high score if beaten
    if (finalScore > highScore) {
      setHighScore(finalScore);
      // Save to backend (non-blocking)
      saveStatsMutation.mutate({
        highScore: BigInt(finalScore),
        lastCompletedLevel: BigInt(finalLevel)
      });
    }
    setGameState('menu');
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen w-full overflow-hidden">
        {gameState === 'menu' && (
          <MenuScreen
            highScore={highScore}
            onStartGame={handleStartGame}
            isLoadingStats={isLoading}
          />
        )}
        {gameState === 'playing' && (
          <GameScreen
            onExitToMenu={handleExitToMenu}
            onGameOver={handleGameOver}
          />
        )}
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
