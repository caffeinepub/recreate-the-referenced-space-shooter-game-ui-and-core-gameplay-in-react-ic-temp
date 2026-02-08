import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import type { GameStats } from '../../backend';

export function useSavedStats() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const statsQuery = useQuery<GameStats | null>({
    queryKey: ['gameStats'],
    queryFn: async () => {
      if (!actor) {
        console.warn('[useSavedStats] Actor not available, returning null stats');
        return null;
      }
      
      try {
        const result = await actor.loadStats();
        return result;
      } catch (error) {
        console.error('[useSavedStats] Failed to load stats from backend:', error);
        // Return null instead of throwing to prevent app crash
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    // Don't throw errors to the UI
    throwOnError: false,
  });

  const saveStatsMutation = useMutation({
    mutationFn: async (stats: { highScore: bigint; lastCompletedLevel: bigint }) => {
      if (!actor) {
        console.warn('[useSavedStats] Actor not available, cannot save stats');
        return false;
      }

      try {
        const success = await actor.saveStats(stats.highScore, stats.lastCompletedLevel);
        if (!success) {
          console.warn('[useSavedStats] Backend returned false for saveStats (likely unauthorized)');
        }
        return success;
      } catch (error) {
        console.error('[useSavedStats] Failed to save stats to backend:', error);
        // Don't throw - just log and return false
        return false;
      }
    },
    onSuccess: (success) => {
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['gameStats'] });
      }
    },
    // Don't throw errors to the UI
    throwOnError: false,
  });

  return {
    stats: statsQuery.data,
    isLoading: actorFetching || statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error,
    saveStatsMutation,
  };
}
