import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useAuth } from '@/contexts/Auth';
import SEOConfig from '@/shared/components/SEO';
import getDefaultLayout from '@/layout/DefaultLayout';
import { cn } from '@/utils/cn';

// 日期選擇組件
const DateSelector = ({ label, value, onChange }) => {
  const dateValue = value ? dayjs(value) : null;

  // 產生年份選項
  const years = [];
  const currentYear = dayjs().year();
  for (let i = currentYear - 1; i <= currentYear + 5; i += 1) {
    years.push(i);
  }

  // 產生月份選項
  const months = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
    { value: 11, label: '11' },
    { value: 12, label: '12' }
  ];

  // 產生日期選項
  const getDaysInMonth = (year, month) => {
    return dayjs(`${year}-${month}-01`).daysInMonth();
  };

  const days = [];
  if (dateValue) {
    const daysInMonth = getDaysInMonth(dateValue.year(), dateValue.month() + 1);
    for (let i = 1; i <= daysInMonth; i += 1) {
      days.push(i);
    }
  }

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    const newDate = dateValue.year(newYear);
    onChange(newDate);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10) - 1; // dayjs 月份從 0 開始
    let newDate = dateValue.month(newMonth);

    // 檢查日期是否超過當月天數
    const daysInNewMonth = getDaysInMonth(newDate.year(), newMonth + 1);
    if (newDate.date() > daysInNewMonth) {
      newDate = newDate.date(daysInNewMonth);
    }

    onChange(newDate);
  };

  const handleDayChange = (e) => {
    const newDay = parseInt(e.target.value, 10);
    const newDate = dateValue.date(newDay);
    onChange(newDate);
  };

  return (
    <div className="mb-6">
      <label htmlFor={`${label.toLowerCase().replace(/\s/g, '-')}`} className="block text-basic-400 font-medium mb-2">{label}</label>
      <div className="flex gap-2">
        <select
          id={`${label.toLowerCase().replace(/\s/g, '-')}-year`}
          value={dateValue ? dateValue.year() : ''}
          onChange={handleYearChange}
          className="p-2 border border-basic-200 rounded-lg flex-1"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>

        <select
          id={`${label.toLowerCase().replace(/\s/g, '-')}-month`}
          value={dateValue ? dateValue.month() + 1 : ''}
          onChange={handleMonthChange}
          className="p-2 border border-basic-200 rounded-lg flex-1"
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>{month.label}月</option>
          ))}
        </select>

        <select
          id={`${label.toLowerCase().replace(/\s/g, '-')}-day`}
          value={dateValue ? dateValue.date() : ''}
          onChange={handleDayChange}
          className="p-2 border border-basic-200 rounded-lg flex-1"
        >
          {days.map((day) => (
            <option key={day} value={day}>{day}日</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// 主組件
const CreateLearningPlanPage = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '閱讀書籍',
    startDate: dayjs(),
    endDate: dayjs().add(30, 'day'),
    tasks: [],
  });
  const [newTask, setNewTask] = useState('');
  const [errors, setErrors] = useState({});

  // 檢查是否登入
  useEffect(() => {
    if (!isLoggedIn && typeof window !== 'undefined') {
      router.push('/signin');
    }
  }, [isLoggedIn, router]);

  // 計劃類型選項
  const planTypes = ['閱讀書籍', '線上課程', '技能學習', '專案開發', '其他'];

  // 表單改變處理
  const handleFormChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });

    // 清除對應的錯誤提示
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // 添加任務
  const handleAddTask = () => {
    if (!newTask.trim()) return;

    setFormData({
      ...formData,
      tasks: [...formData.tasks, {
        id: Date.now().toString(),
        content: newTask,
        completed: false,
        checkIns: []
      }]
    });

    setNewTask('');

    // 清除任務相關錯誤
    if (errors.tasks) {
      const newErrors = { ...errors };
      delete newErrors.tasks;
      setErrors(newErrors);
    }
  };

  // 刪除任務
  const handleRemoveTask = (index) => {
    const newTasks = [...formData.tasks];
    newTasks.splice(index, 1);
    setFormData({
      ...formData,
      tasks: newTasks
    });
  };

  // 表單驗證
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '請輸入計劃名稱';
    }

    if (formData.tasks.length === 0) {
      newErrors.tasks = '請至少添加一個任務';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表單
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // 創建新計劃對象
      const newPlan = {
        id: Date.now().toString(),
        ...formData,
        createdAt: dayjs(),
      };

      // 從本地儲存獲取現有計劃
      const savedPlans = localStorage.getItem('learning-plans');
      const existingPlans = savedPlans ? JSON.parse(savedPlans) : [];

      // 添加新計劃
      const updatedPlans = [...existingPlans, {
        ...newPlan,
        startDate: newPlan.startDate.format(),
        endDate: newPlan.endDate.format(),
        createdAt: newPlan.createdAt.format(),
      }];

      // 保存到本地儲存
      localStorage.setItem('learning-plans', JSON.stringify(updatedPlans));

      // 導航到計劃詳情頁面
      router.push(`/learning-plan/${newPlan.id}`);
    } catch (error) {
      console.error('Error creating plan:', error);
      setErrors({ submit: '創建計劃時發生錯誤，請稍後再試' });
    } finally {
      setLoading(false);
    }
  };

  // SEO 資料
  const SEOData = {
    title: '創建學習計劃 | 島島阿學',
    description: '建立你的學習計劃，設定學習目標並追蹤進度。',
    keywords: '學習計劃, 學習進度, 學習打卡, 自主學習, 島島阿學',
    author: '島島阿學',
    imgLink: 'https://www.daoedu.tw/preview.webp',
    link: `${process.env.HOSTNAME}${router?.asPath}`,
  };

  if (!isLoggedIn) {
    return (
      <>
        <SEOConfig data={SEOData} />
        <div className="bg-[#EEF9F9] min-h-screen">
          <div className="mx-auto w-[670px] max-w-full px-4 py-8 md:py-28">
            <div className="text-center">
              <p>正在檢查登入狀態...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOConfig data={SEOData} />
      <div className="bg-[#EEF9F9] min-h-screen">
        <div className="mx-auto w-[670px] max-w-full px-4 py-8 md:py-28">
          <div className="mb-4">
            <Link
              href="/learning-plan"
              className="inline-flex items-center gap-1 text-primary-base hover:text-primary-darker"
            >
              <ArrowBack fontSize="small" />
              <span>返回計劃列表</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-basic-500 mb-6">創建學習計劃</h1>

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-[20px] p-6 mb-6">
              <h2 className="text-lg font-bold text-basic-500 mb-4">基本資訊</h2>

              <div className="mb-6">
                <label htmlFor="plan-title" className="block text-basic-400 font-medium mb-2">
                  計劃名稱 <span className="text-red-500">*</span>
                  <input
                    id="plan-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={cn(
                      "w-full p-3 border rounded-lg",
                      errors.title ? "border-red-500" : "border-basic-200"
                    )}
                    placeholder="例如：JavaScript 基礎學習計劃"
                  />
                </label>
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div className="mb-6">
                <label htmlFor="plan-type" className="block text-basic-400 font-medium mb-2">
                  計劃類型
                  <select
                    id="plan-type"
                    value={formData.type}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                    className="w-full p-3 border border-basic-200 rounded-lg"
                  >
                    {planTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mb-6">
                <label htmlFor="plan-description" className="block text-basic-400 font-medium mb-2">
                  計劃描述
                  <textarea
                    id="plan-description"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="w-full p-3 border border-basic-200 rounded-lg min-h-[120px]"
                    placeholder="描述你的學習計劃目標和內容..."
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateSelector
                  label="開始日期"
                  value={formData.startDate}
                  onChange={(value) => handleFormChange('startDate', value)}
                />

                <DateSelector
                  label="結束日期"
                  value={formData.endDate}
                  onChange={(value) => handleFormChange('endDate', value)}
                  _minDate={formData.startDate}
                />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-6 mb-6">
              <h2 className="text-lg font-bold text-basic-500 mb-4">任務清單</h2>

              <div className="mb-6">
                <label htmlFor="new-task" className="block text-basic-400 font-medium mb-2">
                  添加任務 <span className="text-red-500">*</span>
                  <div className="flex gap-2">
                    <input
                      id="new-task"
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTask();
                        }
                      }}
                      className={cn(
                        "flex-1 p-3 border rounded-lg",
                        errors.tasks ? "border-red-500" : "border-basic-200"
                      )}
                      placeholder="輸入任務內容..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="px-4 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker flex items-center gap-1"
                    >
                      <Add fontSize="small" />
                      <span>添加</span>
                    </button>
                  </div>
                </label>
                {errors.tasks && (
                  <p className="text-red-500 text-sm mt-1">{errors.tasks}</p>
                )}
              </div>

              <div className="border border-basic-100 rounded-lg divide-y">
                {formData.tasks.length > 0 ? (
                  formData.tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <span className="text-basic-300 mr-2">{index + 1}.</span>
                        <span className="text-basic-500">{task.content}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="text-basic-300 hover:text-red-500"
                      >
                        <Delete fontSize="small" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-basic-300">
                    <p>請添加至少一個任務</p>
                  </div>
                )}
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-lg mb-6">
                {errors.submit}
              </div>
            )}

            <div className="flex justify-end gap-4 mb-6">
              <Link
                href="/learning-plan"
                className="px-5 py-2 border border-basic-200 rounded-lg text-basic-400 hover:bg-basic-50"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-primary-base text-white rounded-lg hover:bg-primary-darker disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>處理中...</span>
                  </>
                ) : '建立計劃'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

CreateLearningPlanPage.getLayout = getDefaultLayout;

export default CreateLearningPlanPage;
