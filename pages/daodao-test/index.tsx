import Link from "next/link";
import Image from "next/image";
import SEOConfig from "@/shared/components/SEO";
import HorizontalLogoSvg from "@/public/horizontal-logo.svg";
import question1Jpg from "@/public/assets/daodao-test/q1.jpg";
import ResultNoisePng from "@/public/assets/daodao-test/result-noise.png";
import { Button } from "@/components/ui/button";
import { getDaodaoTestLayout } from "@/features/daodao-test";

export default function DaodaoTestPage() {
  return (
    <>
      <SEOConfig title="我有一個島，它叫... | 島島阿學" />
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundImage: `url(${ResultNoisePng.src})` }}
      />
      <main className="relative max-w-[392px] mx-auto h-dvh text-basic-400">
        <Image
          src={question1Jpg.src}
          alt="島島阿學"
          className="-z-10"
          objectFit="contain"
          objectPosition="bottom"
          fill
          style={{ mask: "linear-gradient(transparent 22%, #000 60%)" }}
        />
        <header className="pt-10 mb-6">
          <HorizontalLogoSvg className="w-40 mx-auto" />
        </header>
        <h1 className="mb-6 flex flex-col items-center gap-2">
          <div className="text-[28px] font-bold">我有一個島</div>
          <div className="text-4xl font-bold flex items-center gap-3">
            它叫
            <svg
              width="123"
              height="34"
              viewBox="0 0 123 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="什麼"
            >
              <path
                d="M12 14.8834C12.1618 15.5939 12.7709 18.5521 13.1786 19.4122C13.8862 20.9053 15.4764 21.0016 17.0417 21.2061C20.4003 21.6449 22.6633 20.7936 25.6845 19.5299C29.6531 17.8699 33.5008 15.9738 37.5357 14.4423C39.0851 13.8543 42.11 12.3665 43.9524 12.8837C45.4794 13.3123 46.72 14.9175 47.6518 15.9715C49.2741 17.8066 50.7985 19.4276 53.119 20.5885C57.9014 22.9812 63.3958 21.2847 68.1131 19.6475C71.1173 18.6048 74.1286 17.5364 77.247 16.7949C78.317 16.5405 79.4225 16.2934 80.4881 16.7067C82.1839 17.3645 83.3484 18.721 85.1042 19.324C86.9494 19.9578 89.0006 20.1768 90.9643 20.1768C93.3503 20.1768 95.3229 19.6499 97.5119 18.8241C100.08 17.8551 102.643 17.181 105.304 16.4715C106.431 16.1709 107.463 15.56 108.643 15.4422C109.637 15.3429 110.132 15.2735 111 14.8834"
                stroke="#16B9B3"
                stroke-width="24"
                stroke-linecap="round"
              />
            </svg>
            島？
          </div>
        </h1>
        <p className="text-lg text-center">2 分鐘揭曉你是哪種學習類型，</p>
        <p className="text-lg text-center">
          找到你適合的
          <strong className="font-bold">學習策略與夥伴</strong>！
        </p>
        <Button
          className="absolute bottom-28 left-1/2 -translate-x-1/2"
          size="lg"
          asChild
        >
          <Link href="/daodao-test/questions/q1">開始測驗</Link>
        </Button>
      </main>
    </>
  );
}

DaodaoTestPage.getLayout = getDaodaoTestLayout;
