import { CohortFeed } from "@/components/lighthouse/cohort-feed";

export default async function LighthouseCohortFeedPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/feed">) {
  const { programId, cohortId } = await params;
  return <CohortFeed programId={Number(programId)} cohortId={Number(cohortId)} />;
}
