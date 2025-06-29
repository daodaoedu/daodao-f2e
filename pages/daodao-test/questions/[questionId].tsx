import type { InferGetStaticPropsType, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import SEOConfig from "@/shared/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import RunnerSvg from "@/public/assets/icons/runner.svg";
import { cn } from "@/utils/cn";
import {
  AnswerKey,
  getDaodaoTestLayout,
  questionMap,
  useDaodaoTest,
} from "@/features/daodao-test";
import { parseToString } from "@/utils/helper";

export const getStaticPaths = async () => {
  const paths = Array.from(questionMap.keys()).map((questionId) => ({
    params: { questionId },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = (async (context) => {
  const questionId = parseToString(context.params?.questionId);

  return {
    props: { questionId },
  };
}) satisfies GetStaticProps<{
  questionId?: string | null;
}>;

const basePath = "/daodao-test/questions";

export default function DaodaoTestQuestionPage({
  questionId,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { result, selectAnswer } = useDaodaoTest();
  const question = questionMap.get(questionId ?? "");

  if (!question) return null;

  const stepNumber = 100 / (questionMap.size + 1);
  const currentStep = parseInt(question.id.slice(1), 10);
  const percent = currentStep * stepNumber;
  const selectedAnswer = result[question.id]?.selectedAnswer;

  const handleSelectAnswer = (answer: AnswerKey) => {
    selectAnswer(question.id, answer);
  };

  return (
    <>
      <SEOConfig title={`${question.title}｜島島阿學`} />
      <div className="fixed h-dvh w-dvw overflow-hidden">
        <div
          className="absolute inset-0 transition-colors"
          style={{ background: question.backgroundColor }}
        />
        <div className="absolute -right-[9vw] -bottom-[1vw] size-[24vw] rotate-[42deg] bg-[#FFA023]" />
        <div className="absolute -left-[2vw] -bottom-[7vw] size-[20vw] rotate-[42deg] bg-[#FFD942]" />
        <div className="absolute inset-0 [backdrop-filter:url(#question-noise)]" />
        <div className="relative max-w-[392px] mx-auto h-dvh bg-[#EEEEEE]">
          <div className="absolute inset-0 [backdrop-filter:url(#question-noise)]" />
          <Button
            variant="ghost"
            className={cn(
              "top-0 left-0 size-8",
              "sm:top-1/2 sm:-translate-y-1/2 sm:left-auto sm:right-full sm:size-20",
              "absolute z-20 p-0 flex-col gap-0 body-sm hover:text-black",
              "sm:bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#FFFFFF00_70%)]",
              currentStep === 1 && "hidden"
            )}
            onClick={() => router.push(`${basePath}/q${currentStep - 1}`)}
            animation="none"
          >
            <ChevronLeftIcon size={20} />
            <span className="hidden sm:block">上一題</span>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "top-0 right-0 size-8",
              "sm:top-1/2 sm:-translate-y-1/2 sm:right-auto sm:left-full sm:size-20",
              "absolute z-20 p-0 flex-col gap-0 body-sm hover:text-black",
              "sm:bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#FFFFFF00_70%)]",
              !selectedAnswer && currentStep <= questionMap.size && "hidden"
            )}
            onClick={() => router.push(`${basePath}/q${currentStep + 1}`)}
            animation="none"
          >
            <ChevronRightIcon size={20} />
            <span className="hidden sm:block">下一題</span>
          </Button>
          <div className="absolute top-0.5 inset-x-0 z-10 text-[#545454]">
            <RunnerSvg
              className="absolute top-0 -translate-x-2/3 transition-[left]"
              style={{ left: `${percent}%` }}
            />
            <Progress
              value={percent}
              className="rounded-none h-1 mt-8 [--active-color:#545454]"
            />
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className={cn(
                  "absolute top-7 h-2.5 w-2.5 rotate-45 -translate-x-1/2 -translate-y-1/2 transition-colors",
                  currentStep >= num ? "bg-[#545454]" : "bg-[#B5B5B5]"
                )}
                style={{ left: `${num * stepNumber}%` }}
              />
            ))}
          </div>
          <div className="absolute w-full h-[calc(100dvh-288px)] blur-md">
            <Image
              key={question.title}
              src={question.image}
              alt={question.title}
              fill
              priority
            />
          </div>
          <div className="relative mx-auto aspect-[30/43] max-w-full max-h-[calc(100dvh-288px)]">
            <Image
              key={question.title}
              src={question.image}
              alt={question.title}
              fill
              priority
            />
          </div>
          <div className="h-[288px] relative">
            <div className="absolute bottom-full inset-x-0 mx-6 mb-3 p-5 bg-basic-white/60">
              <p className="text-[2.75rem] text-[#545454] font-[JejuHallasan] leading-none tracking-widest">
                {question.id.toUpperCase()}.
              </p>
              <p className="text-[1.125rem] font-bold whitespace-pre-line">
                {question.title}
              </p>
            </div>
            <div className="bg-[#EEEEEE]">
              <div className="flex flex-col items-stretch justify-center gap-3 p-5 [backdrop-filter:url(#question-noise)]">
                {question.answers.map((answer) => (
                  <Button
                    variant="light"
                    size="lg"
                    key={`${question.id}-${answer.key}`}
                    className={cn(
                      "text-sm",
                      selectedAnswer === answer.key &&
                        "bg-[#545454] text-white hover:border-[#545454] hover:text-white"
                    )}
                    onClick={() => handleSelectAnswer(answer.key)}
                  >
                    {answer.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <svg
        width="300"
        height="150"
        viewBox="0 0 300 150"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="question-noise">
          <feTurbulence type="turbulence" baseFrequency="0.75" />
          <feColorMatrix
            in="colorNoise"
            type="matrix"
            values="1 1 1 0 0 1 1 1 0 0 1 1 1 0 0 0 0 0 1 0"
          />
          <feComposite operator="in" in2="SourceGraphic" result="monoNoise" />
          <feBlend in="SourceGraphic" in2="monoNoise" mode="multiply" />
        </filter>
      </svg>
    </>
  );
}

DaodaoTestQuestionPage.getLayout = getDaodaoTestLayout;
