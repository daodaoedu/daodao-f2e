import { useRouter } from "next/navigation";
import SEOConfig from "@/components/SEOConfig";
import { Background, Container } from "@/shared/ui/wrapper";
import { ProtectedComponent } from "@/contexts/Auth";
import { CircleForm } from "@/features/circles/components/CircleForm";

export default function CircleCreatePage() {
  const router = useRouter();

  return (
    <ProtectedComponent>
      <Background className="text-basic-400 min-h-screen">
        <SEOConfig title="發起揪團｜島島阿學" />
        <Container className="pb-12 max-w-3xl">
          <CircleForm
            onSuccess={() => router.replace("/personal-card/my-card")}
          />
        </Container>
      </Background>
    </ProtectedComponent>
  );
}
