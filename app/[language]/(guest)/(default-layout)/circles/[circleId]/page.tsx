import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SWRConfig, unstable_serialize } from 'swr';
import { Background, Container } from '@/shared/ui/wrapper';
import { CircleDetailWidget } from '@/widgets/circles';
import { getCircleData, getCircleDataKey } from '@/entities/circle';

export async function generateMetadata({
  params,
}: PageProps<'/[language]/circles/[circleId]'>): Promise<Metadata> {
  const { circleId } = await params;

  if (!circleId) {
    notFound();
  }

  const response = await getCircleData({ id: circleId });
  const circle = response?.data?.[0];

  if (!circle) {
    notFound();
  }

  return {
    title: `${circle.title} | 島島阿學`,
    description: circle.content,
  };
}

export async function CircleDetailPage({
  params,
}: PageProps<'/[language]/circles/[circleId]'>) {
  const { circleId } = await params;

  if (!circleId) {
    notFound();
  }

  const circleResponse = await getCircleData({ id: circleId });

  if (!circleResponse.data?.[0]) {
    notFound();
  }

  const swrKey = getCircleDataKey({ id: circleId });

  return (
    <SWRConfig
      value={{
        fallback: {
          [unstable_serialize(swrKey)]: circleResponse,
        },
      }}
    >
      <Background className="text-basic-400">
        <Container className="max-w-3xl pb-12">
          <CircleDetailWidget circleId={circleId} />
        </Container>
      </Background>
    </SWRConfig>
  );
}

export default CircleDetailPage;
