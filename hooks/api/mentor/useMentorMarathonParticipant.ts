import useSWR from 'swr';
import {
  getMentorMarathonEndpoint,
  MarathonParticipantListSchema,
} from '@/services/mentors/marathons';

interface UseMentorMarathonParticipantListProps {
  marathonId?: string | null;
}

export default function useMentorMarathonParticipant({
  marathonId,
}: UseMentorMarathonParticipantListProps) {
  const swrKey = marathonId
    ? [getMentorMarathonEndpoint({ marathonId })]
    : null;

  const { mutate, ...swr } = useSWR<MarathonParticipantListSchema>(swrKey);

  return {
    ...swr,
    mutate,
  };
}
