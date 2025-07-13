import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import SEOConfig from "@/components/SEOConfig";
import { Background, Container } from "@/components/ui/wrapper";
import { ProtectedComponent } from "@/contexts/Auth";
import { CircleForm } from "@/features/circles";
import { parseToString } from "@/utils/helper";
import { circleAPI, CircleSchema } from "@/services/circles";
import { UserSchema } from "@/services/users";

export const runtime = "experimental-edge";

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

  const checkUserAuthorized = (user: UserSchema) => {
    const isOwner = user._id === data.user.userId;
    if (!isOwner) {
      router.replace(`/circles/${data._id}`);
    }
    return isOwner;
  };

  return (
    <ProtectedComponent checkUserAuthorized={checkUserAuthorized}>
      <Background className="text-basic-400 min-h-screen">
        <SEOConfig title={`${data?.title}｜島島阿學`} />
        <Container className="pb-12 max-w-3xl">
          <CircleForm
            values={data}
            onSuccess={() => router.replace("/personal-card/my-card")}
          />
        </Container>
      </Background>
    </ProtectedComponent>
  );
}
