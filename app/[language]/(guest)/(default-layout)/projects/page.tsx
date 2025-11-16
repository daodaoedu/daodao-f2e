import { Metadata } from 'next';
import { ProjectListPageWidget } from '@/widgets/projects';
import {
  getPublicProjectListData,
  type ProjectListResponse,
  transformProjectSchemaToProject,
} from '@/entities/project';
import type { ProjectSchema } from '@/services/projects/core/schema';

export const metadata: Metadata = {
  title: '學習計畫分享區｜島島阿學',
};

export default async function ProjectsPage() {
  let data: ProjectListResponse | undefined;

  try {
    const [, response] = await getPublicProjectListData();
    // openapi-fetch 返回的 response.data 是 API 響應的完整對象
    // 對於 projects/public API，格式為 { success: boolean, data: ProjectSchema[] }
    const responseData = response?.data as
      | { success?: boolean; data?: ProjectSchema[] }
      | undefined;

    if (
      responseData &&
      'data' in responseData &&
      Array.isArray(responseData.data) &&
      responseData.data.length > 0
    ) {
      // 轉換 ProjectSchema 為 Project 類型
      const projects = responseData.data.map(transformProjectSchemaToProject);
      data = { data: projects };
    }
  } catch {
    // Error handling: data will be undefined if API call fails
  }

  return <ProjectListPageWidget data={data} isLoading={false} />;
}
