import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';
import { ExamAppointment } from '@/types';
import { EXAM_SUBJECT_OPTIONS, EXAM_STATUS_OPTIONS } from '@/utils/constants';

interface ExamProgressBarChartProps {
  appointments: ExamAppointment[];
}

export const ExamProgressBarChart: React.FC<ExamProgressBarChartProps> = ({ appointments }) => {
  const subjects = EXAM_SUBJECT_OPTIONS.map((o) => o.label);
  const statuses = EXAM_STATUS_OPTIONS.filter((o) => o.value !== 'cancelled').map((o) => o.label);

  const statusColorMap: Record<string, string> = {
    '已预约': '#94a3b8',
    '已确认': '#3b82f6',
    '已完成': '#059669',
    '缺考': '#f59e0b',
  };

  const series = statuses.map((statusLabel) => {
    const statusValue = EXAM_STATUS_OPTIONS.find((o) => o.label === statusLabel)?.value;
    const data = EXAM_SUBJECT_OPTIONS.map((subject) => {
      return appointments.filter(
        (a) => a.subject === subject.value && a.status === statusValue
      ).length;
    });
    return {
      name: statusLabel,
      type: 'bar',
      stack: 'total',
      emphasis: { focus: 'series' },
      itemStyle: {
        borderRadius: statusLabel === statuses[statuses.length - 1] ? [0, 4, 4, 0] : statusLabel === statuses[0] ? [4, 0, 0, 4] : 0,
      },
      data,
    };
  });

  const option = {
    title: {
      text: '各科目考试进度分布',
      left: 'center',
      textStyle: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#64748b', fontSize: 12 },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
    },
    yAxis: {
      type: 'category',
      data: subjects,
      axisLabel: { color: '#334155', fontSize: 12 },
      axisLine: { lineStyle: { color: '#e2e8f0' } },
    },
    color: statuses.map((s) => statusColorMap[s]),
    series,
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
      <ReactECharts option={option} style={{ height: 320 }} />
    </Card>
  );
};
