import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Practice } from '@/services/modules/practice/schema';
import EditForm from './EditForm';

interface EditModalProps {
  practice: Practice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Practice>) => Promise<void>;
  loading?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  practice,
  isOpen,
  onClose,
  onSave,
  loading = false
}) => {
  const [formData, setFormData] = useState<Partial<Practice>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // 初始化表單資料
  useEffect(() => {
    if (practice && isOpen) {
      setFormData({
        title: practice.title,
        description: practice.description,
        totalAmount: practice.totalAmount,
        targetDate: practice.targetDate,
        motivationType: practice.motivationType,
        customMotivation: practice.customMotivation,
        reminderEnabled: practice.reminderEnabled,
        reminderFrequency: practice.reminderFrequency,
        smallGoals: [...practice.smallGoals],
        resources: [...practice.resources]
      });
      setErrors({});
    }
  }, [practice, isOpen]);

  // 驗證表單
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = '請輸入標題';
    } else if (formData.title.length > 100) {
      newErrors.title = '標題不能超過100個字元';
    }

    if (formData.totalAmount && formData.totalAmount < 1) {
      newErrors.totalAmount = '總量必須大於0';
    } else if (formData.totalAmount && formData.totalAmount > 10000) {
      newErrors.totalAmount = '總量不能超過10000';
    }

    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (targetDate < today) {
        newErrors.targetDate = '目標日期不能是過去的日期';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 處理儲存
  const handleSave = async () => {
    if (!practice || !validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(practice.id, formData);
      onClose();
    } catch (error) {
      console.error('儲存失敗:', error);
      setErrors({ general: '儲存失敗，請稍後再試' });
    } finally {
      setSaving(false);
    }
  };

  // 處理關閉
  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen || !practice) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 標題列 */}
        <div className="flex items-center justify-between p-6 border-b border-basic-200">
          <h2 className="heading-lg text-basic-black">編輯實踐</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="p-2 text-basic-400 hover:text-basic-600 hover:bg-basic-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 錯誤訊息 */}
        {errors.general && (
          <div className="p-4 bg-alert-lighter border-l-4 border-alert flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-alert" />
            <p className="body-sm text-alert-darker">{errors.general}</p>
          </div>
        )}

        {/* 表單內容 */}
        <div className="flex-1 overflow-y-auto p-6">
          <EditForm
            formData={formData}
            onChange={setFormData}
            errors={errors}
            practice={practice}
          />
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-basic-200 bg-basic-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-basic-600 hover:text-basic-700 hover:bg-basic-100 rounded-lg transition-colors body-sm disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors body-sm font-medium disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>儲存中...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>儲存變更</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
