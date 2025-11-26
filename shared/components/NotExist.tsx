import { Title, Text } from '@/shared/ui/typography';
import { Paper } from '@/shared/ui/paper';
import { Button } from '@/shared/ui/button';
import { Facebook } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { CATEGORIES } from '@/constants/category';

export default function NotExist() {
  return (
    <>
      <Paper className="mx-auto my-5 min-h-[60vh] w-[90%] p-5">
        <Title
          as="h2"
          className="mr-5 mt-2.5 text-center text-[30px] font-bold tracking-wide text-[#536166]"
        >
          這座島已經搬新家囉
        </Title>
        <div className="flex flex-col items-center justify-center">
          <img
            src="/assets/images/nobody-island.gif"
            alt="nobody-land"
            width="300"
            height="300"
          />
        </div>
        <Text className="w-full text-center text-xl">
          近期網站改版，可能有部分頁面無法使用，可以參觀其他地方唷～
        </Text>
        <Text className="mt-2.5 w-full text-center text-xl">
          要不要試試我們新版的資源搜尋或是參觀其他地方呢？
        </Text>
        <div className="my-5">
          <Text className="font-bold">
            豐富的學習類別
          </Text>
          <div className="my-2.5">
            {CATEGORIES.map(({ value, label }) => (
              <Badge key={value} className="m-1">
                {label}
              </Badge>
            ))}
          </div>
        </div>
        <div className="mb-2.5 mt-10">
          <Text className="font-bold">
            加入島島社群
          </Text>
          <div className="my-5">
            <Button variant="outline" asChild>
              <a href="/join">
                <Facebook style={{ margin: '5px 0' }} />
                <Text>加入社群</Text>
              </a>
            </Button>
          </div>
        </div>
      </Paper>
    </>
  );
}
