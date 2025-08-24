import SEOConfig from "@/components/SEOConfig";
import getManageLayout from "@/layout/features/getManageLayout";

export default function IdeasPage() {
  return (
    <>
      <SEOConfig title="想法｜島島阿學" />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-basic-400">想法</h1>
      </div>
    </>
  );
}

IdeasPage.getLayout = getManageLayout;
