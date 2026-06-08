import React, { useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import {
  CalendarDays,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Car,
} from 'lucide-react';
import dayjs from 'dayjs';
import { StatsCard } from '@/components/statistics/StatsCard';
import { CoachBarChart } from '@/components/statistics/CoachBarChart';
import { StatusPieChart } from '@/components/statistics/StatusPieChart';
import { DateTrendChart } from '@/components/statistics/DateTrendChart';
import { CarTypePieChart } from '@/components/statistics/CarTypePieChart';
import { StatisticsFilter } from '@/components/statistics/StatisticsFilter';
import { useScheduleStore } from '@/store/scheduleStore';
import { StatisticsFilter as FilterType } from '@/types';

const defaultFilters: FilterType = {
  dateRange: null,
  coachName: '',
  carType: '',
  status: '',
};

export const StatisticsPage: React.FC = () => {
  const schedules = useScheduleStore((s) => s.schedules);
  const [filters, setFilters] = useState<FilterType>(defaultFilters);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        const date = dayjs(s.trainingDate);
        if (
          date.isBefore(dayjs(start), 'day') ||
          date.isAfter(dayjs(end), 'day')
        ) {
          return false;
        }
      }
      if (filters.coachName && s.coachName !== filters.coachName) {
        return false;
      }
      if (filters.carType && s.carType !== filters.carType) {
        return false;
      }
      if (filters.status && s.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [schedules, filters]);

  const stats = {
    total: filteredSchedules.length,
    pending: filteredSchedules.filter((s) => s.status === 'pending').length,
    training: filteredSchedules.filter((s) => s.status === 'training').length,
    completed: filteredSchedules.filter((s) => s.status === 'completed').length,
    cancelled: filteredSchedules.filter((s) => s.status === 'cancelled').length,
  };

  const handleReset = () => {
    setFilters(defaultFilters);
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

      <StatisticsFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
      />

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
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="已取消"
            value={stats.cancelled}
            icon={XCircle}
            color="#dc2626"
            bgColor="#fee2e2"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="涉及车型"
            value={new Set(filteredSchedules.map((s) => s.carType)).size}
            icon={Car}
            color="#8b5cf6"
            bgColor="#ede9fe"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <StatusPieChart schedules={filteredSchedules} />
        </Col>
        <Col xs={24} lg={12}>
          <CarTypePieChart schedules={filteredSchedules} />
        </Col>
        <Col xs={24}>
          <CoachBarChart schedules={filteredSchedules} />
        </Col>
        <Col xs={24}>
          <DateTrendChart schedules={filteredSchedules} />
        </Col>
      </Row>
    </div>
  );
};
