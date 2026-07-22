import { CohortJoinPage } from "@/components/cohort/cohort-join-page";

export default async function JoinCohortPage({
  params,
}: PageProps<"/[locale]/cohorts/join/[joinToken]">) {
  const { joinToken } = await params;
  return <CohortJoinPage joinToken={joinToken} />;
}
