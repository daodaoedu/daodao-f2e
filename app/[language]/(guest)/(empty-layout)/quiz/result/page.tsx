import { Metadata } from 'next';
import { QuizResultWidget } from '@/widgets/quiz';

export const metadata: Metadata = {
  title: '測驗結果',
};

export default function QuizResultPage() {
  return <QuizResultWidget />;
}
