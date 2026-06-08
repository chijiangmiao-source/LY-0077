import React from 'react';
import { Row, Col } from 'antd';
import {
  CalendarDays,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { StatsCard } from '@/components/statistics/StatsCard';
import { CoachBarChart } from '@/components/statistics/CoachBarChart';
import { StatusPieChart } from '@/components/statistics/StatusPieChart';
import { DateTrendChart } from '@/components/statistics/DateTrendChart';
import { useScheduleStore } from '@/store/scheduleStore';

export const StatisticsPage: React.FC = () => {
  const schedules = useScheduleStore((s) => s.schedules);

  const stats = {
    total: schedules.length,
    pending: schedules.filter((s) => s.status === 'pending').length,
    training: schedules.filter((s) => s.status === 'training').length,
    completed: schedules.filter((s) => s.status === 'completed').length,
    cancelled: schedules.filter((s) => s.status === 'cancelled').length,
  };

  return (
    <div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 20,
        }}
      >
        数据统计看板
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="总排班次"
            value={stats.total}
            icon={CalendarDays}
            color="#1e40af"
            bgColor="#dbeafe"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="待开始"
            value={stats.pending}
            icon={Clock}
            color="#64748b"
            bgColor="#f1f5f9"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="训练中"
            value={stats.training}
            icon={PlayCircle}
            color="#d97706"
            bgColor="#fef3c7"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="已完成"
            value={stats.completed}
            icon={CheckCircle2}
            color="#059669"
            bgColor="#d1fae5"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <StatusPieChart schedules={schedules} />
        </Col>
        <Col xs={24} lg={14}>
          <CoachBarChart schedules={schedules} />
        </Col>
        <Col xs={24}>
          <DateTrendChart schedules={schedules} />
        </Col>
      </Row>
    </div>
  );
};
