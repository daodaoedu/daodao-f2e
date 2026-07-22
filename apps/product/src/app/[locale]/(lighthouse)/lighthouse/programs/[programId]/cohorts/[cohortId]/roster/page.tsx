import { CohortRoster } from "@/components/lighthouse/cohort-roster";

export default async function LighthouseCohortRosterPage({
  params,
}: PageProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]/roster">) {
  const { programId, cohortId } = await params;
  return <CohortRoster programId={Number(programId)} cohortId={Number(cohortId)} />;
}
