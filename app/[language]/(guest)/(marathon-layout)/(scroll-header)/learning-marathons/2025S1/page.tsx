import { Metadata } from 'next';
import { Banner, Marathon } from '@/widgets/marathon';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '島島盃 - 2025 春季學習馬拉松',
  };
}

export default async function LearningMarathonsPage() {
  return (
    <>
      <Banner />
      <Marathon />
    </>
  );
}
