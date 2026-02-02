"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { AnyZodObject } from "zod";

import SEOConfig from "@/components/SEOConfig";
import { ProtectedComponent } from "@/entities/user";
import {
  ResourceBasicInfoFields,
  ResourceCategorizationFields,
  ResourceReviewFields,
  useCreateResource,
} from "@/features/resources";
import DocSvg from "@/public/assets/icons/doc.svg";
import {
  type ResourceFormSchema,
  resourceFormSchema,
  resourceReviewFormSchema,
} from "@/services/resources";
import { useRouter } from "@/shared/i18n/navigation";
import { cn } from "@/shared/lib/cn";
import { BackButton } from "@/shared/ui/back-button";
import { Button } from "@/shared/ui/button";
import { Form, parseSchemaAutoFocus } from "@/shared/ui/form";
import { Progress } from "@/shared/ui/progress";
import { Title } from "@/shared/ui/typography";
import { Background, Container, Paper } from "@/shared/ui/wrapper";

const withoutReviewSchema = resourceFormSchema.omit({ review: true });

interface ResourceCreateFormProps {
  onClose?: () => void;
}

export const ResourceCreateForm = ({ onClose }: ResourceCreateFormProps) => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const { trigger: createResource, isMutating: isSubmitting } = useCreateResource({
    onSuccess: () => {
      toast.success("資源分享成功！");
      if (onClose) {
        onClose();
      } else {
        router.push("/resource");
      }
    },
    onError: () => {
      toast.error("提交失敗，請稍後再試");
    },
  });

  const resourceForm = useForm<ResourceFormSchema>({
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

  const resourceValues = resourceForm.watch();

  const progress = useMemo(() => {
    const getProgress = (schema: AnyZodObject, values: unknown) => {
      const total = Object.keys(schema.shape).length;
      const errorCount = schema.safeParse(values).error?.errors.length ?? 0;
      return ((total - errorCount) / total) * 50;
    };

    const resourceProgress = getProgress(withoutReviewSchema, resourceValues);
    const reviewProgress = getProgress(resourceReviewFormSchema, resourceValues.review);

    if (step === 1) {
      return resourceProgress;
    }

    return resourceProgress + reviewProgress;
  }, [step, resourceValues]);

  const helperText = "開始是成功的一半";

  const handleSaveDraft = () => {
    if (process.env.NODE_ENV === "development") {
      console.log(resourceForm.getValues());
      console.log("save draft");
    }
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleNextStep = () => {
    parseSchemaAutoFocus({
      form: resourceForm,
      schema: withoutReviewSchema,
      onSuccess: () => {
        setStep(step + 1);
      },
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <ProtectedComponent>
      <SEOConfig title="新增分享資源" />
      <Background>
        <Container>
          <BackButton label="返回" onClick={handleBack} />

          <Title as="h1" size="xl" className="mt-3 mb-10">
            分享資源
          </Title>
        </Container>

        <Form {...resourceForm}>
          <form
            onSubmit={resourceForm.handleSubmit((data) => createResource(data))}
            className="space-y-10"
          >
            <Container>
              <Paper className="space-y-10">
                {step === 1 ? (
                  <>
                    <ResourceBasicInfoFields />
                    <ResourceCategorizationFields />
                  </>
                ) : (
                  <ResourceReviewFields isReviewNested />
                )}
              </Paper>
            </Container>
            <footer className="sticky bottom-0 bg-basic-white py-4 shadow-2xl shadow-basic-300 z-10">
              <Container className="flex items-center gap-10">
                <div className="flex-1 body-md space-y-3">
                  <div className="flex">
                    <div className="flex-1">主要資訊</div>
                    <div className="flex-1">心得</div>
                  </div>
                  <Progress
                    value={progress}
                    className={cn(
                      "relative after:absolute after:top-0 after:left-1/2",
                      "after:w-px after:h-full after:bg-primary-base"
                    )}
                  />
                  <div className="body-sm">{helperText}</div>
                </div>
                <div className="flex justify-end gap-3 shrink-0">
                  <Button
                    variant="outline"
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={handlePrevStep}
                    className={cn(step === 1 && "invisible")}
                  >
                    <ArrowLeft size={16} />
                    上一步
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    size="lg"
                    disabled={isSubmitting}
                    onClick={handleSaveDraft}
                  >
                    <DocSvg className="size-4" />
                    儲存草稿
                  </Button>
                  {step === 1 ? (
                    <Button
                      key="next"
                      size="lg"
                      type="button"
                      className="w-28"
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                    >
                      <ArrowRight size={16} />
                      下一步
                    </Button>
                  ) : (
                    <Button
                      key="submit"
                      size="lg"
                      type="submit"
                      className="w-28"
                      disabled={isSubmitting}
                    >
                      <Check size={16} />
                      確認
                    </Button>
                  )}
                </div>
              </Container>
            </footer>
          </form>
        </Form>
      </Background>
    </ProtectedComponent>
  );
};
