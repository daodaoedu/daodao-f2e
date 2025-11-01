import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/navigation';
import SEOConfig from '@/components/SEOConfig';
import { Background, Container } from '@/shared/ui/wrapper';
import { ProtectedComponent } from '@/features/auth';
import { CircleForm } from '@/features/circles';
import { parseToString } from '@/shared/lib/helper';
import { circleAPI, CircleSchema } from '@/services/circles';
import { UserValidatorsUserSuccessResponseSchemaData } from '@/generated/models';
import { getUserProfileBasePath } from '@/entities/user';
import { useSession } from '@/entities/session';

// export const runtime = "experimental-edge";

export const getServerSideProps = (async (context) => {
  try {
    const circleId = parseToString(context.params?.circleId);

    if (!circleId) {
      return { notFound: true };
    }

    const { data } = await circleAPI.read(circleId);
    const circle = data[0];

    return {
      props: { data: circle },
    };
  } catch {
    return { notFound: true };
  }
}) satisfies GetServerSideProps<{
  data: CircleSchema;
}>;

export default function CircleEditPage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { user } = useSession();
  const basePath = getUserProfileBasePath(user);

  const checkUserAuthorized = (
    user: UserValidatorsUserSuccessResponseSchemaData
  ) => {
    const isOwner = user.id === data.user.userId;
    if (!isOwner) {
      router.replace(`/circles/${data._id}`);
    }
    return isOwner;
  };

  return (
    <ProtectedComponent checkUserAuthorized={checkUserAuthorized}>
      <Background className="min-h-screen text-basic-400">
        <SEOConfig title={`${data?.title}｜島島阿學`} />
        <Container className="max-w-3xl pb-12">
          <CircleForm
            values={data}
            onSuccess={() => router.replace(`${basePath}/circles`)}
          />
        </Container>
      </Background>
    </ProtectedComponent>
  );
}
