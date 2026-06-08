import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { Schedule } from '@/types';

interface CoachBarChartProps {
  schedules: Schedule[];
}

export const CoachBarChart: React.FC<CoachBarChartProps> = ({ schedules }) => {
  const coachCount: Record<string, number> = {};
  schedules.forEach((s) => {
    coachCount[s.coachName] = (coachCount[s.coachName] || 0) + 1;
  });

  const option = {
    title: {
      text: '教练排班统计',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: Object.keys(coachCount),
      axisLabel: { color: '#64748b', fontSize: 12 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        type: 'bar',
        data: Object.values(coachCount),
        barWidth: 36,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1e40af' },
            ],
          },
          borderRadius: [6, 6, 0, 0],
        },
        label: {
          show: true,
          position: 'top',
          color: '#1e40af',
          fontWeight: 600,
        },
      },
    ],
  };

  return (
    <Card
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        height: '100%',
      }}
    >
      <ReactECharts option={option} style={{ height: 300 }} />
    </Card>
  );
};
