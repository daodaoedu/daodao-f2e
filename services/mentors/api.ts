import { mutate } from "swr";

interface GetMentorMarathonKeyProps {
  marathonId?: string;
}

export const getMentorMarathonPathname = ({
  marathonId,
}: GetMentorMarathonKeyProps = {}) => {
  const pathname = "/mentors";

  if (marathonId) {
    return `${pathname}/me/marathons/${marathonId}/participants`;
  }
  return `${pathname}/me/marathons`;
};

export const refetchMentorMarathon = async () => {
  await mutate((key: unknown) => {
    const pathname = Array.isArray(key) ? key[0] : key;
    return pathname.startsWith(getMentorMarathonPathname());
  });
};
