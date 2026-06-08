import React from 'react';
import { Input, Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { Search, RefreshCw } from 'lucide-react';
import type { Dayjs } from 'dayjs';
import { ScheduleFilter as FilterType } from '@/types';
import { STATUS_OPTIONS } from '@/utils/constants';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';

const { RangePicker } = DatePicker;

interface ScheduleFilterProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  onReset: () => void;
}

export const ScheduleFilter: React.FC<ScheduleFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const studentNames = useStudentStore((s) => s.getStudentNames());
  const coachNames = useCoachStore((s) => s.getCoachNames());

  return (
    <div style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
      <Row gutter={[16, 12]} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            allowClear
            placeholder="搜索排班编号/学员/教练"
            prefix={<Search size={16} style={{ color: '#94a3b8' }} />}
            value={filters.keyword}
            onChange={(e) => onChange({ ...filters, keyword: e.target.value })}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['开始日期', '结束日期']}
            value={
              filters.dateRange
                ? [filters.dateRange[0], filters.dateRange[1]] as unknown as [Dayjs, Dayjs]
                : null
            }
            onChange={(dates) =>
              onChange({
                ...filters,
                dateRange: dates
                  ? [(dates as unknown as [Dayjs, Dayjs])[0].format('YYYY-MM-DD'),
                     (dates as unknown as [Dayjs, Dayjs])[1].format('YYYY-MM-DD')]
                  : null,
              })
            }
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            allowClear
            placeholder="选择学员"
            style={{ width: '100%' }}
            value={filters.studentName || undefined}
            onChange={(v) => onChange({ ...filters, studentName: v })}
            options={studentNames.map((n) => ({ label: n, value: n }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            allowClear
            placeholder="选择教练"
            style={{ width: '100%' }}
            value={filters.coachName || undefined}
            onChange={(v) => onChange({ ...filters, coachName: v })}
            options={coachNames.map((n) => ({ label: n, value: n }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Select
            allowClear
            placeholder="课程状态"
            style={{ width: '100%' }}
            value={filters.status || undefined}
            onChange={(v) => onChange({ ...filters, status: v || '' })}
            options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Space>
            <Button
              icon={<RefreshCw size={14} />}
              onClick={onReset}
            >
              重置
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
