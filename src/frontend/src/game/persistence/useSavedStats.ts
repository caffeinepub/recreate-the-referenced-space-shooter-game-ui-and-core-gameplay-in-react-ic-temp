import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import type { GameStats } from '@/backend';

export function useSavedStats() {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const statsQuery = useQuery<GameStats | null>({
    queryKey: ['gameStats'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.loadStats();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  const saveStatsMutation = useMutation({
    mutationFn: async (stats: { highScore: bigint; lastCompletedLevel: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveStats(stats.highScore, stats.lastCompletedLevel);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameStats'] });
    }
  });

  return {
    stats: statsQuery.data,
    isLoading: actorFetching || statsQuery.isLoading,
    isFetched: !!actor && statsQuery.isFetched,
    saveStatsMutation
  };
}
