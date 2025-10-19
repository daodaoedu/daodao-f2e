import { StaticImageData } from 'next/image';

export type AnswerKey = 'L' | 'C' | 'A' | 'D' | 'O';

export interface Answer {
  key: AnswerKey;
  title: string;
  value: number;
}

export interface Question {
  id: string;
  title: string;
  image: StaticImageData;
  backgroundColor: `#${string}`;
  answers: [Answer, Answer, Answer, Answer, Answer];
}

export interface ResultDetail {
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

export interface Theme {
  id: string;
  title: string;
  backgroundColor: `#${string}`;
  color: `#${string}`;
  secondaryColor: `#${string}`;
  largeImg: StaticImageData;
  smallImg: React.FC;
  analysis: Record<AnswerKey, number>;
}

export type QuizResult = Record<string, { selectedAnswer: AnswerKey }>;

export interface QuizAnalysis {
  scores: Record<AnswerKey, number>;
  resultId: string;
}
