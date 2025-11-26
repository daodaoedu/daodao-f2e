import { Metadata } from 'next';
import SEOConfig from '@/components/SEOConfig';

export const metadata: Metadata = {
  title: '想法｜島島阿學',
};

export default function IdeasPage() {
  return (
    <>
      <SEOConfig title="想法｜島島阿學" />
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-basic-400">想法</h1>
      </div>
    </>
  );
}
