import React, { useState, useMemo, useEffect } from 'react';
import { Button, Space, Row, Col, Tooltip } from 'antd';
import {
  RefreshCw,
  Users,
  Award,
  FileCheck,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';
import { ProgressFilterComponent } from '@/components/progress/ProgressFilter';
import { ProgressTable } from '@/components/progress/ProgressTable';
import { ProgressDetailDrawer } from '@/components/progress/ProgressDetailDrawer';
import { StatsCard } from '@/components/statistics/StatsCard';
import { useProgressStore } from '@/store/progressStore';
import { useStudentStore } from '@/store/studentStore';
import { StudentProgress, ProgressFilter } from '@/types';
import { PROGRESS_STAGES } from '@/utils/constants';
import { getProgressStageOrder } from '@/utils/helpers';

const defaultFilters: ProgressFilter = {
  keyword: '',
  studentName: '',
  currentStage: '',
  licenseType: '',
  examSubject: '',
  dateRange: null,
  dateField: 'updatedAt',
};

export const ProgressPage: React.FC = () => {
  const progresses = useProgressStore((s) => s.progresses);
  const recalculateAllProgresses = useProgressStore((s) => s.recalculateAllProgresses);
  const initProgressForStudent = useProgressStore((s) => s.initProgressForStudent);
  const students = useStudentStore((s) => s.students);

  const [filters, setFilters] = useState<ProgressFilter>(defaultFilters);
  const [detailProgress, setDetailProgress] = useState<StudentProgress | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    students.forEach((student) => {
      initProgressForStudent(student.id, student.name, student.licenseType);
    });
  }, [students, initProgressForStudent]);

  const handleViewDetail = (progress: StudentProgress) => {
    setDetailProgress(progress);
    setDetailOpen(true);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleRecalculate = () => {
    recalculateAllProgresses();
  };

  const filteredProgresses = useMemo(() => {
    return progresses.filter((p) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const student = students.find((s) => s.name === p.studentName);
        const matchesName = p.studentName.toLowerCase().includes(kw);
        const matchesPhone = student?.phone.toLowerCase().includes(kw);
        if (!matchesName && !matchesPhone) return false;
      }

      if (filters.studentName && p.studentName !== filters.studentName) {
        return false;
      }

      if (filters.currentStage && p.currentStage !== filters.currentStage) {
        return false;
      }

      if (filters.licenseType && p.licenseType !== filters.licenseType) {
        return false;
      }

      if (filters.examSubject && !p.passedSubjects.includes(filters.examSubject as 'subject1' | 'subject2' | 'subject3' | 'subject4')) {
        return false;
      }

      if (filters.dateRange && filters.dateField) {
        const [start, end] = filters.dateRange;
        let dateToCheck: dayjs.Dayjs;

        if (filters.dateField === 'stageEntered') {
          const timelineEntry = p.stageTimeline.find((t) => t.stage === p.currentStage);
          if (!timelineEntry) return false;
          dateToCheck = dayjs(timelineEntry.enteredAt);
        } else {
          dateToCheck = dayjs(p[filters.dateField]);
        }

        if (
          dateToCheck.isBefore(dayjs(start), 'day') ||
          dateToCheck.isAfter(dayjs(end), 'day')
        ) {
          return false;
        }
      }

      return true;
    });
  }, [progresses, filters, students]);

  const stats = useMemo(() => {
    const total = progresses.length;
    const byStage: Record<string, number> = {};
    PROGRESS_STAGES.forEach((s) => (byStage[s.value] = 0));
    progresses.forEach((p) => {
      byStage[p.currentStage] = (byStage[p.currentStage] || 0) + 1;
    });

    const pendingAdvance = progresses.filter((p) => {
      const order = getProgressStageOrder(p.currentStage);
      return order >= 1 && order <= 5;
    }).length;

    const certified = byStage['certified'] || 0;
    const archived = byStage['archived'] || 0;
    const totalCompleted = certified + archived;

    return {
      total,
      byStage,
      pendingAdvance,
      certified,
      archived,
      totalCompleted,
    };
  }, [progresses]);

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          学员拿证进度管理
        </div>
        <Space>
          <Tooltip title="重新同步所有学员进度">
            <Button icon={<RefreshCw size={16} />} onClick={handleRecalculate}>
              同步进度
            </Button>
          </Tooltip>
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="学员总数"
            value={stats.total}
            icon={Users}
            color="#1e40af"
            bgColor="#dbeafe"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="待推进学员"
            value={stats.pendingAdvance}
            icon={Clock}
            color="#d97706"
            bgColor="#fef3c7"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="已拿证学员"
            value={stats.certified}
            icon={Award}
            color="#7c3aed"
            bgColor="#ede9fe"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatsCard
            title="已归档学员"
            value={stats.archived}
            icon={FileCheck}
            color="#059669"
            bgColor="#d1fae5"
          />
        </Col>
      </Row>

      <ProgressFilterComponent
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
      />

      <ProgressTable
        data={filteredProgresses}
        onViewDetail={handleViewDetail}
      />

      <ProgressDetailDrawer
        open={detailOpen}
        progress={detailProgress}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
};
