import useSWR from 'swr';
import {
  getMentorMarathonEndpoint,
  MarathonSchema,
} from '@/services/mentors/marathons';

export default function useMentorMarathonList() {
  const swrKey = [getMentorMarathonEndpoint()];

  const { mutate, ...swr } = useSWR<MarathonSchema[]>(swrKey);

  return {
    ...swr,
    mutate,
  };
}
