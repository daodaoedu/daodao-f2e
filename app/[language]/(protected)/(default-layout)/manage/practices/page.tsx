import { Metadata } from 'next';
import SEOConfig from '@/components/SEOConfig';

export const metadata: Metadata = {
  title: '主題實踐｜島島阿學',
};

export default function PracticesPage() {
  return (
    <>
      <SEOConfig title="主題實踐｜島島阿學" />
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-basic-400">主題實踐</h1>
      </div>
    </>
  );
}
