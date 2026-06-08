import React from 'react';
import { Select, DatePicker, Button, Space, Row, Col } from 'antd';
import { RefreshCw } from 'lucide-react';
import type { Dayjs } from 'dayjs';
import { StatisticsFilter as FilterType } from '@/types';
import { STATUS_OPTIONS, CAR_TYPES } from '@/utils/constants';
import { useCoachStore } from '@/store/coachStore';

const { RangePicker } = DatePicker;

interface StatisticsFilterProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
  onReset: () => void;
}

export const StatisticsFilter: React.FC<StatisticsFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const coachNames = useCoachStore((s) => s.getCoachNames());

  return (
    <div
      style={{
        marginBottom: 20,
        padding: 16,
        background: '#f8fafc',
        borderRadius: 8,
      }}
    >
      <Row gutter={[16, 12]} align="middle">
        <Col xs={24} sm={12} md={8} lg={6}>
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['开始日期', '结束日期']}
            value={
              filters.dateRange
                ? ([filters.dateRange[0], filters.dateRange[1]] as unknown as [
                    Dayjs,
                    Dayjs
                  ])
                : null
            }
            onChange={(dates) =>
              onChange({
                ...filters,
                dateRange: dates
                  ? [
                      (dates as unknown as [Dayjs, Dayjs])[0].format('YYYY-MM-DD'),
                      (dates as unknown as [Dayjs, Dayjs])[1].format('YYYY-MM-DD'),
                    ]
                  : null,
              })
            }
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
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
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            allowClear
            placeholder="选择车型"
            style={{ width: '100%' }}
            value={filters.carType || undefined}
            onChange={(v) => onChange({ ...filters, carType: v })}
            options={CAR_TYPES.map((t) => ({ label: t, value: t }))}
            showSearch
            optionFilterProp="label"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            allowClear
            placeholder="课程状态"
            style={{ width: '100%' }}
            value={filters.status || undefined}
            onChange={(v) => onChange({ ...filters, status: v || '' })}
            options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
          />
        </Col>
        <Col xs={24}>
          <Space>
            <Button icon={<RefreshCw size={14} />} onClick={onReset}>
              重置筛选
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
