// 主題實踐系統 - 列表頁面（路由版本）
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AiOutlinePlus, AiOutlineAppstore, AiOutlineBars, AiOutlineDownload, AiOutlineUpload, AiOutlineExclamationCircle } from 'react-icons/ai';

// Context
import { PracticeProvider, usePractice, useFilteredPractices } from '../../contexts/PracticeContext';

// 組件
import PracticeCard from '../../components/Practice/List/PracticeCard';
import FilterBar from '../../components/Practice/List/FilterBar';
import SearchInput from '../../components/Practice/List/SearchInput';
import DeleteConfirm from '../../components/Practice/Edit/DeleteConfirm';

// 型別
import { Practice } from '../../services/practice/types';

// 主要組件
const PracticeListApp: React.FC = () => {
  const router = useRouter();
  const {
    practices,
    filter,
    stats,
    loading,
    error,
    setFilter,
    resetFilter,
    deletePractice,
    exportData,
    importData
  } = usePractice();

  const filteredPractices = useFilteredPractices();

  // 狀態管理
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 刪除確認對話框
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState<Practice | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ==================== 事件處理函數 ====================

  const handleCreateNew = () => {
    router.push('/practice/create');
  };

  const handlePracticeView = (practice: Practice) => {
    router.push(`/practice/${practice.id}`);
  };

  const handlePracticeEdit = (practice: Practice) => {
    router.push(`/practice/${practice.id}/edit`);
  };

  const handlePracticeDelete = (practice: Practice) => {
    setPracticeToDelete(practice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!practiceToDelete) return;

    setDeleting(true);
    try {
      await deletePractice(practiceToDelete.id);
      setDeleteConfirmOpen(false);
      setPracticeToDelete(null);
    } catch (err) {
      console.error('刪除失敗:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setPracticeToDelete(null);
  };

  const handlePracticeCheckIn = (practice: Practice) => {
    router.push(`/practice/${practice.id}`);
  };

  // ==================== 資料匯入匯出 ====================

  const handleExportData = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `practice_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('匯出失敗:', err);
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          await importData(text);
        } catch (err) {
          console.error('匯入失敗:', err);
        }
      }
    };
    input.click();
  };

  return (
    <>
      <Head>
        <title>主題實踐 - 學習進度追蹤</title>
        <meta name="description" content="追蹤你的學習進度，建立學習習慣" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* 主要內容 */}
      <main>
        <div className="min-h-screen-without-padding-top bg-primary-palest">
          {/* 主要內容容器 */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* 頁面標題區域 */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h1 className="heading-lg text-basic-black">主題實踐</h1>
                  <div className="hidden sm:flex items-center space-x-4 body-sm text-basic-400">
                    <span>總計: {stats.total}</span>
                    <span>進行中: {stats.active}</span>
                    <span>已完成: {stats.completed}</span>
                  </div>
                </div>

                {/* 右側操作按鈕 */}
                <div className="flex items-center space-x-3">
                  {/* 視圖切換 */}
                  <div className="flex items-center border border-basic-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-primary-base text-white'
                          : 'text-basic-400 hover:text-basic-500 hover:bg-basic-100'
                      }`}
                    >
                      <AiOutlineAppstore className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary-base text-white'
                          : 'text-basic-400 hover:text-basic-500 hover:bg-basic-100'
                      }`}
                    >
                      <AiOutlineBars className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 匯出匯入 */}
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="p-2 text-basic-400 hover:text-basic-500 border border-basic-200 rounded-lg hover:bg-basic-100 transition-colors"
                    title="匯出資料"
                  >
                    <AiOutlineDownload className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleImportData}
                    className="p-2 text-basic-400 hover:text-basic-500 border border-basic-200 rounded-lg hover:bg-basic-100 transition-colors"
                    title="匯入資料"
                  >
                    <AiOutlineUpload className="h-4 w-4" />
                  </button>

                  {/* 建立新實踐 */}
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors body-sm font-medium"
                  >
                    <AiOutlinePlus className="h-4 w-4" />
                    <span>建立實踐</span>
                  </button>
                </div>
              </div>

              {/* 搜尋欄 */}
              <div className="bg-white rounded-lg shadow-sm border border-basic-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="heading-sm text-basic-black">搜尋實踐</h3>
                  <span className="body-sm text-basic-400">快速找到您的學習項目</span>
                </div>
                <SearchInput
                  value={filter.searchTerm || ''}
                  onChange={(value) => setFilter({ searchTerm: value })}
                  placeholder="輸入關鍵字搜尋實踐項目、小目標或學習資源..."
                  className="w-full max-w-2xl"
                />
              </div>
            </div>

            {/* 篩選器 */}
            <div className="bg-white rounded-lg shadow-sm border border-basic-200 mb-6">
              <FilterBar
                filter={filter}
                onFilterChange={setFilter}
                onResetFilter={resetFilter}
                totalCount={practices.length}
                filteredCount={filteredPractices.length}
              />
            </div>

            {/* 實踐列表 */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-base" />
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <AiOutlineExclamationCircle className="h-12 w-12 text-alert mx-auto mb-4" />
                    <p className="text-basic-400 body-md">{error}</p>
                  </div>
                </div>
              ) : filteredPractices.length === 0 ? (
                <div className="text-center py-16">
                  {practices.length === 0 ? (
                    <div className="max-w-md mx-auto">
                      <h3 className="heading-md text-basic-500 mb-2">尚未建立任何實踐</h3>
                      <p className="body-md text-basic-400 mb-6">開始你的第一個學習實踐吧！</p>
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-base text-white rounded-lg hover:bg-primary-darker transition-colors body-md font-medium"
                      >
                        <AiOutlinePlus className="h-5 w-5" />
                        <span>建立第一個實踐</span>
                      </button>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <h3 className="heading-md text-basic-500 mb-2">沒有找到符合條件的實踐</h3>
                      <p className="body-md text-basic-400 mb-4">請調整搜尋條件或篩選器</p>
                      <button
                        type="button"
                        onClick={resetFilter}
                        className="text-primary-base hover:text-primary-darker body-md"
                      >
                        清除所有篩選
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}
                >
                  {filteredPractices.map((practice) => (
                    <PracticeCard
                      key={practice.id}
                      practice={practice}
                      onView={handlePracticeView}
                      onEdit={handlePracticeEdit}
                      onDelete={handlePracticeDelete}
                      onCheckIn={handlePracticeCheckIn}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 刪除確認對話框 */}
      <DeleteConfirm
        practice={practiceToDelete}
        isOpen={deleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleting}
      />
    </>
  );
};

// 使用 Provider 包裝的主組件
const PracticeListPage: React.FC = () => {
  return (
    <PracticeProvider>
      <PracticeListApp />
    </PracticeProvider>
  );
};

export default PracticeListPage;
