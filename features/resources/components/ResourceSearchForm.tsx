import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";

interface ResourceType {
  id: string;
  label: string;
}

interface FeeType {
  id: string;
  label: string;
}

interface LevelType {
  id: string;
  label: string;
}

interface DurationType {
  id: string;
  label: string;
}

interface FilterState {
  resourceTypes: string[];
  feeTypes: string[];
  levelTypes: string[];
  durationTypes: string[];
}

interface SearchFormProps {
  onFilter: (filters: FilterState) => void;
  onClose: () => void;
  initialFilters?: FilterState;
}

export default function ResourceSearchForm({
  onFilter,
  onClose,
  initialFilters,
}: SearchFormProps) {
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>(
    initialFilters?.resourceTypes || []
  );
  const [selectedFeeTypes, setSelectedFeeTypes] = useState<string[]>(
    initialFilters?.feeTypes || []
  );
  const [selectedLevelTypes, setSelectedLevelTypes] = useState<string[]>(
    initialFilters?.levelTypes || []
  );
  const [selectedDurationTypes, setSelectedDurationTypes] = useState<string[]>(
    initialFilters?.durationTypes || []
  );

  // 當 initialFilters 變更時更新狀態
  useEffect(() => {
    if (initialFilters) {
      setSelectedResourceTypes(initialFilters.resourceTypes || []);
      setSelectedFeeTypes(initialFilters.feeTypes || []);
      setSelectedLevelTypes(initialFilters.levelTypes || []);
      setSelectedDurationTypes(initialFilters.durationTypes || []);
    }
  }, [initialFilters]);

  const resourceTypes: ResourceType[] = [
    { id: "learning-platform", label: "學習平台/APP" },
    { id: "learning-tool", label: "學習工具" },
    { id: "book", label: "書籍/文章" },
    { id: "video", label: "影片" },
    { id: "podcast", label: "Podcast" },
    { id: "workshop", label: "工作坊與課程" },
    { id: "certificate", label: "專業證書與認證課程" },
    { id: "online-course", label: "如 Coursera、Udemy、edX" },
  ];

  const feeTypes: FeeType[] = [
    { id: "free", label: "免費" },
    { id: "partially-free", label: "部分免費" },
    { id: "paid", label: "付費" },
  ];

  const levelTypes: LevelType[] = [
    { id: "beginner", label: "初學" },
    { id: "intermediate", label: "進階" },
    { id: "expert", label: "專家" },
  ];

  const durationTypes: DurationType[] = [
    { id: "under-1-hour", label: "1 小時以下" },
    { id: "1-24-hours", label: "1 小時 ~ 24 小時" },
    { id: "1-day-to-1-week", label: "1 天 ~ 1 周" },
    { id: "1-4-weeks", label: "1 周 ~ 4 周" },
    { id: "over-4-weeks", label: "4 周以上" },
  ];

  const handleResourceTypeChange = (id: string) => {
    setSelectedResourceTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFeeTypeChange = (id: string) => {
    setSelectedFeeTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleLevelTypeChange = (id: string) => {
    setSelectedLevelTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDurationTypeChange = (id: string) => {
    setSelectedDurationTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearResourceTypes = () => {
    setSelectedResourceTypes([]);
  };

  const handleClearFeeTypes = () => {
    setSelectedFeeTypes([]);
  };

  const handleClearLevelTypes = () => {
    setSelectedLevelTypes([]);
  };

  const handleClearDurationTypes = () => {
    setSelectedDurationTypes([]);
  };

  const handleConfirm = () => {
    onFilter({
      resourceTypes: selectedResourceTypes,
      feeTypes: selectedFeeTypes,
      levelTypes: selectedLevelTypes,
      durationTypes: selectedDurationTypes,
    });
    onClose();
  };

  return (
    <div className="space-y-6">
      {/* 資源類型 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg">資源類型</h3>
          <button
            type="button"
            onClick={handleClearResourceTypes}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {resourceTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center border rounded-lg p-3 relative"
            >
              <Checkbox
                id={`resource-${type.id}`}
                checked={selectedResourceTypes.includes(type.id)}
                onCheckedChange={() => handleResourceTypeChange(type.id)}
                className="mr-2"
              />
              <label
                htmlFor={`resource-${type.id}`}
                className="cursor-pointer flex-1"
              >
                {type.label}
              </label>
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 absolute right-2"
                aria-label={`關於${type.label}的資訊`}
              >
                <span className="text-sm rounded-full border border-gray-300 w-4 h-4 flex items-center justify-center">
                  i
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 費用 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg">費用</h3>
          <button
            type="button"
            onClick={handleClearFeeTypes}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {feeTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center border rounded-lg p-3"
            >
              <Checkbox
                id={`fee-${type.id}`}
                checked={selectedFeeTypes.includes(type.id)}
                onCheckedChange={() => handleFeeTypeChange(type.id)}
                className="mr-2"
              />
              <label
                htmlFor={`fee-${type.id}`}
                className="cursor-pointer flex-1"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 適合 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg">適合</h3>
          <button
            type="button"
            onClick={handleClearLevelTypes}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {levelTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center border rounded-lg p-3 relative"
            >
              <Checkbox
                id={`level-${type.id}`}
                checked={selectedLevelTypes.includes(type.id)}
                onCheckedChange={() => handleLevelTypeChange(type.id)}
                className="mr-2"
              />
              <label
                htmlFor={`level-${type.id}`}
                className="cursor-pointer flex-1"
              >
                {type.label}
              </label>
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 absolute right-2"
                aria-label={`關於${type.label}的資訊`}
              >
                <span className="text-sm rounded-full border border-gray-300 w-4 h-4 flex items-center justify-center">
                  i
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 所需學習時間 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg">所需學習時間</h3>
          <button
            type="button"
            onClick={handleClearDurationTypes}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            清除
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {durationTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center border rounded-lg p-3"
            >
              <Checkbox
                id={`duration-${type.id}`}
                checked={selectedDurationTypes.includes(type.id)}
                onCheckedChange={() => handleDurationTypeChange(type.id)}
                className="mr-2"
              />
              <label
                htmlFor={`duration-${type.id}`}
                className="cursor-pointer flex-1"
              >
                {type.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* 確認按鈕 */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleConfirm}
          className="bg-teal-500 hover:bg-teal-600 text-white px-10 py-2 rounded-full"
        >
          確認
        </Button>
      </div>
    </div>
  );
}
