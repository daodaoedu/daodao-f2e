import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "./components/Container";
import { ExploreTabs } from "./components/ExploreTabs";
import { IdeaCard } from "./components/IdeaCard";
import { PracticeCard } from "./components/PracticeCard";
import { PlanCard } from "./components/PlanCard";

export function PersonalDashboard() {
  const [activeExploreTab, setActiveExploreTab] = useState('推薦');
  const [searchQuery, setSearchQuery] = useState('');
   // TODO: Implement search functionality
   console.log(setSearchQuery); // Temporary to avoid unused variable warning
  const [isSearching, setIsSearching] = useState(false);

  // Mock data - in real app would come from API
  const mockIdea = {
    id: '1',
    author: {
      name: '林小明',
      tags: ['UX設計師', '產品經理']
    },
    content: 'this is an idea',
    tags: ['程式設計', '資料科學'],
    link: 'test',
    publishDate: '01/06/2025',
    likes: 3,
    comments: 2
  };

  const mockPractice = {
    id: '2',
    title: 'UI/UX 設計思維實戰',
    author: {
      name: '李設計',
      tags: ['UX設計師', '設計思維']
    },
    description: '深入了解用戶體驗設計流程，從研究到原型製作',
    tags: ['用戶研究', 'Figma', '設計思維'],
    publishDate: '25/05/2025 - 18/06/2025',
    participants: 189,
    comments: 2,
    progress: 65,
    streak: 7,
    status: '進行中' as const,
    category: '書籍'
  };

  const mockPlan = {
    id: '3',
    title: '全端開發工程師養成計劃',
    author: {
      name: '陳老師',
      tags: ['全端工程師', '技術導師']
    },
    description: '從零基礎到獨立開發完整網路應用，涵蓋前端、後端、資料庫設計與部署',
    tags: ['React', 'Node.js', 'MongoDB', '系統設計'],
    publishDate: '20/05/2025 - 20/09/2025',
    participants: 67,
    comments: 8,
    progress: 42,
    streak: 12,
    status: '進行中' as const
  };

  const handleCreateNew = (type: string) => {
    console.log('Creating new:', type);
    // In real app, would navigate to creation form
  };

  const handleCardAction = (action: string, id: string) => {
    console.log(`${action} for item:`, id);
    // In real app, would handle the specific action
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-basic-black mb-2">搜尋結果</h2>
              <p className="text-basic-300">關於 "{searchQuery}" 的結果</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsSearching(false)}
              className="px-4 py-2 text-primary-base hover:text-primary-darker font-medium hover:bg-primary-lightest rounded-lg"
            >
              返回瀏覽
            </Button>
          </div>
          <div className="space-y-8">
            <p className="text-basic-300">搜尋結果將顯示於此：{searchQuery}</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <ExploreTabs
          activeTab={activeExploreTab}
          onTabChange={setActiveExploreTab}
          onCreateNew={handleCreateNew}
        />

        <div className="space-y-8 mb-16">
          {/* Ideas */}
          {(activeExploreTab === '推薦' || activeExploreTab === '想法') && (
            <div className="flex flex-col items-center space-y-6">
              <IdeaCard
                idea={mockIdea}
                onLike={(id) => handleCardAction('like', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}

          {/* Practices */}
          {(activeExploreTab === '推薦' || activeExploreTab === '主題實踐') && (
            <div className="flex flex-col items-center space-y-6">
              <PracticeCard
                practice={mockPractice}
                onJoin={(id) => handleCardAction('join', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}

          {/* Plans */}
          {activeExploreTab === '學習計劃' && (
            <div className="flex flex-col items-center space-y-6">
              <PlanCard
                plan={mockPlan}
                onJoin={(id) => handleCardAction('join', id)}
                onComment={(id) => handleCardAction('comment', id)}
                onShare={(id) => handleCardAction('share', id)}
                onSave={(id) => handleCardAction('save', id)}
                onReport={(id) => handleCardAction('report', id)}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-basic-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Container>
          {renderContent()}
        </Container>
      </main>
    </div>
  );
}
