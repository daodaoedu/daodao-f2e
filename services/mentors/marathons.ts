import { z } from 'zod';

const mentorEndpoint = '/mentors';

interface GetMentorMarathonKeyProps {
  marathonId?: string;
}

export const getMentorMarathonEndpoint = ({
  marathonId,
}: GetMentorMarathonKeyProps = {}) => {
  if (marathonId) {
    return `${mentorEndpoint}/me/marathons/${marathonId}/participants`;
  }
  return `${mentorEndpoint}/me/marathons`;
};

export const marathonSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  participantCount: z.number(),
});

export type MarathonSchema = z.infer<typeof marathonSchema>;

export const participantSchema = z.object({
  _id: z.string(),
  name: z.string(),
  roleList: z.array(z.string()),
  location: z.string(),
  tagList: z.array(z.string()),
  educationStage: z.string(),
  wantToDoList: z.array(z.string()),
  share: z.string(),
  updatedDate: z.string(),
  photoURL: z.string(),
  projectId: z.string(),
  projectTitle: z.string(),
});

export type ParticipantSchema = z.infer<typeof participantSchema>;

export const marathonParticipantListSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  participants: z.array(participantSchema),
});

export type MarathonParticipantListSchema = z.infer<
  typeof marathonParticipantListSchema
>;
