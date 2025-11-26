import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface ErrorStateProps {
  onBack: () => void;
}

export function ErrorState({ onBack }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-primary-palest flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-3xl text-center">
        <h1 className="text-xl font-bold mb-4">找不到想法</h1>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回探索頁面
        </Button>
      </div>
    </div>
  );
}
