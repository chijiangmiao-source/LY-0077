import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import dayjs from 'dayjs';
import { Schedule } from '@/types';

interface DateTrendChartProps {
  schedules: Schedule[];
}

export const DateTrendChart: React.FC<DateTrendChartProps> = ({ schedules }) => {
  const dates: string[] = [];
  const today = dayjs();
  for (let i = 6; i >= 0; i--) {
    dates.push(today.subtract(i, 'day').format('YYYY-MM-DD'));
  }

  const counts = dates.map((date) =>
    schedules.filter((s) => s.trainingDate === date).length
  );

  const option = {
    title: {
      text: '近7日排班趋势',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
    },
    tooltip: {
      trigger: 'axis',
    },
    grid: { left: 40, right: 20, top: 50, bottom: 30 },
    xAxis: {
      type: 'category',
      data: dates.map((d) => dayjs(d).format('MM-DD')),
      axisLabel: { color: '#64748b', fontSize: 12 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 12 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    series: [
      {
        type: 'line',
        data: counts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#1e40af',
        },
        itemStyle: {
          color: '#1e40af',
          borderColor: '#fff',
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(30, 64, 175, 0.25)' },
              { offset: 1, color: 'rgba(30, 64, 175, 0.02)' },
            ],
          },
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
