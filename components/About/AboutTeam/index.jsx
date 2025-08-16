import React from 'react';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/typography';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const IMAGE_TAGS = [
  'howcanihelp',
  'hug',
  'huge',
  'hulu',
  'hunger',
  'icecream',
  'jellybean toes toe beans grey gray mauve',
  'jellybean toes toebeans squished beans',
  'judgemental',
  'jump',
  'jumping',
  'kick',
  'kiss',
  'kitler',
  'kitten',
  'kittenleg',
  'kittens',
  'kitty',
  'knocknoc',
  'kucing',
  'kuro',
  'laying',
  'legs',
  'lights',
  'loaf',
  'logan',
  'lolcat',
  'long',
  'long-cat',
  'looking',
  'lustful',
  'lying down',
  'macCat',
  'mackerel tabby',
  'mad',
  'mama',
  'marine',
  'mask',
  'meme',
  'metal',
  'misty',
  'mixed',
  'money',
  'moody',
  'morrigan',
  'morrigan witch of the wilds',
  'mousecat',
  'multi',
  'multiple_colors',
  'munchkin',
  'nasty',
  'nelly',
  'nelut',
  'newyear',
  'nicecat',
  'no',
  'nope',
  'nyancat',
  'nyancat-gif',
  'old',
  'ominous',
  'orange',
  'orange cat',
  'ovni',
  'pain',
  'party',
  'patoka',
  'paw',
  'pebba',
  'peppa',
  'pepper',
  'petting',
  'piano',
  'pic',
  'pippin',
  'pirate',
  'playful',
  'please',
  'plot',
  'portrait-worthy',
  'pretty',
  'professional',
  'programmer',
  'puffy',
  'quality',
  'reading',
  'resting',
  'rich',
  'roll',
  'rolling',
  'running',
  'russia',
  'russian blue',
  'sad',
  'sad catto',
  'samurai',
  'sara',
  'sassy',
  'sauna cat',
  'savannah',
  'scared',
  'screm',
  'seeya!',
  'selfie',
  'serious',
];

const Members = [
  {
    id: 0,
    name: 'Tiff',
    image: 'https://cataas.com/cat/0',
  },
  {
    id: 1,
    name: '小許',
    image: 'https://cataas.com/cat/1',
  },
  {
    id: 2,
    name: '小貝',
    image: 'https://cataas.com/cat/2',
  },
  {
    id: 3,
    name: '葦',
    image: 'https://cataas.com/cat/3',
  },
  {
    id: 4,
    name: '羊',
    image: 'https://cataas.com/cat/4',
  },
  {
    id: 5,
    name: 'Sucre',
    image: 'https://cataas.com/cat/5',
  },
  {
    id: 6,
    name: '東玉',
    image: 'https://cataas.com/cat/6',
  },
  {
    id: 7,
    name: '百戰不殆',
    image: 'https://cataas.com/cat/7',
  },
  {
    id: 8,
    name: 'Yvonne',
    image: 'https://cataas.com/cat/8',
  },
  {
    id: 9,
    name: '珮珮',
    image: 'https://cataas.com/cat/9',
  },
  {
    id: 10,
    name: '袋鼠',
    image: 'https://cataas.com/cat/10',
  },
  {
    id: 11,
    name: 'Karen',
    image: 'https://cataas.com/cat/11',
  },
  {
    id: 12,
    name: '預知',
    image: 'https://cataas.com/cat/12',
  },
  {
    id: 13,
    name: 'Yu',
    image: 'https://cataas.com/cat/13',
  },
  {
    id: 14,
    name: '阿樂',
    image: 'https://cataas.com/cat/14',
  },
  {
    id: 15,
    name: '姵璇',
    image: 'https://cataas.com/cat/15',
  },
  {
    id: 16,
    name: 'Trixie',
    image: 'https://cataas.com/cat/16',
  },
  {
    id: 17,
    name: '何廢料',
    image: 'https://cataas.com/cat/17',
  },
  {
    id: 18,
    name: '一路',
    image: 'https://cataas.com/cat/18',
  },
  {
    id: 19,
    name: 'Yumi',
    image: 'https://cataas.com/cat/19',
  },
  {
    id: 20,
    name: '芳芳',
    image: 'https://cataas.com/cat/20',
  },
  {
    id: 21,
    name: 'Pei',
    image: 'https://cataas.com/cat/21',
  },
  {
    id: 22,
    name: 'Sebastian',
    image: 'https://cataas.com/cat/22',
  },
  {
    id: 23,
    name: 'Grace',
    image: 'https://cataas.com/cat/23',
  },
];

const AboutTeam = () => {
  return (
    <div className="my-5">
      <Title
        as="h2"
        size="lg"
        className="mb-2.5 mt-10"
      >
        團隊組成
      </Title>
      <div className="m-5">
        <div className="flex flex-wrap items-center justify-start">
          <TooltipProvider>
            {Members.map(({ id, name }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <Avatar className="m-1 h-[50px] w-[50px]">
                    <AvatarImage
                      alt={name}
                      src={`https://cataas.com/cat/${IMAGE_TAGS[id]}`}
                    />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="ml-1 flex max-w-[2]">
                  <Avatar className="-ml-3 h-[50px] w-[50px]">
                    <AvatarImage
                      alt="50+"
                      src="https://media.giphy.com/media/bErElGdAHUmoE/giphy.gif"
                    />
                    <AvatarFallback>50+</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-3 h-[50px] w-[50px]">
                    <AvatarImage
                      alt="dummy"
                      src="https://media.giphy.com/media/bErElGdAHUmoE/giphy.gif"
                    />
                    <AvatarFallback>+</AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>志工夥伴</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Text className="my-[5px]">
          島島阿學團隊由一群國中生、高中生、大學生、教育工作者、家長、工程師、設計師等來自不同背景的夥伴組成，親身經歷自主學習的各種困境，並有感教育不平等之議題，故自主發起島島阿學學習社群計畫。
        </Text>
        <Text className="my-[5px]">
          包含：
          <Text as="span">🕵 內容部</Text>
          <Text as="span">🧝 管理部</Text>
          <Text as="span">🧑‍💻 IT部</Text>
          <Text as="span">🧑‍💼 行銷公關部</Text>
          <Text as="span">🧑‍🎨 設計部</Text>
          <Text as="span">🧚 志工夥伴</Text>
        </Text>
        <Title
          as="h3"
          size="md"
          className="my-2.5"
        >
          來自IT夥伴的小彩蛋
        </Title>
        <Text className="my-[5px]">
          你知道你的一句話能造成多大的引響力嗎？歡迎送上暖暖的祝福給夥伴們！
        </Text>
        <div className="mb-2.5 mt-5">
          <Button variant="outline">
            <Text>❤️ 送上祝福</Text>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutTeam;
