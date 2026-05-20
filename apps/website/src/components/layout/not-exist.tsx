"use client";

import nobodyIsland from "@daodao/assets/images/island/nobody-island.gif";
import { useTranslations } from "@daodao/i18n";
import { Image } from "@daodao/ui/components/image";
import { Text, Title } from "@daodao/ui/components/typography";
import { Paper } from "@daodao/ui/components/wrapper";

export default function NotExist() {
  const t = useTranslations("web_layout");
  return (
    <Paper className="mx-auto my-5 min-h-[60vh] w-[90%] p-5">
      <Title
        as="h2"
        className="mr-5 mt-2.5 text-center text-[30px] font-bold tracking-wide text-[#536166]"
      >
        {t("not_exist_title")}
      </Title>
      <div className="flex flex-col items-center justify-center">
        <Image src={nobodyIsland} alt="nobody-land" width="300" height="300" />
      </div>
      <Text className="w-full text-center text-xl">
        {t("not_exist_desc")}
      </Text>
      <Text className="mt-2.5 w-full text-center text-xl">
        {t("not_exist_cta")}
      </Text>
    </Paper>
  );
}
