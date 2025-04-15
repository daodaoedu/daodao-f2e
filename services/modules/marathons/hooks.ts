import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import marathonAPI, { getMarathonPathname } from './api';
import { MarathonSchema } from './schema';

export function useMarathon(id?: string) {
  return useSWR<MarathonSchema>(id ? getMarathonPathname({ id }) : null);
}

export function useMarathonByUserEvent(userId?: string, eventId?: string) {
  return useSWR<MarathonSchema>(
    userId ? [getMarathonPathname(), { userId, eventId }] : null
  );
}

interface UseMarathonMutationProps {
  onCreated?: () => void;
  onUpdated?: () => void;
}

export function useMarathonMutation({
  onCreated,
  onUpdated,
}: UseMarathonMutationProps = {}) {
  const createMutation = useSWRMutation(
    getMarathonPathname(),
    marathonAPI.create,
    { onSuccess: onCreated }
  );

  const updateMutation = useSWRMutation(
    getMarathonPathname(),
    marathonAPI.update,
    { onSuccess: onUpdated }
  );

  return {
    createMutation,
    updateMutation,
  };
}
