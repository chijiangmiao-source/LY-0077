import React from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { StudentProgress } from '@/types';
import { PROGRESS_STAGES } from '@/utils/constants';
import { getProgressStageColor, getProgressStageLabel } from '@/utils/helpers';

interface StageDistributionChartProps {
  progresses: StudentProgress[];
}

export const StageDistributionChart: React.FC<StageDistributionChartProps> = ({
  progresses,
}) => {
  const stageCounts: Record<string, number> = {};
  PROGRESS_STAGES.forEach((s) => (stageCounts[s.value] = 0));
  progresses.forEach((p) => {
    stageCounts[p.currentStage] = (stageCounts[p.currentStage] || 0) + 1;
  });

  const data = PROGRESS_STAGES.filter((s) => stageCounts[s.value] > 0).map((s) => ({
    value: stageCounts[s.value],
    name: getProgressStageLabel(s.value),
    itemStyle: {
      color: getProgressStageColor(s.value),
    },
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人 ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      itemGap: 12,
      textStyle: {
        fontSize: 12,
        color: '#475569',
      },
    },
    series: [
      {
        name: '阶段分布',
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)',
          },
        },
        labelLine: {
          show: false,
        },
        data,
      },
    ],
  };

  return (
    <Card
      title="各阶段学员分布"
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <ReactECharts
        option={option}
        style={{ height: 320 }}
        opts={{ renderer: 'canvas' }}
      />
    </Card>
  );
};
