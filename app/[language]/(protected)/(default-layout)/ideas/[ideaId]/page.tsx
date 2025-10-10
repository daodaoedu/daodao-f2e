import type { Metadata } from 'next';
import { IdeaDetailWidget } from '@/widgets/idea-detail';
import { ideaAPI } from '@/services/ideas/api';

interface IdeaDetailPageProps {
  params: {
    ideaId: string;
  };
}

export async function generateMetadata({
  params,
}: IdeaDetailPageProps): Promise<Metadata> {
  try {
    const idea = await ideaAPI.read(params.ideaId);

    const title = `${idea.content.slice(0, 50)}${idea.content.length > 50 ? '...' : ''} | 想法詳情`;
    const description = idea.content.slice(0, 160);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        authors: idea.user?.name ? [idea.user.name] : undefined,
        publishedTime: idea.createdAt,
        modifiedTime: idea.updatedAt,
        tags: idea.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    // 如果獲取失敗，返回預設 metadata
    return {
      title: '想法詳情',
      description: '查看社群成員分享的創意想法',
    };
  }
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  return <IdeaDetailWidget ideaId={params.ideaId} />;
}
