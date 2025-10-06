import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts';
import { ChartContainer } from '@/shared/ui/chart';
import { AnalysisType } from '../constants';

interface ResultChartProps {
  analysis: AnalysisType;
  color: string;
  className?: string;
}

export const ResultChart = ({
  analysis,
  color,
  className,
}: ResultChartProps) => {
  const data = [
    { key: '探究', value: analysis.D },
    { key: '行動', value: analysis.A },
    { key: '結構', value: analysis.O },
    { key: '跨域', value: analysis.L },
    { key: '連結', value: analysis.C },
  ];

  return (
    <ChartContainer config={{}} className={className}>
      <RadarChart data={data}>
        <PolarAngleAxis
          dataKey="key"
          tick={({
            x, y, textAnchor, index, ...props
          }) => {
            const chartData = data[index];
            const diffX = index > 2 ? 4 : -4;
            return (
              <text
                x={x}
                y={y}
                dx={index === 0 ? 0 : diffX}
                dy={4}
                textAnchor={textAnchor}
                fontSize={12}
                fontWeight={400}
                fill="currentColor"
                {...props}
              >
                <tspan className="fill-basic-400">{chartData.key}</tspan>
              </text>
            );
          }}
        />
        <PolarRadiusAxis
          domain={(dataRange) => [0, dataRange[1] + 0.5]}
          tick={false}
          axisLine={false}
          tickCount={9}
        />
        <PolarGrid stroke="currentColor" className="last:fill-white/50" />
        <Radar
          dataKey="value"
          fill={`${color}33`}
          fillOpacity={0.6}
          stroke={color}
          strokeLinejoin="round"
          strokeWidth={3}
          animationDuration={0}
        />
      </RadarChart>
    </ChartContainer>
  );
};
