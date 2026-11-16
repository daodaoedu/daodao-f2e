import { CohortMemberPage } from "@/components/cohort/cohort-member-page";
import { CohortAdminHomePage } from "@/components/cohort/cohort-admin-home-page";

export default async function CohortHomePage({
  params,
  searchParams,
}: PageProps<"/[locale]/cohorts/[cohortId]">) {
  const { cohortId } = await params;
  const { programId } = await searchParams;
  const parsedProgramId = Number(Array.isArray(programId) ? programId[0] : programId);
  if (Number.isSafeInteger(parsedProgramId) && parsedProgramId > 0) {
    return (
      <CohortAdminHomePage programId={parsedProgramId} cohortId={Number(cohortId)} />
    );
  }
  return <CohortMemberPage cohortId={Number(cohortId)} />;
}
