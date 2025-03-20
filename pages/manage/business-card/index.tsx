import React, { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import Tab from '@mui/material/Tab';
import { TabContext } from '@mui/lab';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import toast from 'react-hot-toast';
import { CiEdit } from 'react-icons/ci';
import { FaSave } from 'react-icons/fa';
import { PiCardsLight } from 'react-icons/pi';

import getManageLayout from '@/layout/ManageLayout';
import SEOConfig from '@/shared/components/SEO';
import Button from '@/shared/components/Button';
import BusinessCard from '@/components/portfolio/BusinessCard';
import { BusinessCardInfo, BusinessCardVariant } from '@/types/portfolio/BusinessCard';

const BusinessCardManagePage = () => {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedVariant, setSelectedVariant] = useState<BusinessCardVariant>('minimal');

  const [formData, setFormData] = useState<BusinessCardInfo>({
    name: "王小明",
    tagline: "全端工程師 | AI 技術愛好者",
    professionalAreas: ["Web Development", "AI/ML", "UI/UX"],
    skills: ["React", "Node.js", "Python", "TensorFlow"],
    contactInfo: {
      line: "wang_dev",
      linkedin: "wang-dev",
      email: "wang@example.com",
      telegram: "wang_dev",
    },
    status: {
      isActive: true,
      label: "開放合作機會",
    },
    ctaButtons: [
      {
        label: "查看作品集",
        action: "view_portfolio",
        url: "/portfolio",
      },
      {
        label: "立即合作",
        action: "collaborate",
        url: "/contact",
      },
    ],
    recommendations: [
      {
        author: "陳小華",
        content: "小明在我們的AI專案中展現了優秀的技術能力和團隊合作精神。他不僅能夠快速掌握新技術，還能有效地解決複雜問題。",
        date: "2025-02-15",
      },
      {
        author: "李大方",
        content: "作為專案經理，我很欣賞小明的主動性和責任感。他總是能夠按時完成任務，並提出創新的解決方案。",
        date: "2025-01-20",
      },
    ],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newArea, setNewArea] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const parentKey = parent as keyof BusinessCardInfo;
      const parentValue = formData[parentKey];

      // 確保 parentValue 是物件
      if (parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue)) {
        setFormData({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;

    setFormData({
      ...formData,
      status: {
        ...formData.status,
        isActive: checked,
      },
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addProfessionalArea = () => {
    if (newArea.trim() && !formData.professionalAreas.includes(newArea.trim())) {
      setFormData({
        ...formData,
        professionalAreas: [...formData.professionalAreas, newArea.trim()],
      });
      setNewArea('');
    }
  };

  const removeProfessionalArea = (area: string) => {
    setFormData({
      ...formData,
      professionalAreas: formData.professionalAreas.filter((a) => a !== area),
    });
  };

  const handleSave = () => {
    // 在此處新增儲存到資料庫或API的邏輯
    toast.success('名片資料已成功儲存！');
  };

  const SEOData = useMemo(() => ({
    title: '管理個人名片｜島島阿學',
    description: '管理您的個人專業名片，展示您的技能、經驗和聯繫方式。',
    keywords: '島島阿學, 個人名片, 專業技能, 作品集',
    author: '島島阿學',
    copyright: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${pathname}`,
  }), [pathname]);

  return (
    <>
      <SEOConfig data={SEOData} />

      <div className="mb-6 p-2 flex items-center justify-between">
        <h2 className="heading-sm text-basic-500">個人名片管理</h2>
        <Button
          variant="solid"
          color="primary"
          onClick={handleSave}
          className="flex items-center gap-1"
        >
          <FaSave className="size-4" />
          儲存
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg shadow-basic-200/40 p-6 mb-6">
        <TabContext value={activeTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <TabList onChange={(_, newValue) => setActiveTab(newValue)} aria-label="名片管理標籤">
              <Tab icon={<PiCardsLight />} iconPosition="start" label="預覽" value="preview" />
              <Tab icon={<CiEdit />} iconPosition="start" label="編輯" value="edit" />
            </TabList>
          </Box>

          <TabPanel value="preview" sx={{ p: 0 }}>
            <div>
              <div className="mb-6">
                <h3 className="heading-sm mb-3">選擇名片風格</h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant={selectedVariant === 'minimal' ? 'solid' : 'outline'}
                    color={selectedVariant === 'minimal' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedVariant('minimal')}
                  >
                    極簡風
                  </Button>
                  <Button
                    variant={selectedVariant === 'creative' ? 'solid' : 'outline'}
                    color={selectedVariant === 'creative' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedVariant('creative')}
                  >
                    創意風
                  </Button>
                  <Button
                    variant={selectedVariant === 'business' ? 'solid' : 'outline'}
                    color={selectedVariant === 'business' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedVariant('business')}
                  >
                    商務風
                  </Button>
                  <Button
                    variant={selectedVariant === 'tech' ? 'solid' : 'outline'}
                    color={selectedVariant === 'tech' ? 'primary' : 'secondary'}
                    onClick={() => setSelectedVariant('tech')}
                  >
                    技術風
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <BusinessCard info={formData} variant={selectedVariant} />
              </div>
            </div>
          </TabPanel>

          <TabPanel value="edit" sx={{ p: 0 }}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="heading-sm mb-3">基本資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      姓名
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
                      標語
                      <input
                        id="tagline"
                        type="text"
                        name="tagline"
                        value={formData.tagline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="heading-sm mb-3">專業領域</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.professionalAreas.map((area) => (
                    <div key={`area-${area}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeProfessionalArea(area)}
                        className="ml-2 text-blue-800 hover:text-blue-900"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    id="newArea"
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                    placeholder="新增專業領域"
                  />
                  <Button
                    variant="solid"
                    color="primary"
                    onClick={addProfessionalArea}
                    className="rounded-l-none"
                  >
                    新增
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="heading-sm mb-3">技能</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map((skill) => (
                    <div key={`skill-${skill}`} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-green-800 hover:text-green-900"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    id="newSkill"
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md rounded-r-none focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                    placeholder="新增技能"
                  />
                  <Button
                    variant="solid"
                    onClick={addSkill}
                    className="rounded-l-none"
                  >
                    新增
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="heading-sm mb-3">聯絡資訊</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                      <input
                        id="contactInfo.email"
                        type="email"
                        name="contactInfo.email"
                        value={formData.contactInfo.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="contactInfo.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn
                      <input
                        id="contactInfo.linkedin"
                        type="text"
                        name="contactInfo.linkedin"
                        value={formData.contactInfo.linkedin}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="contactInfo.line" className="block text-sm font-medium text-gray-700 mb-1">
                      LINE
                      <input
                        id="contactInfo.line"
                        type="text"
                        name="contactInfo.line"
                        value={formData.contactInfo.line}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                  <div>
                    <label htmlFor="contactInfo.telegram" className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram
                      <input
                        id="contactInfo.telegram"
                        type="text"
                        name="contactInfo.telegram"
                        value={formData.contactInfo.telegram}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="heading-sm mb-3">狀態</h3>
                <div className="flex items-center mb-3">
                  <label htmlFor="status-isActive" className="ml-2 block text-sm text-gray-900">
                    <input
                      type="checkbox"
                      id="status-isActive"
                      name="status.isActive"
                      checked={formData.status.isActive}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-base border-gray-300 rounded focus:ring-primary-base"
                    />
                    顯示為可用狀態
                  </label>
                </div>
                <div>
                  <label htmlFor="status.label" className="block text-sm font-medium text-gray-700 mb-1">
                    狀態標籤
                    <input
                      id="status.label"
                      type="text"
                      name="status.label"
                      value={formData.status.label}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                      placeholder="例如：開放合作機會"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h3 className="heading-sm mb-3">行動按鈕</h3>
                {formData.ctaButtons.map((button) => {
                  // 生成一個唯一的ID
                  const uniqueButtonId = `button-${button.label || ''}-${button.action || ''}-${Math.random().toString(36).slice(2)}`;
                  return (
                    <div key={uniqueButtonId} className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label htmlFor={`label-${uniqueButtonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          按鈕文字
                          <input
                            id={`label-${uniqueButtonId}`}
                            type="text"
                            value={button.label}
                            onChange={(e) => {
                              const updatedButtons = [...formData.ctaButtons];
                              const index = formData.ctaButtons.indexOf(button);
                              updatedButtons[index].label = e.target.value;
                              setFormData({
                                ...formData,
                                ctaButtons: updatedButtons
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                          />
                        </label>
                      </div>
                      <div>
                        <label htmlFor={`action-${uniqueButtonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          動作類型
                          <input
                            id={`action-${uniqueButtonId}`}
                            type="text"
                            value={button.action}
                            onChange={(e) => {
                              const updatedButtons = [...formData.ctaButtons];
                              const index = formData.ctaButtons.indexOf(button);
                              updatedButtons[index].action = e.target.value;
                              setFormData({
                                ...formData,
                                ctaButtons: updatedButtons
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                          />
                        </label>
                      </div>
                      <div>
                        <label htmlFor={`url-${uniqueButtonId}`} className="block text-sm font-medium text-gray-700 mb-1">
                          URL
                          <input
                            id={`url-${uniqueButtonId}`}
                            type="text"
                            value={button.url}
                            onChange={(e) => {
                              const updatedButtons = [...formData.ctaButtons];
                              const index = formData.ctaButtons.indexOf(button);
                              updatedButtons[index].url = e.target.value;
                              setFormData({
                                ...formData,
                                ctaButtons: updatedButtons
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-base focus:border-transparent"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      ctaButtons: [
                        ...formData.ctaButtons,
                        {
                          label: "",
                          action: "",
                          url: "",
                        }
                      ]
                    });
                  }}
                >
                  新增按鈕
                </Button>
              </div>
            </div>
          </TabPanel>
        </TabContext>
      </div>
    </>
  );
};

BusinessCardManagePage.getLayout = (page: React.ReactElement) => getManageLayout(page);

export default BusinessCardManagePage;
