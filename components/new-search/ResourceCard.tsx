import Image from "@/shared/components/Image";

import Hot from "@/public/assets/icons/hot.svg";
import Group from "@/public/assets/icons/group.svg";
import View from "@/public/assets/icons/view.svg";
import Comment from "@/public/assets/icons/comment.svg";
import DefaultAvatar from "@/public/assets/icons/default-avatar.svg";
import More from "@/public/assets/icons/more.svg";

// Props 需要對應真實資料
type CardProps = {
  time?: string;
  userName?: string;
  userAvatar?: string | null;
  title?: string;
  content?: string;
  tags?: string[]; // tags 要確認 types
  label?: string[]; //! 左上角熱門 label 如果拓展可能要用 mapping
  level?: string;
  viewCount?: number;
  commentCount?: number;
};

export const ResourceCard = (props: CardProps) => {
  const {
    userName = "小許",
    userAvatar = <DefaultAvatar />,
    time = "2024.12.10",
    title = "自然語言處理 Natural Language Progress",
    content = "資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹資源介紹",
    tags = ["1", "2", "3"],
    label = ["熱門", "最新", "人工智慧"],
    level = "初級",
    viewCount = 9999,
    commentCount = 12,
  } = props;

  return (
    <section className="md:flex md:gap-[1rem]">
      {/* Card Image */}
      <div className="relative w-full h-[15.875rem] mb-[0.75rem] md:w-[20rem] md:min-w-[30%] md:h-[15.0625rem]">
        <Image
          src="https://s3-alpha-sig.figma.com/img/286e/253a/fca0a750bc8df12745627d8bcf1120e6?Expires=1740355200&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=tQ2NPRHeQq3Uk-F5uBXhGkWRe0DO2pVQRbRYeAZvYOTxQoLflR3AlaJdLFJi2Qpw-7AkeAeYjcGrne-gkTP2ghhwYRlTGJb4w98CwMs98n0V6s~flgKEFsN5JcII2VTFBCvQhYnTmWQF6akvoX0hTSVgqs~jtuo6rMS5XcKQNm0RIqnxYxFe6jHEdCX2NtvfSTnEk4vkpNMRGXrTEdsf8w-gTOvWLYjpkT0rnSBdXVpfaXi64~bNnr8NHTPWST-L8yiCgXUicVI8YQnOEblZMSiOYCjMY4xYsGmc15KWJqxEKIWiP2FyOn6HzeBrVUUw5Iq3k-CWid7jO1spt2y-JA__"
          alt="img"
          borderRadius="0.5rem"
          height="inherit"
        />

        {/* Card Image Label */}
        <div className=" absolute top-[0.75rem] left-[0.75rem] flex flex-wrap gap-[0.5rem]">
          {label.map((_label) => {
            return (
              <div
                key={_label}
                className="bg-tips text-[1rem] leading-[1.5rem] text-white rounded-lg h-[2rem] flex items-center gap-[0.25rem] px-[0.25rem]"
              >
                <Hot />
                {_label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Content */}
      <section className="flex flex-col gap-[0.25rem]">
        {/* Card Info */}
        <div className="flex justify-between items-center h-[2.25rem]">
          <div className="flex items-center text-[1.125rem] leading-[1.6875rem] text-basic-500">
            <div>{userAvatar}</div>
            <div className="font-bold mr-[0.25rem] ml-[0.5rem]">{userName}</div>
            <div>{time}</div>
          </div>
          <More />
        </div>

        <div className="h-[2.1875rem] text-[1.375rem] font-bold text-basic-black truncate">
          {title}
        </div>

        {/* Card Tags */}
        <div className="flex gap-[0.25rem]">
          {tags.map((tag) => {
            return (
              <div
                key={tag}
                className="h-[2rem] w-[3.75rem] text-primary-base flex items-center justify-center rounded-2xl bg-white md:h-[1.8125rem]"
                style={{ border: "1px solid #16B9B3" }}
              >
                <span className="font-bold">#</span>
                {tag}
              </div>
            );
          })}
        </div>

        <div className="leading-[1.875rem] text-[1.25rem] line-clamp-2 md:line-clamp-3">
          {content}
        </div>

        {/* Card bottom */}
        <div className="text-[1.125rem] leading-[1.6875rem] flex items-center justify-between">
          <div className="flex">
            <div
              className="flex mr-[0.5rem]"
              style={{ borderRight: "1px solid #DBDBDB" }}
            >
              <Group />
              <div className="ml-[0.5rem] mr-[0.25rem]">適合</div>
            </div>
            <span className="text-primary-base">{level}</span>
          </div>

          <div className="h-[2.1875rem] flex items-center justify-center gap-[0.75rem] leading-[1.6875rem] text-[1.125rem]">
            <div className="flex items-center justify-center gap-[0.25rem]">
              <View />
              <div>{viewCount}</div>
            </div>
            <div className="flex items-center justify-center gap-[0.25rem]">
              <Comment />
              <div>{commentCount}</div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};
