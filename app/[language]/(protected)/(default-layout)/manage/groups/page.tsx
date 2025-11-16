import { Metadata } from 'next';
import SEOConfig from '@/components/SEOConfig';

export const metadata: Metadata = {
  title: '揪團｜島島阿學',
};

export default function GroupsPage() {
  return (
    <>
      <SEOConfig title="揪團｜島島阿學" />
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-basic-400">揪團</h1>
      </div>
    </>
  );
}
