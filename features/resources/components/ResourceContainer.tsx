import { NotionDatabaseResultSchema } from '@/services/modules/notion';
import { cn } from '@/utils/cn';
import ResourceCard from './ResourceCard';

interface ResourceContainerProps {
  data: NotionDatabaseResultSchema['results'];
  className?: string;
}

function ResourceContainer(props: ResourceContainerProps) {
  const { data, className } = props;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {data?.map((resource) => (
        <ResourceCard
          key={resource.id}
          title={resource.properties?.['資源名稱']?.title?.[0]?.plain_text ?? ''}
          content={resource.properties?.['介紹']?.rich_text?.[0]?.plain_text ?? ''}
          tags={resource.properties?.['領域名稱']?.multi_select?.map(
            (cat) => cat.name
          )}
          userName={resource.properties?.['創建者']?.multi_select[0]?.name ?? ''}
          coverImageUrl={resource.properties?.['縮圖']?.files[0]?.name ?? ''}
          time={resource.created_time}
          level={resource.properties?.['年齡層']?.multi_select[0]?.name ?? ''}
          commentCount={0}
        />
      ))}
    </div>
  );
}

export default ResourceContainer;
