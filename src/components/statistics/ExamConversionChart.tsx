import React, { useMemo } from 'react';
import { Card } from 'antd';
import ReactECharts from 'echarts-for-react';
import { ExamAppointment, ExamSubject } from '@/types';
import { EXAM_SUBJECT_OPTIONS } from '@/utils/constants';

interface ExamConversionChartProps {
  appointments: ExamAppointment[];
}

export const ExamConversionChart: React.FC<ExamConversionChartProps> = ({
  appointments,
}) => {
  const conversionData = useMemo(() => {
    const subjects = ['subject1', 'subject2', 'subject3', 'subject4'] as ExamSubject[];
    return subjects.map((subject) => {
      const subjectAppointments = appointments.filter((a) => a.subject === subject);
      const booked = subjectAppointments.length;
      const completed = subjectAppointments.filter((a) => a.status === 'completed').length;
      const passed = subjectAppointments.filter(
        (a) => a.status === 'completed' && a.isPassed
      ).length;
      const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;
      const subjectInfo = EXAM_SUBJECT_OPTIONS.find((s) => s.value === subject);
      return {
        subject,
        label: subjectInfo?.label || subject,
        booked,
        completed,
        passed,
        passRate,
      };
    });
  }, [appointments]);

  const overallData = useMemo(() => {
    const booked = appointments.length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    const passed = appointments.filter(
      (a) => a.status === 'completed' && a.isPassed
    ).length;
    const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;
    return { booked, completed, passed, passRate };
  }, [appointments]);

  const funnelData = [
    { value: overallData.booked, name: '预约总数' },
    { value: overallData.completed, name: '已参加考试' },
    { value: overallData.passed, name: '考试通过' },
  ];

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人次',
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: '#475569',
      },
    },
    series: [
      {
        name: '整体转化率',
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 60,
        width: '40%',
        min: 0,
        max: Math.max(...funnelData.map((d) => d.value), 1),
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 4,
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid',
          },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2,
        },
        emphasis: {
          label: {
            fontSize: 16,
          },
        },
        data: funnelData.map((d, i) => ({
          ...d,
          itemStyle: {
            color: ['#1e40af', '#0891b2', '#059669'][i],
          },
        })),
      },
    ],
  };

  return (
    <Card
      title="考试通过转化率"
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <ReactECharts
        option={option}
        style={{ height: 280 }}
        opts={{ renderer: 'canvas' }}
      />
      <div
        style={{
          marginTop: 12,
          padding: 12,
          background: '#f8fafc',
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
          各科目通过率明细
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {conversionData.map((item) => (
            <div
              key={item.subject}
              style={{
                padding: 8,
                background: '#fff',
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: 12, color: '#64748b' }}>{item.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 4 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#059669' }}>
                  {item.passRate}
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 2 }}>%</span>
                <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
                  {item.passed}/{item.completed}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
