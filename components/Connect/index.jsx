import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoGraph, GoRocket, GoPeople } from 'react-icons/go';
import Button from '@/shared/components/Button';
import { v4 as uuidv4 } from 'uuid';

function Connect() {
  const router = useRouter();
  const [connectTab, setConnectTab] = useState('circles');
  const uniqueId = uuidv4();

  // 使用島島阿學的現有配色方案
  const colors = {
    primary: '#16B9B3', // primary.base
    secondary: '#FF9526', // tips
    accent: '#86C84A', // success
    dark: '#293A3D', // basic.500
    light: '#F3FCFC', // primary.palest
  };

  // 學習圈組資料
  const LEARNING_CIRCLES = [
    {
      title: "用戶體驗設計社群",
      members: 126,
      activity: "高",
      activityColor: colors.primary,
      description: "專為 UX 設計師打造的社群，分享作品、提供反饋、共同成長。",
      color: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`
    },
    {
      title: "資料科學讀書會",
      members: 78,
      activity: "中",
      activityColor: colors.secondary,
      description: "每週定期聚會討論資料科學專案與挑戰。",
      color: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.dark} 100%)`
    }
  ];

  // 近期活動資料
  const RECENT_EVENTS = [
    {
      title: "Python 資料分析工作坊",
      date: "2025/4/15",
      time: "19:00-21:00",
      type: "線上",
      description: "從基礎開始學習如何使用 Python 進行資料分析與視覺化",
      icon: <GoGraph size={24} />,
      color: "bg-primary-base"
    },
    {
      title: "斜槓創業讀書會",
      date: "2025/4/20",
      time: "14:00-16:00",
      type: "線下",
      description: "探討如何在數位時代打造個人品牌與多元收入來源",
      icon: <GoRocket size={24} />,
      color: "bg-primary-dark"
    },
    {
      title: "永續設計思考工作坊",
      date: "2025/4/26",
      time: "10:00-16:00",
      type: "線下",
      description: "學習如何將永續理念融入設計思考過程，創造更有社會影響力的作品",
      icon: <GoPeople size={24} />,
      color: "bg-primary-base"
    }
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-center">連結社群</h1>
      <div className="bg-white rounded-lg shadow p-4">
        {/* 子導航標籤 */}
        <div className="flex space-x-4 border-b mb-6">
          <Button
            className={`px-3 py-2 ${connectTab === 'circles' ? 'border-b-2 font-medium' : ''}`}
            style={{
              borderColor: connectTab === 'circles' ? colors.primary : 'transparent',
              color: connectTab === 'circles' ? colors.primary : 'rgb(75, 85, 99)'
            }}
            onClick={() => setConnectTab('circles')}
          >
            圈組 Circles
          </Button>
          <Button
            className={`px-3 py-2 ${connectTab === 'events' ? 'border-b-2 font-medium' : ''}`}
            style={{
              borderColor: connectTab === 'events' ? colors.primary : 'transparent',
              color: connectTab === 'events' ? colors.primary : 'rgb(75, 85, 99)'
            }}
            onClick={() => setConnectTab('events')}
          >
            活動 Events
          </Button>
        </div>

        {connectTab === 'circles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LEARNING_CIRCLES.map((circle) => (
              <div key={circle.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-all">
                <div className="h-24 relative" style={{ background: circle.color }}>
                  <div className="absolute bottom-0 left-0 w-full p-3 text-white font-bold">
                    {circle.title}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-3">
                    <span>{circle.members} 成員</span>
                    <span style={{ color: circle.activityColor }}>{circle.activity}活躍度</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    {circle.description}
                  </p>
                  <Button
                    as="button"
                    onClick={() => router.push('/group')}
                    className="w-full"
                    variant="outline"
                    color="primary"
                    size="sm"
                  >
                    加入圈組
                  </Button>
                </div>
              </div>
            ))}

            <div className="border border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${colors.light}30`, color: colors.primary }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="font-bold mb-1">創建新圈組</p>
              <p className="text-gray-600 text-sm text-center">
                圍繞任何主題開始您自己的學習社群
              </p>
            </div>
          </div>
        )}

        {connectTab === 'events' && (
          <div className="space-y-4">
            {RECENT_EVENTS.map((event) => (
              <div key={uniqueId} className="border rounded-lg p-4 flex items-center">
                <div
                  className="p-2 rounded mr-4 text-center"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <div className="text-xs" style={{ color: colors.primary }}>{event.date.split('/')[1]}月</div>
                  <div className="text-lg font-bold" style={{ color: colors.primary }}>{event.date.split('/')[2]}</div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold mb-1">{event.title}</h4>
                  <p className="text-xs text-gray-500">{event.time} • {event.type}</p>
                </div>
                <Button
                  as="button"
                  onClick={() => router.push('/activities')}
                  variant="outline"
                  color="primary"
                  size="sm"
                >報名
                </Button>
              </div>
            ))}

            <div className="text-center mt-6">
              <Button
                as="button"
                onClick={() => router.push('/activities/create')}
                variant="solid"
                color="primary"
                size="md"
              >
                建立活動
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Connect;
