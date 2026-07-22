import { CohortShell } from "@/components/lighthouse/cohort-shell";

export default async function LighthouseCohortLayout({
  children,
  params,
}: LayoutProps<"/[locale]/lighthouse/programs/[programId]/cohorts/[cohortId]">) {
  const { programId, cohortId } = await params;
  return (
    <CohortShell programId={Number(programId)} cohortId={Number(cohortId)}>
      {children}
    </CohortShell>
  );
}
