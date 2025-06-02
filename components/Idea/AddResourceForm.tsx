import { useState } from 'react';
import { Button } from '@/components/atoms/button';

interface ResourceData {
  name: string;
  url: string;
}

interface AddResourceFormProps {
  onConfirm: (data: ResourceData) => void;
  onCancel: () => void;
}

function AddResourceForm({ onConfirm, onCancel }: AddResourceFormProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="p-2 border rounded mb-2">
      <h3 className="font-semibold mb-2">新增資源</h3>
      <div className="mb-2">
        <label htmlFor="resource-name" className="block text-sm mb-1">資源名稱
          <input
            id="resource-name"
            type="text"
            className="
          border
          px-2 py-1
          rounded-lg
          w-full
          pr-8
          border-basic-200

          /* 滑鼠懸停時的邊框顏色 */
          hover:border-primary-base

          /* 聚焦（focus）時的邊框 & 外圈 */
          focus:outline-none
          focus:border-primary-base
          focus:ring-1
          focus:ring-primary-base
        "
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
      </div>
      <div className="mb-2">
        <label htmlFor="resource-url" className="block text-sm mb-1">資源連結
          <input
            id="resource-url"
            type="text"
            className="
          border
          px-2 py-1
          rounded-lg
          w-full
          pr-8
          border-basic-200

          /* 滑鼠懸停時的邊框顏色 */
          hover:border-primary-base

          /* 聚焦（focus）時的邊框 & 外圈 */
          focus:outline-none
          focus:border-primary-base
          focus:ring-1
          focus:ring-primary-base
        "
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          取消
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => onConfirm({ name, url })}
        >
          加入
        </Button>
      </div>
    </div>
  );
}

export default AddResourceForm;
