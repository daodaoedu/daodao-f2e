import type { FAQPage } from "schema-dts";
import { JsonLdBuilder } from "./JsonLdBuilder";

export type QuestionData = {
  name: string;
  acceptedAnswer: {
    text: string;
  };
};

export class FAQPageBuilder extends JsonLdBuilder<FAQPage> {
  protected setType(): void {
    this.data["@type"] = "FAQPage";
    this.data.mainEntity = [];
  }

  addQuestion(questions: QuestionData[]): this {
    this.data.mainEntity = questions.map((question) => ({
      "@type": "Question",
      name: question.name,
      acceptedAnswer: {
        "@type": "Answer",
        text: question.acceptedAnswer.text,
      },
    }));
    return this;
  }
}
