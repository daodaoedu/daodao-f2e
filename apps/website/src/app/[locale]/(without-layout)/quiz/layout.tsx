import { QuizProvider } from "@daodao/features-quiz";

export default async function QuizLayout({ children }: LayoutProps<"/[locale]">) {
  return (
    <QuizProvider>
      <style>
        {`
          @font-face {
            font-family: "JejuHallasan";
            font-display: swap;
            src: url("https://db.onlinewebfonts.com/t/2da952d097bffd198ec0f0aa3fdd6804.woff2")format("woff2");
          }
        `}
      </style>
      <div className="relative z-10">{children}</div>
      <div className="invisible fixed -z-10 font-[JejuHallasan]">預載字體</div>
    </QuizProvider>
  );
}
