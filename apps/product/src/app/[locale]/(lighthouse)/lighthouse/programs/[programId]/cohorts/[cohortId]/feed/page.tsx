import { CohortActivity } from "@/components/lighthouse/cohort-activity";

export default async function LighthouseCohortFeedPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/feed">) {
  const { programId, cohortId } = await params;
  return <CohortActivity programId={Number(programId)} cohortId={Number(cohortId)} />;
}
