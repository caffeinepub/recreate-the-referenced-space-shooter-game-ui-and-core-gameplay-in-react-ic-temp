import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import MenuScreen from './screens/MenuScreen';
import GameScreen from './screens/GameScreen';
import { useSavedStats } from './game/persistence/useSavedStats';
import { useDynamicViewport } from './hooks/useDynamicViewport';

type GameState = 'menu' | 'playing';

function App() {
  useDynamicViewport();
  
  const [gameState, setGameState] = useState<GameState>('menu');
  const [highScore, setHighScore] = useState(0);

  const { stats: savedStats, isLoading: isLoadingStats, saveStatsMutation } = useSavedStats();

  useEffect(() => {
    if (savedStats) {
      setHighScore(Number(savedStats.highScore));
    }
  }, [savedStats]);

  const handleStartGame = () => {
    setGameState('playing');
  };

  const handleExitGame = () => {
    setGameState('menu');
  };

  const handleGameOver = (finalScore: number, finalLevel: number) => {
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
            isLoadingStats={isLoadingStats}
          />
        )}
        {gameState === 'playing' && (
          <GameScreen onExit={handleExitGame} onGameOver={handleGameOver} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
