import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { Schedule } from '@/types';
import { STATUS_OPTIONS } from '@/utils/constants';

interface StatusPieChartProps {
  schedules: Schedule[];
}

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ schedules }) => {
  const statusCount: Record<string, number> = {
    pending: 0,
    training: 0,
    completed: 0,
    cancelled: 0,
  };
  schedules.forEach((s) => {
    statusCount[s.status] = (statusCount[s.status] || 0) + 1;
  });

  const data = STATUS_OPTIONS.map((opt) => ({
    name: opt.label,
    value: statusCount[opt.value] || 0,
  }));

  const colorMap: Record<string, string> = {
    待开始: '#94a3b8',
    训练中: '#d97706',
    已完成: '#059669',
    已取消: '#dc2626',
  };

  const option = {
    title: {
      text: '课程状态分布',
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
    color: STATUS_OPTIONS.map((o) => colorMap[o.label]),
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
        data,
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
