import React, { useMemo, useState } from 'react';
import { Button, Space, Alert } from 'antd';
import { Plus, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { ScheduleFilter } from '@/components/schedule/ScheduleFilter';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { ScheduleDetailDrawer } from '@/components/schedule/ScheduleDetailDrawer';
import { useScheduleStore } from '@/store/scheduleStore';
import { Schedule, ScheduleFilter as FilterType } from '@/types';

const defaultFilters: FilterType = {
  keyword: '',
  dateRange: null,
  coachName: '',
  studentName: '',
  status: '',
};

export const SchedulePage: React.FC = () => {
  const schedules = useScheduleStore((s) => s.schedules);
  const [filters, setFilters] = useState<FilterType>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);

  const absentSchedules = schedules.filter((s) => s.isAbsent);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (
          !s.id.toLowerCase().includes(kw) &&
          !s.studentName.toLowerCase().includes(kw) &&
          !s.coachName.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        const date = dayjs(s.trainingDate);
        if (date.isBefore(dayjs(start), 'day') || date.isAfter(dayjs(end), 'day')) {
          return false;
        }
      }
      if (filters.coachName && s.coachName !== filters.coachName) {
        return false;
      }
      if (filters.studentName && s.studentName !== filters.studentName) {
        return false;
      }
      if (filters.status && s.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [schedules, filters]);

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormOpen(true);
  };

  const handleViewDetail = (schedule: Schedule) => {
    setViewingSchedule(schedule);
    setDetailOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingSchedule(null);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          排班看板
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
          新增排班
        </Button>
      </div>

      {absentSchedules.length > 0 && (
        <Alert
          showIcon
          icon={<AlertTriangle size={16} />}
          type="error"
          message={`当前有 ${absentSchedules.length} 条异常缺勤记录，请及时处理`}
          style={{ marginBottom: 16 }}
        />
      )}

      <ScheduleFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
      />

      <ScheduleTable
        data={filteredSchedules}
        onEdit={handleEdit}
        onViewDetail={handleViewDetail}
      />

      <ScheduleForm
        open={formOpen}
        editingSchedule={editingSchedule}
        onCancel={() => {
          setFormOpen(false);
          setEditingSchedule(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ScheduleDetailDrawer
        open={detailOpen}
        schedule={viewingSchedule}
        onClose={() => {
          setDetailOpen(false);
          setViewingSchedule(null);
        }}
      />
    </div>
  );
};
