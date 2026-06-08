import React from 'react';
import { Form, Select, Input, DatePicker, Button, Space } from 'antd';
import { Search, RefreshCw, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { ProgressFilter } from '@/types';
import { LICENSE_TYPES, PROGRESS_STAGES, EXAM_SUBJECT_OPTIONS } from '@/utils/constants';
import { useStudentStore } from '@/store/studentStore';

const { RangePicker } = DatePicker;

interface ProgressFilterProps {
  filters: ProgressFilter;
  onChange: (filters: ProgressFilter) => void;
  onReset: () => void;
}

export const ProgressFilterComponent: React.FC<ProgressFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const studentNames = useStudentStore((s) => s.getStudentNames());

  const handleChange = (key: keyof ProgressFilter, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <div
      style={{
        padding: 20,
        background: '#f8fafc',
        borderRadius: 12,
        marginBottom: 16,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Filter size={16} style={{ color: '#475569' }} />
        <span style={{ fontWeight: 600, color: '#334155' }}>筛选条件</span>
      </div>
      <Form layout="vertical">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          <Form.Item label="关键词搜索" style={{ marginBottom: 0 }}>
            <Input
              allowClear
              prefix={<Search size={14} style={{ color: '#94a3b8' }} />}
              placeholder="搜索学员姓名/手机号"
              value={filters.keyword || ''}
              onChange={(e) => handleChange('keyword', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="学员姓名" style={{ marginBottom: 0 }}>
            <Select
              allowClear
              showSearch
              placeholder="选择学员"
              value={filters.studentName || undefined}
              onChange={(v) => handleChange('studentName', v)}
              optionFilterProp="children"
            >
              {studentNames.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="当前阶段" style={{ marginBottom: 0 }}>
            <Select
              allowClear
              placeholder="选择阶段"
              value={filters.currentStage || undefined}
              onChange={(v) => handleChange('currentStage', v)}
            >
              {PROGRESS_STAGES.map((stage) => (
                <Select.Option key={stage.value} value={stage.value}>
                  {stage.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="学车证型" style={{ marginBottom: 0 }}>
            <Select
              allowClear
              placeholder="选择证型"
              value={filters.licenseType || undefined}
              onChange={(v) => handleChange('licenseType', v)}
            >
              {LICENSE_TYPES.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="考试科目" style={{ marginBottom: 0 }}>
            <Select
              allowClear
              placeholder="选择科目"
              value={filters.examSubject || undefined}
              onChange={(v) => handleChange('examSubject', v)}
            >
              {EXAM_SUBJECT_OPTIONS.map((subject) => (
                <Select.Option key={subject.value} value={subject.value}>
                  {subject.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="时间范围" style={{ marginBottom: 0 }}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange as unknown as [dayjs.Dayjs, dayjs.Dayjs] | null}
              onChange={(dates) => handleChange('dateRange', dates)}
            />
          </Form.Item>
          <Form.Item label="时间字段" style={{ marginBottom: 0 }}>
            <Select
              value={filters.dateField || 'updatedAt'}
              onChange={(v) => handleChange('dateField', v)}
            >
              <Select.Option value="createdAt">报名时间</Select.Option>
              <Select.Option value="updatedAt">更新时间</Select.Option>
              <Select.Option value="stageEntered">阶段进入时间</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Space>
            <Button icon={<RefreshCw size={14} />} onClick={handleReset}>
              重置筛选
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};
