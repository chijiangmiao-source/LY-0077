import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { Schedule } from '@/types';
import { CAR_TYPES } from '@/utils/constants';

interface CarTypePieChartProps {
  schedules: Schedule[];
}

export const CarTypePieChart: React.FC<CarTypePieChartProps> = ({ schedules }) => {
  const carTypeCount: Record<string, number> = {};
  CAR_TYPES.forEach((t) => (carTypeCount[t] = 0));
  schedules.forEach((s) => {
    carTypeCount[s.carType] = (carTypeCount[s.carType] || 0) + 1;
  });

  const data = CAR_TYPES.filter((t) => carTypeCount[t] > 0).map((t) => ({
    name: t,
    value: carTypeCount[t],
  }));

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const option = {
    title: {
      text: '车型分布统计',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 12 },
    },
    color: colors,
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 11,
          color: '#334155',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.length > 0 ? data : [{ name: '暂无数据', value: 1 }],
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
