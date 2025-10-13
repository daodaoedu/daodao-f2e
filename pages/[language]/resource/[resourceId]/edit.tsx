import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { toast } from "sonner";

import SEOConfig from "@/components/SEOConfig";
import { Button } from "@/shared/ui/button";
import { Form } from "@/shared/ui/form";
import { Background, Container, Paper } from "@/shared/ui/wrapper";
import { BackButton } from "@/shared/ui/back-button";
import { Title } from "@/shared/ui/typography";
import { ProtectedComponent } from "@/features/auth";
import {
  ResourceBasicInfoFields,
  ResourceCategorizationFields,
  ResourceReviewFields,
  useUpdateResource,
} from "@/features/resources";
import {
  resourceAPI,
  ResourceDetailResponseSchema,
  resourceFormSchema,
  ResourceFormSchema,
} from "@/services/resources";
import { parseToString } from "@/shared/lib/helper";

// export const runtime = "experimental-edge";

export const getServerSideProps = (async (context) => {
  const resourceId = parseToString(context.params?.resourceId);

  if (!resourceId) {
    return {
      notFound: true,
    };
  }

  const { data } = await resourceAPI.read(resourceId);

  return {
    props: {
      data,
    },
  };
}) satisfies GetServerSideProps<{
  data: ResourceDetailResponseSchema["data"] | null;
}>;

export default function EditResourcePage({
  data,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const { trigger: updateResource, isMutating: isSubmitting } =
    useUpdateResource(data.id, {
      onSuccess: () => {
        toast.success("資源分享成功！");
        router.push("/resource");
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
    <ProtectedComponent>
      <SEOConfig title="編輯分享資源" />
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
    </ProtectedComponent>
  );
}
