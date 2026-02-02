"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import SEOConfig from "@/components/SEOConfig";
import type { ResourceDetail } from "@/entities/resource";
import { ProtectedComponent } from "@/entities/user";
import {
  ResourceBasicInfoFields,
  ResourceCategorizationFields,
  ResourceReviewFields,
  useUpdateResource,
} from "@/features/resources";
import { type ResourceFormSchema, resourceFormSchema } from "@/services/resources";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Title } from "@/shared/ui/typography";
import { Background, Container, Paper } from "@/shared/ui/wrapper";

interface ResourceEditFormProps {
  data: ResourceDetail;
  onClose: () => void;
}

export const ResourceEditForm = ({ data, onClose }: ResourceEditFormProps) => {
  const { trigger: updateResource, isMutating: isSubmitting } = useUpdateResource(
    data.id.toString(),
    {
      onSuccess: () => {
        toast.success("資源分享成功！");
        onClose();
      },
      onError: () => {
        toast.error("提交失敗，請稍後再試");
      },
    }
  );

  const resourceForm = useForm<ResourceFormSchema>({
    values: data || undefined,
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: "",
      url: "",
      imageUrl: "",
      description: "",
      videoUrl: "",
      type: "",
      level: "",
      cost: "",
      majorCategory: "",
      subCategory: "",
      tags: [],
    },
  });

  const handleSubmit = ({ review, ...resource }: ResourceFormSchema) => {
    updateResource({ ...resource, review });
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <ProtectedComponent>
      <SEOConfig title="編輯分享資源" />
      <Background>
        <Container>
          <BackButton label="返回" onClick={handleBack} />

          <Title as="h1" size="xl" className="mt-3 mb-10">
            分享資源
          </Title>
        </Container>

        <Form {...resourceForm}>
          <form onSubmit={resourceForm.handleSubmit(handleSubmit)}>
            <Container className="space-y-10 mb-10">
              <Paper>
                <ResourceBasicInfoFields />
              </Paper>

              <Paper>
                <ResourceReviewFields isReviewNested />
              </Paper>

              <Paper>
                <ResourceCategorizationFields />
              </Paper>
            </Container>
            <footer className="sticky bottom-0 bg-basic-white py-4 shadow-2xl shadow-basic-300 z-10">
              <Container className="flex justify-between items-center gap-10">
                <div className="body-md">就快完成了</div>
                <Button size="lg" type="submit" disabled={isSubmitting}>
                  <Check size={16} />
                  {isSubmitting ? "處理中..." : "儲存"}
                </Button>
              </Container>
            </footer>
          </form>
        </Form>
      </Background>
    </ProtectedComponent>
  );
};
