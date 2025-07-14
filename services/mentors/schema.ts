import { z } from "zod";

export const marathonSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  participantCount: z.number(),
});

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

export const marathonParticipantListSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  participants: z.array(participantSchema),
});

export type MarathonSchema = z.infer<typeof marathonSchema>;

export type ParticipantSchema = z.infer<typeof participantSchema>;

export type MarathonParticipantListSchema = z.infer<
  typeof marathonParticipantListSchema
>;
