import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { loadInProgressRun, saveInProgressRun, clearInProgressRun, hasInProgressRun } from './inProgressRunStorage';
import type { InProgressRun } from '@/backend';
import type { GamePhase } from '../types';

interface LocalRunData {
  currentScore: number;
  currentLevel: number;
  progress: number;
  isPaused: boolean;
  phase: GamePhase;
  destroyedNormalObstacles: number;
  bossProgressPct: number;
  timeRemainingSeconds: number;
}

export function useInProgressRun() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Check if a run exists (local first, then backend)
  const hasRunQuery = useQuery<boolean>({
    queryKey: ['hasInProgressRun'],
    queryFn: async () => {
      // Check local storage first
      if (hasInProgressRun()) return true;
      
      // Check backend if actor is available
      if (actor) {
        try {
          return await actor.hasInProgressRun();
        } catch {
          return false;
        }
      }
      return false;
    },
    enabled: true,
    retry: false
  });

  // Load run data (local first, then backend)
  const loadRunQuery = useQuery<LocalRunData | null>({
    queryKey: ['inProgressRun'],
    queryFn: async () => {
      // Try local storage first
      const localRun = loadInProgressRun();
      if (localRun) {
        return {
          currentScore: localRun.currentScore,
          currentLevel: localRun.currentLevel,
          progress: localRun.progress,
          isPaused: localRun.isPaused,
          phase: localRun.phase,
          destroyedNormalObstacles: localRun.destroyedNormalObstacles,
          bossProgressPct: localRun.bossProgressPct,
          timeRemainingSeconds: localRun.timeRemainingSeconds
        };
      }

      // Try backend if actor is available
      if (actor) {
        try {
          const backendRun = await actor.getInProgressRun();
          if (backendRun) {
            return {
              currentScore: Number(backendRun.currentScore),
              currentLevel: Number(backendRun.currentLevel),
              progress: 0,
              isPaused: true,
              phase: 'normal' as GamePhase,
              destroyedNormalObstacles: 0,
              bossProgressPct: 0,
              timeRemainingSeconds: Number(backendRun.currentLevel) === 1 ? 30 : 35
            };
          }
        } catch {
          return null;
        }
      }
      return null;
    },
    enabled: hasRunQuery.data === true,
    retry: false
  });

  // Save run mutation (local + backend)
  const saveRunMutation = useMutation({
    mutationFn: async (data: LocalRunData) => {
      // Save to local storage
      saveInProgressRun(data);

      // Save to backend if actor is available
      if (actor) {
        try {
          const backendRun: InProgressRun = {
            currentScore: BigInt(data.currentScore),
            currentLevel: BigInt(data.currentLevel),
            livesRemaining: BigInt(1),
            timeElapsed: BigInt(0)
          };
          await actor.saveInProgressRun(backendRun);
        } catch (error) {
          console.error('Failed to save to backend:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasInProgressRun'] });
      queryClient.invalidateQueries({ queryKey: ['inProgressRun'] });
    }
  });

  // Clear run mutation (local + backend)
  const clearRunMutation = useMutation({
    mutationFn: async () => {
      // Clear local storage
      clearInProgressRun();

      // Clear backend if actor is available
      if (actor) {
        try {
          await actor.clearInProgressRun();
        } catch (error) {
          console.error('Failed to clear backend run:', error);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasInProgressRun'] });
      queryClient.invalidateQueries({ queryKey: ['inProgressRun'] });
    }
  });

  return {
    hasRun: hasRunQuery.data ?? false,
    runData: loadRunQuery.data,
    isLoading: hasRunQuery.isLoading || loadRunQuery.isLoading,
    saveRun: saveRunMutation.mutate,
    clearRun: clearRunMutation.mutate,
    isSaving: saveRunMutation.isPending,
    isClearing: clearRunMutation.isPending
  };
}
