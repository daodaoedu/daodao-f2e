// 刪除確認對話框組件
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Practice } from '@/services/practice/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DeleteConfirmProps {
  practice: Practice | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  practice,
  isOpen,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen || !practice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onCancel}
        role="button"
        aria-label="close"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCancel();
          }
        }}
      />

      {/* 對話框 */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative mx-auto w-full max-w-md rounded-lg border border-border bg-background shadow-xl">
          {/* 關閉按鈕 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="absolute right-4 top-4 size-8 p-0"
          >
            <X className="size-4" />
            <span className="sr-only">關閉</span>
          </Button>

          {/* 對話框內容 */}
          <div className="p-6">
            {/* 警告圖示 */}
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" />
            </div>

            {/* 標題 */}
            <h3 className="mb-2 text-center text-lg font-semibold text-foreground">
              確定要刪除這個實踐嗎？
            </h3>

            {/* 實踐資訊 */}
            <div className="my-4 rounded-lg bg-muted p-4">
              <div className="space-y-2">
                <div className="font-medium text-foreground">
                  {practice.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  進度：
                  {practice.currentProgress}
                  {' '}
                  /
                  {' '}
                  {practice.totalAmount}
                  {' '}
                  {practice.unit}
                </div>
                {practice.streak > 0 && (
                  <div className="text-sm text-muted-foreground">
                    連續天數：
                    {practice.streak}
                    {' '}
                    天
                  </div>
                )}
              </div>
            </div>

            {/* 警告訊息 */}
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                此操作會將實踐移至回收桶，您可以在30天內恢復。
              </p>
              <Badge variant="default" className="text-xs">
                30天後將永久刪除所有相關資料
              </Badge>
            </div>
          </div>

          {/* 按鈕區域 */}
          <div className="flex flex-col-reverse p-6 pt-0 sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="mt-2 sm:mt-0"
            >
              取消
            </Button>
            <Button
              variant="alert"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? '刪除中...' : '確定刪除'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
