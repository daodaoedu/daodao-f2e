"use client";

import type { AnyZodObject } from "zod";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

import DocSvg from "@/public/assets/icons/doc.svg";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Background, Container, Paper } from "@/components/ui/wrapper";
import { BackButton } from "@/components/ui/back-button";
import { Title } from "@/components/ui/typography";
import { Progress } from "@/components/ui/progress";
import {
  resourceFormSchema,
  ResourceFormSchema,
  resourceReviewFormSchema,
} from "@/services/resources";
import { cn } from "@/utils/cn";

import {
  ResourceBasicInfoFields,
  ResourceCategorizationFields,
  ResourceReviewFields,
} from "../components";
import { useCreateResource } from "../hooks";

const withoutReviewSchema = resourceFormSchema.omit({ review: true });

export default function CreateResourceForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const { trigger: createResource, isMutating: isSubmitting } =
    useCreateResource({
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
    const reviewProgress = getProgress(
      resourceReviewFormSchema,
      resourceValues.review
    );

    if (step === 1) {
      return resourceProgress;
    }

    return resourceProgress + reviewProgress;
  }, [step, resourceValues]);

  const helperText = "開始是成功的一半";

  const handleSaveDraft = () => {
    console.log(resourceForm.getValues());
    console.log("save draft");
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleNextStep = () => {
    const parsed = withoutReviewSchema.safeParse(resourceForm.getValues());
    if (parsed.success) {
      setStep(step + 1);
      return;
    }
    const { errors } = parsed.error;

    const parsePath = (path: (string | number)[]) =>
      path.join(".") as keyof ResourceFormSchema;

    errors.forEach((error) => {
      resourceForm.setError(parsePath(error.path), error);
    });
    resourceForm.setFocus(parsePath(errors[0].path));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  return (
    <Background>
      <Container>
        <BackButton label="返回" />

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
  );
}
