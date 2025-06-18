import SEOConfig from "@/shared/components/SEO";
import getManageLayout from "@/layout/features/getManageLayout";

export default function GroupsPage() {
  return (
    <>
      <SEOConfig title="揪團｜島島阿學" />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-basic-400">揪團</h1>
      </div>
    </>
  );
}

GroupsPage.getLayout = getManageLayout;
