import { IdeaDetailWidget } from '@/widgets/idea-detail';

interface IdeaDetailPageProps {
  params: {
    ideaId: string;
  };
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  return <IdeaDetailWidget ideaId={params.ideaId} />;
}
