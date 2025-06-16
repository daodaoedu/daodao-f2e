import { CreateResourceForm } from "@/features/resources";
import SEOConfig from "@/shared/components/SEO";

export default function CreateResourcePage() {
  return (
    <>
      <SEOConfig title="分享資源" />
      <CreateResourceForm />
    </>
  );
}
