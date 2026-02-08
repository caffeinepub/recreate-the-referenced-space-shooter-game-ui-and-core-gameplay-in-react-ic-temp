import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { InProgressRun } from '../../backend';
import { 
  saveInProgressRun as saveToLocalStorage, 
  loadInProgressRun as loadFromLocalStorage, 
  clearInProgressRun as clearLocalStorage,
  type LocalRunData 
} from './inProgressRunStorage';
import type { GamePhase } from '../types';

export function useInProgressRun() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  // Check if there's a run in progress (backend or local)
  const hasRunQuery = useQuery<boolean>({
    queryKey: ['hasInProgressRun'],
    queryFn: async () => {
      // First check local storage
      const localRun = loadFromLocalStorage();
      if (localRun) {
        return true;
      }

      // Then check backend if actor is available
      if (!actor) {
        console.warn('[useInProgressRun] Actor not available for hasRun check, using local storage only');
        return false;
      }

      try {
        const hasBackendRun = await actor.hasInProgressRun();
        return hasBackendRun;
      } catch (error) {
        console.error('[useInProgressRun] Failed to check backend for in-progress run:', error);
        // Fall back to local storage check
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    throwOnError: false,
  });

  // Load run data (backend or local)
  const runDataQuery = useQuery<LocalRunData | null>({
    queryKey: ['inProgressRunData'],
    queryFn: async () => {
      // First try local storage
      const localRun = loadFromLocalStorage();
      if (localRun) {
        return localRun;
      }

      // Then try backend if actor is available
      if (!actor) {
        console.warn('[useInProgressRun] Actor not available for run data, using local storage only');
        return null;
      }

      try {
        const backendRun = await actor.getInProgressRun();
        if (backendRun) {
          // Convert backend format to local format
          return {
            currentScore: Number(backendRun.currentScore),
            currentLevel: Number(backendRun.currentLevel),
            progress: 0, // Backend doesn't store progress
            isPaused: true,
            phase: 'normal' as GamePhase,
            destroyedNormalObstacles: 0,
            bossProgressPct: 0,
            timeRemainingSeconds: 0,
          };
        }
        return null;
      } catch (error) {
        console.error('[useInProgressRun] Failed to load run data from backend:', error);
        return null;
      }
    },
    enabled: hasRunQuery.data === true,
    retry: false,
    throwOnError: false,
  });

  // Save run mutation
  const saveRunMutation = useMutation({
    mutationFn: async (runData: LocalRunData) => {
      // Always save to local storage first
      saveToLocalStorage(runData);

      // Try to save to backend if actor is available
      if (!actor) {
        console.warn('[useInProgressRun] Actor not available, saved to local storage only');
        return true;
      }

      try {
        const backendRun: InProgressRun = {
          currentScore: BigInt(runData.currentScore),
          currentLevel: BigInt(runData.currentLevel),
          livesRemaining: BigInt(3), // Default value
          timeElapsed: BigInt(0), // Default value
        };

        const success = await actor.saveInProgressRun(backendRun);
        if (!success) {
          console.warn('[useInProgressRun] Backend returned false for saveInProgressRun (likely unauthorized)');
        }
        return true; // Local save succeeded
      } catch (error) {
        console.error('[useInProgressRun] Failed to save run to backend:', error);
        return true; // Local save still succeeded
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasInProgressRun'] });
      queryClient.invalidateQueries({ queryKey: ['inProgressRunData'] });
    },
    throwOnError: false,
  });

  // Clear run mutation
  const clearRunMutation = useMutation({
    mutationFn: async () => {
      // Always clear local storage first
      clearLocalStorage();

      // Try to clear backend if actor is available
      if (!actor) {
        console.warn('[useInProgressRun] Actor not available, cleared local storage only');
        return true;
      }

      try {
        const success = await actor.clearInProgressRun();
        if (!success) {
          console.warn('[useInProgressRun] Backend returned false for clearInProgressRun (likely unauthorized)');
        }
        return true; // Local clear succeeded
      } catch (error) {
        console.error('[useInProgressRun] Failed to clear run from backend:', error);
        return true; // Local clear still succeeded
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hasInProgressRun'] });
      queryClient.invalidateQueries({ queryKey: ['inProgressRunData'] });
    },
    throwOnError: false,
  });

  return {
    hasRun: hasRunQuery.data ?? false,
    runData: runDataQuery.data,
    isLoading: actorFetching || hasRunQuery.isLoading,
    saveRun: (data: LocalRunData) => saveRunMutation.mutate(data),
    clearRun: () => clearRunMutation.mutate(),
  };
}
