"use client";

import type { AnswerKeyType } from "../types";
import { useQuiz } from "../hooks/use-quiz";
import { questionMap } from "../utils/question-map";
import { AnswerOption } from "./answer-option";
import { NavigationButtons } from "./navigation-buttons";
import { ProgressBar } from "./progress-bar";
import { QuestionCard } from "./question-card";

interface QuizQuestionProps {
  questionId: string;
}

export const QuizQuestion = ({ questionId }: QuizQuestionProps) => {
  const { result, selectAnswer } = useQuiz();
  const question = questionMap.get(questionId);

  if (!question) return null;

  const currentStep = Number.parseInt(question.id.slice(1), 10);
  const selectedAnswer = result[question.id]?.selectedAnswer;

  const handleSelectAnswer = (answerKey: AnswerKeyType) => {
    selectAnswer(question.id, answerKey);
  };

  return (
    <>
      <div className="fixed h-dvh w-dvw overflow-hidden">
        <div
          className="absolute inset-0 transition-colors"
          style={{ background: question.backgroundColor }}
        />
        <div className="absolute bottom-[-1vw] right-[-9vw] size-[24vw] rotate-42 bg-[#FFA023]" />
        <div className="absolute bottom-[-7vw] left-[-2vw] size-[20vw] rotate-42 bg-[#FFD942]" />
        <div className="absolute inset-0 [backdrop-filter:url(#question-noise)]" />
        <div className="relative mx-auto h-dvh max-w-[392px] bg-[#EEEEEE]">
          <div className="absolute inset-0 [backdrop-filter:url(#question-noise)]" />

          <NavigationButtons
            currentStep={currentStep}
            totalSteps={questionMap.size}
            hasSelectedAnswer={!!selectedAnswer}
          />

          <ProgressBar currentStep={currentStep} totalSteps={questionMap.size} />

          <QuestionCard question={question} />

          <div className="relative h-[288px]">
            <div className="absolute inset-x-0 bottom-full mx-6 mb-3 bg-basic-white/60 p-5">
              <p className="font-[JejuHallasan] text-[2.75rem] leading-none tracking-widest text-[#545454]">
                {question.id.toUpperCase()}.
              </p>
              <p className="whitespace-pre-line text-[1.125rem] font-bold">{question.title}</p>
            </div>
            <div className="bg-[#EEEEEE]">
              <div className="flex flex-col items-stretch justify-center gap-3 p-5 [backdrop-filter:url(#question-noise)]">
                {question.answers.map((answer) => (
                  <AnswerOption
                    key={`${question.id}-${answer.key}`}
                    answer={answer}
                    isSelected={selectedAnswer === answer.key}
                    onSelect={() => handleSelectAnswer(answer.key)}
                    questionId={question.id}
                  />
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
        aria-hidden="true"
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
};
