'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from '@/shared/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Container } from '@/shared/ui/container';


interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ExploreError({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Explore page error:', error);
  }, [error]);
  
  return (
    <div className="min-h-screen bg-basic-100 relative">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-basic-black mb-4">
              載入探索頁面時發生錯誤
            </h2>

            <p className="text-basic-300 mb-8 max-w-md">
              很抱歉，我們在載入探索內容時遇到了問題。請稍後再試，或聯繫支援團隊。
            </p>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl">
                <h3 className="text-sm font-medium text-red-800 mb-2">開發錯誤資訊:</h3>
                <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
                  {error.message}
                </pre>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    錯誤 ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => reset()}
                className="bg-primary-base hover:bg-primary-darker text-basic-white flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                重新載入
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                   router.push('/');
                }}
                className="border-basic-200 text-basic-400 hover:bg-basic-100 bg-basic-white"
              >
                返回首頁
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}