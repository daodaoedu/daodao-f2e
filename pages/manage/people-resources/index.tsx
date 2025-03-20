import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';

import getManageLayout from '@/layout/ManageLayout';
import SEOConfig from '@/shared/components/SEO';
import Button from '@/shared/components/Button';
import BusinessCardList from '@/components/portfolio/BusinessCardList';
import { BusinessCardVariant, BusinessCardInfo } from '@/types/portfolio/BusinessCard';

// 導入自定義元件和模擬資料
import FilterControls from '@/components/people-resources/FilterControls';
import AdvancedFilters from '@/components/people-resources/AdvancedFilters';
import CardStyleSelector from '@/components/people-resources/CardStyleSelector';
import EmptyResults from '@/components/people-resources/EmptyResults';
import { mockBusinessCards, getFilterOptions } from '@/components/people-resources/mockData';

const PeopleResourcesPage = () => {
  const pathname = usePathname();
  const { skillOptions, areaOptions, statusOptions } = getFilterOptions();

  // 狀態管理
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("全部");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<BusinessCardVariant>('minimal');

  // 判斷是否有活躍篩選條件
  const hasActiveFilters = useMemo(() => {
    return selectedSkills.length > 0 || selectedAreas.length > 0 || selectedStatus !== "全部" || searchTerm !== '';
  }, [searchTerm, selectedSkills, selectedAreas, selectedStatus]);

  // 過濾後的名片
  const filteredCards = useMemo(() => {
    return mockBusinessCards.filter((card) => {
      // 搜尋詞過濾
      const searchTermMatch =
        searchTerm === '' ||
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.tagline.toLowerCase().includes(searchTerm.toLowerCase());

      // 技能過濾
      const skillsMatch =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => card.skills.includes(skill));

      // 專業領域過濾
      const areasMatch =
        selectedAreas.length === 0 ||
        selectedAreas.some((area) => card.professionalAreas.includes(area));

      // 狀態過濾
      const statusMatch =
        selectedStatus === "全部" ||
        (selectedStatus === "開放合作" && card.status.isActive) ||
        (selectedStatus === "不可用" && !card.status.isActive);

      return searchTermMatch && skillsMatch && areasMatch && statusMatch;
    });
  }, [searchTerm, selectedSkills, selectedAreas, selectedStatus]);

  // 處理名片按鈕點擊
  const handleCardButtonClick = (action: string, url: string, cardInfo: BusinessCardInfo) => {
    toast(`點擊了 ${cardInfo.name} 的 ${action} 按鈕`);
    // 可以根據動作類型做不同處理
    window.open(url, '_blank');
  };

  // 處理技能選擇
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  // 處理專業領域選擇
  const handleAreaToggle = (area: string) => {
    setSelectedAreas((prev) =>
      prev.includes(area)
        ? prev.filter((a) => a !== area)
        : [...prev, area]
    );
  };

  // 重置所有過濾器
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setSelectedAreas([]);
    setSelectedStatus("全部");
  };

  // SEO 配置
  const SEOData = useMemo(() => ({
    title: '人脈資源庫｜島島阿學',
    description: '瀏覽並管理您的人脈資源，尋找合適的專業人才與合作夥伴。',
    keywords: '島島阿學, 人脈資源, 專業人才, 合作夥伴',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${pathname}`,
  }), [pathname]);

  return (
    <>
      <SEOConfig data={SEOData} />

      {/* 頁面標題區 */}
      <div className="mb-6 p-2 flex items-center justify-between">
        <h2 className="heading-sm text-basic-500">人脈資源庫</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            color="gray"
            onClick={() => toast('匯出資源功能建設中')}
            className="flex items-center gap-1"
          >
            <FiDownload className="text-lg" />
            匯出資源
          </Button>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="bg-white rounded-xl shadow-lg shadow-basic-200/40 p-6 mb-6">
        {/* 篩選控制區 */}
        <FilterControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
          statusOptions={statusOptions}
        />

        {/* 進階篩選面板 */}
        {showFilters && (
          <AdvancedFilters
            areaOptions={areaOptions}
            skillOptions={skillOptions}
            selectedAreas={selectedAreas}
            selectedSkills={selectedSkills}
            onAreaToggle={handleAreaToggle}
            onSkillToggle={handleSkillToggle}
          />
        )}

        {/* 卡片風格選擇器 */}
        <CardStyleSelector
          selectedVariant={selectedVariant}
          setSelectedVariant={setSelectedVariant}
          filteredCardsCount={filteredCards.length}
        />

        {/* 人脈卡片列表或空結果顯示 */}
        {filteredCards.length > 0 ? (
          <BusinessCardList
            cards={filteredCards}
            variant={selectedVariant}
            onCardButtonClick={handleCardButtonClick}
            className="mt-6"
          />
        ) : (
          <EmptyResults onResetFilters={handleResetFilters} />
        )}
      </div>
    </>
  );
};

PeopleResourcesPage.getLayout = (page: React.ReactElement) => getManageLayout(page);

export default PeopleResourcesPage;
