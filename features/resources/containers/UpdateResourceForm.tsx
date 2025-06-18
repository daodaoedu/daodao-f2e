"use client";

import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Background, Container, Paper } from "@/components/ui/wrapper";
import { BackButton } from "@/components/ui/back-button";
import { Title } from "@/components/ui/typography";
import { resourceFormSchema, ResourceFormSchema } from "@/services/resources";

import {
  ResourceBasicInfoFields,
  ResourceCategorizationFields,
  ResourceReviewFields,
} from "../components";
import { useResource, useUpdateResource } from "../hooks";

interface UpdateResourceFormProps {
  resourceId: number | null;
}

export default function UpdateResourceForm({
  resourceId,
}: UpdateResourceFormProps) {
  const router = useRouter();

  const { data } = useResource(resourceId);

  const { trigger: updateResource, isMutating: isSubmitting } =
    useUpdateResource(resourceId, {
      onSuccess: () => {
        toast.success("資源分享成功！");
        router.push("/search");
      },
      onError: (error) => {
        console.error("提交資源時發生錯誤:", error);
        toast.error("提交失敗，請稍後再試");
      },
    });

  const resourceForm = useForm<ResourceFormSchema>({
    values: data,
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

  return (
    <Background>
      <Container>
        <BackButton label="返回" />

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
  );
}
