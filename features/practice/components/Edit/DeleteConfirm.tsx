// 刪除確認對話框組件
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Practice } from '@/services/modules/practice/schema';
import { Button } from '@/components/atoms/button';
import { Badge } from '@/components/atoms/badge';

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
  loading = false
}) => {
  if (!isOpen || !practice) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={onCancel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onCancel();
          }
        }}
      />

      {/* 對話框 */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full mx-auto border border-border">
          {/* 關閉按鈕 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="absolute top-4 right-4 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">關閉</span>
          </Button>

          {/* 對話框內容 */}
          <div className="p-6">
            {/* 警告圖示 */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>

            {/* 標題 */}
            <h3 className="text-lg font-semibold text-center text-foreground mb-2">
              確定要刪除這個實踐嗎？
            </h3>

            {/* 實踐資訊 */}
            <div className="bg-muted rounded-lg p-4 my-4">
              <div className="space-y-2">
                <div className="font-medium text-foreground">
                  {practice.title}
                </div>
                <div className="text-sm text-muted-foreground">
                  進度：{practice.currentProgress} / {practice.totalAmount} {practice.unit}
                </div>
                {practice.streak > 0 && (
                  <div className="text-sm text-muted-foreground">
                    連續天數：{practice.streak} 天
                  </div>
                )}
              </div>
            </div>

            {/* 警告訊息 */}
            <div className="space-y-2 text-center">
              <p className="text-sm text-muted-foreground">
                此操作會將實踐移至回收桶，您可以在30天內恢復。
              </p>
              <Badge variant="destructive" className="text-xs">
                30天後將永久刪除所有相關資料
              </Badge>
            </div>
          </div>

          {/* 按鈕區域 */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="mt-2 sm:mt-0"
            >
              取消
            </Button>
            <Button
              variant="destructive"
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
