"use client";

import { CorrelationCard, SectionHeader } from "../components";
import { MOCK_CORRELATIONS } from "../mock-data";

export function CorrelationsTab() {
  const strong = MOCK_CORRELATIONS.filter((c) => c.strength === "strong");
  const moderate = MOCK_CORRELATIONS.filter((c) => c.strength === "moderate");
  const weak = MOCK_CORRELATIONS.filter((c) => c.strength === "weak");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-[#636E72]">
        根據你的記錄，自動發現指標之間的關聯性。數據越多，分析越準確。
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

      {weak.length > 0 && (
        <section>
          <SectionHeader title="弱相關" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {weak.map((c) => (
              <CorrelationCard key={c.id} correlation={c} showScatter />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
