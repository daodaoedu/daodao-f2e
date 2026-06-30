"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerQuestionStat } from "../../types";

interface ResponseChartProps {
  stat: PerQuestionStat;
}

const PRIMARY_COLOR = "#16B9B3";
const SECONDARY_COLOR = "#FF6B6B";

export function ResponseChart({ stat }: ResponseChartProps) {
  const { questionType, stats } = stat;
  const { distribution, averageScore } = stats;

  if (questionType === "text") {
    return (
      <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
        開放文字題無圖表
      </div>
    );
  }

  if (questionType === "yesno") {
    const trueCount = distribution?.find((d) => d.label === "是")?.count ?? 0;
    const falseCount = distribution?.find((d) => d.label === "否")?.count ?? 0;

    if (trueCount === 0 && falseCount === 0) {
      return <p className="text-sm text-muted-foreground py-4 text-center">尚無回應資料</p>;
    }

    const pieData =
      distribution && distribution.length > 0
        ? distribution.map((item, i) => ({
            name: item.label,
            value: item.count,
            fill: i === 0 ? PRIMARY_COLOR : SECONDARY_COLOR,
          }))
        : [
            { name: "是", value: 1, fill: PRIMARY_COLOR },
            { name: "否", value: 1, fill: SECONDARY_COLOR },
          ];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (
    (questionType === "rating" || questionType === "scale") &&
    !distribution?.length &&
    averageScore != null
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] gap-2">
        <p className="text-xs text-muted-foreground">平均分</p>
        <p className="text-4xl font-bold" style={{ color: PRIMARY_COLOR }}>
          {averageScore.toFixed(1)}
        </p>
      </div>
    );
  }

  if (distribution && distribution.length > 0) {
    const barData = distribution.map((item) => ({
      name: item.label,
      回應數: item.count,
      百分比: item.percentage,
    }));

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="回應數" fill={PRIMARY_COLOR} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
      無圖表資料
    </div>
  );
}
