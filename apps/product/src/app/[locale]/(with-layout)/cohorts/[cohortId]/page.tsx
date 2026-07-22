import { CohortMemberPage } from "@/components/cohort/cohort-member-page";

export default async function CohortHomePage({
  params,
}: PageProps<"/[locale]/cohorts/[cohortId]">) {
  const { cohortId } = await params;
  return <CohortMemberPage cohortId={Number(cohortId)} />;
}
