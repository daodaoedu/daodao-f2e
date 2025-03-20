import React, { FC } from 'react';
import styles from '@/styles/explore.module.css';

interface ProjectsContentProps {
  onProjectClick: (projectId: string) => void;
}

const ProjectsContent: FC<ProjectsContentProps> = ({ onProjectClick }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">學習計畫</h1>
      <p className="text-lg text-gray-600 mb-8">探索各種學習計畫，獲取靈感與方法</p>

      {/* 引入 Projects 頁面的內容，但包裝在 div 內以保持樣式絕密性 */}
      <div className={`${styles['projects-container']} ${styles['dynamic-content-container']}`}>
        {/* 動態導入 ProjectsComponent */}
        {React.createElement(
          require('@/pages/projects').default,
          {
            path: "/explore",
            onProjectClick: onProjectClick
          }
        )}
      </div>
    </div>
  );
};

export default ProjectsContent;