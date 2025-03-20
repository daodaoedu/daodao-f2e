import React from 'react';
import { BsSearch, BsX, BsFilter } from 'react-icons/bs';
import Button from '@/shared/components/Button';

interface FilterControlsProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  statusOptions: string[];
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onResetFilters,
  statusOptions
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-4 items-center mb-4">
        {/* 搜尋欄 */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <BsSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
            placeholder="搜尋人名、職稱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchTerm('')}
            >
              <BsX className="text-gray-400 hover:text-gray-600" />
            </Button>
          )}
        </div>

        {/* 狀態選擇器 */}
        <div className="min-w-[120px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* 更多篩選按鈕 */}
        <Button
          variant="outline"
          color="primary"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1"
        >
          <BsFilter className="text-lg" />
          {showFilters ? '隱藏篩選' : '更多篩選'}
        </Button>

        {/* 重置篩選按鈕 */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            color="alert"
            onClick={onResetFilters}
            className="text-xs"
          >
            重置篩選
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
