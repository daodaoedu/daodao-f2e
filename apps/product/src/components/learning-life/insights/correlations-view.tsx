"use client";

import { CorrelationCard, SectionHeader } from "../components";
import { LEARNING_CORRELATIONS } from "../mock-data";

/** 相關性全列表（第三層下鑽）— 全為學習語境 */
export function CorrelationsView() {
  const strong = LEARNING_CORRELATIONS.filter((c) => c.strength === "strong");
  const moderate = LEARNING_CORRELATIONS.filter((c) => c.strength === "moderate");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[#636E72]">
        系統分析你的打卡與每日狀態，找出「怎樣的日子你學得最好」。統計關聯不代表因果，但能幫你認識自己的模式。
        <span className="ml-1 text-xs text-[#8A9BA0]">功能預覽</span>
      </p>

      {strong.length > 0 && (
        <section>
          <SectionHeader title="強相關" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {strong.map((c) => (
              <CorrelationCard key={c.id} correlation={c} showScatter />
            ))}
          </div>
        </section>
      )}

      {moderate.length > 0 && (
        <section>
          <SectionHeader title="中等相關" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {moderate.map((c) => (
              <CorrelationCard key={c.id} correlation={c} showScatter />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
