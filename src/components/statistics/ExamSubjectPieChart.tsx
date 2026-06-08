import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { ExamAppointment } from '@/types';
import { EXAM_SUBJECT_OPTIONS } from '@/utils/constants';

interface ExamSubjectPieChartProps {
  appointments: ExamAppointment[];
}

export const ExamSubjectPieChart: React.FC<ExamSubjectPieChartProps> = ({ appointments }) => {
  const subjectCount: Record<string, number> = {};
  EXAM_SUBJECT_OPTIONS.forEach((o) => {
    subjectCount[o.value] = 0;
  });
  appointments.forEach((a) => {
    subjectCount[a.subject] = (subjectCount[a.subject] || 0) + 1;
  });

  const data = EXAM_SUBJECT_OPTIONS.map((opt) => ({
    name: opt.label,
    value: subjectCount[opt.value] || 0,
  }));

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];

  const option = {
    title: {
      text: '各科目考试预约分布',
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
