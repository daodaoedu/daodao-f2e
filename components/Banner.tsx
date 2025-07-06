import { BookOpenCheck, Network, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Text, Title } from "./ui/typography";

const Banner = () => {
  return (
    <div className="relative flex flex-col items-center justify-center bg-[#1c3c46] min-h-dvh text-center overflow-hidden p-4 sm:p-6 md:p-8">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/assets/daodao-banner.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 pt-28 flex flex-col items-center justify-center flex-grow w-full">
        <Title className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
          找不到學習方向？
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 py-2">
            找出屬於你的學習小島！
          </span>
        </Title>

        <Text className="body-md mb-8 text-center text-yellow-300 text-balance">
          完成測驗，立即獲得個人化建議與資源推薦，學習不再迷路！
        </Text>

        <Button
          size="lg"
          className="text-lg font-bold bg-yellow-400 text-black hover:bg-yellow-500"
          asChild
        >
          <Link href="/quiz">立即開始測驗</Link>
        </Button>
      </div>

      <div className="hidden sm:block relative z-10 mt-auto w-full max-w-3xl">
        <div className="flex flex-row items-center justify-around gap-x-8 text-gray-200 text-lg rounded-lg bg-black/30 backdrop-blur-sm p-6">
          <div className="flex flex-col items-center gap-1">
            <BookOpenCheck className="w-8 h-8 text-yellow-400" />
            <span className="font-bold text-3xl">800+</span>
            <span className="text-base text-gray-300">學習資源</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-8 h-8 text-yellow-400" />
            <span className="font-bold text-3xl">200+</span>
            <span className="text-base text-gray-300">位夥伴</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Network className="w-8 h-8 text-yellow-400" />
            <span className="font-bold text-3xl">20+</span>
            <span className="text-base text-gray-300">個揪團</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
