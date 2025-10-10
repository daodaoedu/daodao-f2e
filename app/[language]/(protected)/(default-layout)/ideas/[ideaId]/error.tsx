'use client';

import { useEffect } from 'react';
import { ArrowLeft, RefreshCcw, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';

export default function IdeaErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // 可以在這裡記錄錯誤到錯誤監控服務
    console.error('Idea detail page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-primary-palest flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <AlertCircle className="size-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">發生錯誤</h1>
          <p className="text-basic-500 mb-4">
            {error.message || '載入想法時發生問題，請稍後再試'}
          </p>
          {error.digest && (
            <p className="text-sm text-basic-400 font-mono">
              錯誤代碼: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => router.push('/explore')}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            返回探索頁面
          </Button>
          <Button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCcw className="size-4" />
            重試
          </Button>
        </div>
      </div>
    </div>
  );
}
