import SEOConfig from "@/shared/components/SEO";
import getManageLayout from "@/layout/features/getManageLayout";

export default function PracticesPage() {
  return (
    <>
      <SEOConfig title="主題實踐｜島島阿學" />
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-basic-400">主題實踐</h1>
      </div>
    </>
  );
}

PracticesPage.getLayout = getManageLayout;
