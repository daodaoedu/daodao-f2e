interface InsightBannerProps {
  text: string;
}

export function InsightBanner({ text }: InsightBannerProps) {
  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{
        background: "linear-gradient(135deg, #16B9B3, #0E8E89)",
      }}
    >
      <p className="text-sm leading-relaxed text-white">{text}</p>
    </div>
  );
}
