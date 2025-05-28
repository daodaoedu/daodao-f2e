// 刪除確認對話框組件
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Practice } from '@/services/modules/practice/schema';

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
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
          {/* 關閉按鈕 */}
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-4 right-4 text-basic-300 hover:text-basic-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* 對話框內容 */}
          <div className="p-6">
            {/* 警告圖示 */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
              <AlertTriangle className="h-6 w-6 text-alert" />
            </div>

            {/* 標題 */}
            <h3 className="heading-md text-basic-black text-center mb-2">
              確定要刪除這個實踐嗎？
            </h3>

            {/* 實踐資訊 */}
            <div className="bg-basic-100 rounded-lg p-4 mb-4">
              <div className="body-sm">
                <div className="font-medium text-basic-black mb-1">
                  {practice.title}
                </div>
                <div className="text-basic-400">
                  進度：{practice.currentProgress} / {practice.totalAmount} {practice.unit}
                </div>
                {practice.streak > 0 && (
                  <div className="text-basic-400">
                    連續天數：{practice.streak} 天
                  </div>
                )}
              </div>
            </div>

            {/* 警告訊息 */}
            <div className="body-sm text-basic-400 text-center mb-6">
              <p className="mb-2">
                此操作會將實踐移至回收桶，您可以在30天內恢復。
              </p>
              <p className="text-alert font-medium">
                30天後將永久刪除所有相關資料。
              </p>
            </div>

            {/* 按鈕 */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 body-sm font-medium text-basic-500 bg-white border border-basic-300 rounded-md hover:bg-basic-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 body-sm font-medium text-white bg-alert border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-alert disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '刪除中...' : '確定刪除'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirm;
