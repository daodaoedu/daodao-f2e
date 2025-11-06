import { useRouter } from 'next/navigation';
import SEOConfig from '@/components/SEOConfig';
import { Background, Container } from '@/shared/ui/wrapper';
import { CircleForm } from '@/features/circles/components/CircleForm';
import { useAuth, getUserProfileBasePath, ProtectedComponent } from '@/entities/user';

export default function CircleCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const basePath = getUserProfileBasePath(user);

  return (
    <ProtectedComponent>
      <Background className="min-h-screen text-basic-400">
        <SEOConfig title="發起揪團｜島島阿學" />
        <Container className="max-w-3xl pb-12">
          <CircleForm onSuccess={() => router.replace(`${basePath}/circles`)} />
        </Container>
      </Background>
    </ProtectedComponent>
  );
}
