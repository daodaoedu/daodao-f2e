import { useState } from 'react';
import Button from '@/shared/components/Button';

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
        <label className="block text-sm mb-1">資源名稱</label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm mb-1">資源連結</label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="solid" color="alert" onClick={onCancel}>
          取消
        </Button>
        <Button
          variant="solid"
          color="primary"
          onClick={() => onConfirm({ name, url })}
        >
          完成
        </Button>
      </div>
    </div>
  );
}

export default AddResourceForm;
