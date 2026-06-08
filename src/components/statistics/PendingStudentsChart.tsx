import React, { useMemo } from 'react';
import { Card, Tag, List, Avatar } from 'antd';
import {
  CalendarDays,
  BookOpen,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import { StudentProgress } from '@/types';
import { PROGRESS_STAGES } from '@/utils/constants';
import { getProgressStageLabel, getProgressStageColor } from '@/utils/helpers';
import { getProgressStageOrder } from '@/utils/helpers';

interface PendingStudentsChartProps {
  progresses: StudentProgress[];
}

export const PendingStudentsChart: React.FC<PendingStudentsChartProps> = ({
  progresses,
}) => {
  const pendingData = useMemo(() => {
    const pendingStudents = progresses.filter((p) => {
      const order = getProgressStageOrder(p.currentStage);
      return order >= 1 && order <= 5;
    });

    const byStage: Record<string, StudentProgress[]> = {};
    PROGRESS_STAGES.forEach((s) => {
      const order = getProgressStageOrder(s.value);
      if (order >= 1 && order <= 5) {
        byStage[s.value] = [];
      }
    });

    pendingStudents.forEach((p) => {
      if (byStage[p.currentStage]) {
        byStage[p.currentStage].push(p);
      }
    });

    Object.keys(byStage).forEach((key) => {
      byStage[key].sort((a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf());
    });

    return byStage;
  }, [progresses]);

  const stageTips: Record<string, string> = {
    scheduled: '建议尽快安排训练开始',
    training: '关注训练进度，及时完成课程',
    course_completed: '尽快预约考试',
    exam_booked: '提醒学员参加考试',
    exam_completed: '确认学员拿证并归档',
  };

  const stageIcons: Record<string, React.ReactNode> = {
    scheduled: <CalendarDays size={16} />,
    training: <BookOpen size={16} />,
    course_completed: <FileText size={16} />,
    exam_booked: <Clock size={16} />,
    exam_completed: <AlertCircle size={16} />,
  };

  const stageKeys = Object.keys(pendingData);
  const totalPending = stageKeys.reduce(
    (sum, key) => sum + pendingData[key].length,
    0
  );

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>待推进学员分析</span>
          <Tag color="#d97706" style={{ marginRight: 0 }}>
            共 {totalPending} 人待推进
          </Tag>
        </div>
      }
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 12,
        }}
      >
        {stageKeys.map((stageKey) => {
          const students = pendingData[stageKey];
          const stageLabel = getProgressStageLabel(stageKey);
          const stageColor = getProgressStageColor(stageKey);

          return (
            <div
              key={stageKey}
              style={{
                background: '#f8fafc',
                borderRadius: 10,
                padding: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: stageColor + '20',
                      color: stageColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stageIcons[stageKey]}
                  </div>
                  <span style={{ fontWeight: 600, color: '#334155', fontSize: 13 }}>
                    {stageLabel}
                  </span>
                </div>
                <Tag color={stageColor} style={{ marginRight: 0 }}>
                  {students.length} 人
                </Tag>
              </div>

              {stageTips[stageKey] && (
                <div
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    padding: '4px 8px',
                    background: '#fff7ed',
                    borderRadius: 4,
                    marginBottom: 10,
                  }}
                >
                  💡 {stageTips[stageKey]}
                </div>
              )}

              <List
                size="small"
                dataSource={students.slice(0, 3)}
                locale={{ emptyText: '暂无' }}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '6px 0',
                      border: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar
                          size={22}
                          style={{
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            fontSize: 11,
                          }}
                        >
                          {item.studentName.slice(0, 1)}
                        </Avatar>
                        <span style={{ fontSize: 12, color: '#334155' }}>
                          {item.studentName}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>
                        {dayjs(item.updatedAt).format('MM-DD')}
                      </span>
                    </div>
                  </List.Item>
                )}
              />
              {students.length > 3 && (
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: '#64748b',
                    paddingTop: 4,
                  }}
                >
                  还有 {students.length - 3} 人...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
