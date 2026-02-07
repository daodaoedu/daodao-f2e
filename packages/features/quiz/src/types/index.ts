import type { StaticImageData } from "@daodao/ui/components/image";

export type AnswerKeyType = "L" | "C" | "A" | "D" | "O";

export interface IAnswer {
  key: AnswerKeyType;
  title: string;
  value: number;
}

export interface IQuestion {
  id: string;
  title: string;
  image: StaticImageData;
  backgroundColor: `#${string}`;
  answers: [IAnswer, IAnswer, IAnswer, IAnswer, IAnswer];
}

export interface IResultDetail {
  id: string;
  tags: string[];
  slogan: string;
  characteristics: string;
  scenery: string;
  strategies: string[];
  islandDining: string[];
  learningTraits: string;
  learningStrategies: string[];
  partners: Array<{
    roleId: string;
    brief: string;
    description: string;
  }>;
  supportNeeded: string[];
  islandDiningDescription: string;
  recommendedResources: string;
  recommendedResourceLinks: Array<{
    text: string;
    link: string;
  }>;
}

export interface ITheme {
  id: string;
  title: string;
  backgroundColor: `#${string}`;
  color: `#${string}`;
  secondaryColor: `#${string}`;
  largeImg: StaticImageData;
  smallImg: React.FC;
  analysis: Record<AnswerKeyType, number>;
}

export type QuizResultType = Record<string, { selectedAnswer: AnswerKeyType }>;

export interface IQuizAnalysis {
  scores: Record<AnswerKeyType, number>;
  resultId: string;
}
