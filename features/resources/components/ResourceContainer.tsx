import {
  ResourceListResponseSchema,
  resourceSchema,
} from "@/services/resources";
import { cn } from "@/utils/cn";
import ResourceCard from "./ResourceCard";

interface ResourceContainerProps {
  data: ResourceListResponseSchema["resources"];
  className?: string;
}

function ResourceContainer({ data, className }: ResourceContainerProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {Array.isArray(data) &&
        data.map(
          (resource) =>
            resourceSchema.safeParse(resource).success && (
              <ResourceCard
                key={resource.id}
                title={resource.resourceName}
                content={resource.description}
                tags={resource.tags}
                userName={resource.user.name}
                coverImageUrl={resource.resourceImgUrl ?? undefined}
                time={resource.createdAt}
                level={resource.targetAudience}
                commentCount={resource.reviewCount}
                userAvatar={resource.user.photoURL}
                viewCount={resource.viewCount.toString()}
              />
            )
        )}
    </div>
  );
}

export default ResourceContainer;
