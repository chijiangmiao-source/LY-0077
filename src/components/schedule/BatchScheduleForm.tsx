import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  Space,
  Table,
  App,
  Divider,
  Tag,
} from 'antd';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import { TIME_SLOTS, CAR_TYPES, STATUS_OPTIONS } from '@/utils/constants';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';
import { ScheduleFormData } from '@/types';

interface BatchScheduleFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ScheduleRow {
  key: string;
  studentName: string;
  coachName: string;
  carType: string;
  trainingDate: string;
  timeSlot: string;
  status: 'pending' | 'training' | 'completed' | 'cancelled';
}

const createEmptyRow = (): ScheduleRow => ({
  key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  studentName: '',
  coachName: '',
  carType: '',
  trainingDate: '',
  timeSlot: '',
  status: 'pending',
});

export const BatchScheduleForm: React.FC<BatchScheduleFormProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const { message, modal } = App.useApp();
  const batchAddSchedules = useScheduleStore((s) => s.batchAddSchedules);
  const studentNames = useStudentStore((s) => s.getStudentNames());
  const coachNames = useCoachStore((s) => s.getCoachNames());

  const [rows, setRows] = useState<ScheduleRow[]>([createEmptyRow()]);

  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const removeRow = (key: string) => {
    if (rows.length <= 1) {
      message.warning('至少保留一条排班记录');
      return;
    }
    setRows(rows.filter((r) => r.key !== key));
  };

  const updateRow = <K extends keyof ScheduleRow>(key: string, field: K, value: ScheduleRow[K]) => {
    setRows(rows.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const validateRows = (): { valid: boolean; message?: string } => {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.studentName) return { valid: false, message: `第 ${i + 1} 条：请选择学员` };
      if (!row.coachName) return { valid: false, message: `第 ${i + 1} 条：请选择教练` };
      if (!row.carType) return { valid: false, message: `第 ${i + 1} 条：请选择车型` };
      if (!row.trainingDate) return { valid: false, message: `第 ${i + 1} 条：请选择日期` };
      if (!row.timeSlot) return { valid: false, message: `第 ${i + 1} 条：请选择时段` };
      if (dayjs(row.trainingDate).isBefore(dayjs().startOf('day'))) {
        return { valid: false, message: `第 ${i + 1} 条：日期不能早于今天` };
      }
    }
    return { valid: true };
  };

  const handleSubmit = async () => {
    const validation = validateRows();
    if (!validation.valid) {
      message.error(validation.message || '表单验证失败');
      return;
    }
    const confirmResult = await new Promise<boolean>((resolve) => {
      modal.confirm({
        title: '确认批量新增',
        content: `即将新增 ${rows.length} 条排班记录，是否继续？`,
        okText: '确认新增',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
    if (!confirmResult) return;

    const dataList: ScheduleFormData[] = rows.map((r) => ({
      studentName: r.studentName,
      coachName: r.coachName,
      carType: r.carType,
      trainingDate: r.trainingDate,
      timeSlot: r.timeSlot,
      status: r.status,
    }));
    const result = batchAddSchedules(dataList);
    if (result.success) {
      message.success(result.message);
      if (result.errors && result.errors.length > 0) {
        modal.warning({
          title: '部分新增失败',
          content: (
            <div>
              <p style={{ marginBottom: 8 }}>共 {result.failCount} 条记录失败：</p>
              <ul style={{ paddingLeft: 16 }}>
                {result.errors.map((err, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      }
      onSuccess();
      handleCancel();
    } else {
      message.error(result.message || '批量新增失败');
    }
  };

  const handleCancel = () => {
    setRows([createEmptyRow()]);
    onCancel();
  };

  const columns = [
    {
      title: '学员',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 140,
      render: (_value: unknown, record: ScheduleRow) => (
        <Select
          allowClear
          placeholder="选择学员"
          style={{ width: '100%' }}
          value={record.studentName || undefined}
          onChange={(v) => updateRow(record.key, 'studentName', v || '')}
          options={studentNames.map((n) => ({ label: n, value: n }))}
          showSearch
          optionFilterProp="label"
        />
      ),
    },
    {
      title: '教练',
      dataIndex: 'coachName',
      key: 'coachName',
      width: 140,
      render: (_value: unknown, record: ScheduleRow) => (
        <Select
          allowClear
          placeholder="选择教练"
          style={{ width: '100%' }}
          value={record.coachName || undefined}
          onChange={(v) => updateRow(record.key, 'coachName', v || '')}
          options={coachNames.map((n) => ({ label: n, value: n }))}
          showSearch
          optionFilterProp="label"
        />
      ),
    },
    {
      title: '车型',
      dataIndex: 'carType',
      key: 'carType',
      width: 130,
      render: (_value: unknown, record: ScheduleRow) => (
        <Select
          allowClear
          placeholder="选择车型"
          style={{ width: '100%' }}
          value={record.carType || undefined}
          onChange={(v) => updateRow(record.key, 'carType', v || '')}
          options={CAR_TYPES.map((t) => ({ label: t, value: t }))}
        />
      ),
    },
    {
      title: '日期',
      dataIndex: 'trainingDate',
      key: 'trainingDate',
      width: 150,
      render: (_value: unknown, record: ScheduleRow) => (
        <DatePicker
          style={{ width: '100%' }}
          placeholder="选择日期"
          disabledDate={(current) =>
            current && current.isBefore(dayjs().startOf('day'))
          }
          value={record.trainingDate ? dayjs(record.trainingDate) : null}
          onChange={(date) =>
            updateRow(record.key, 'trainingDate', date ? date.format('YYYY-MM-DD') : '')
          }
        />
      ),
    },
    {
      title: '时段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 130,
      render: (_value: unknown, record: ScheduleRow) => (
        <Select
          allowClear
          placeholder="选择时段"
          style={{ width: '100%' }}
          value={record.timeSlot || undefined}
          onChange={(v) => updateRow(record.key, 'timeSlot', v || '')}
          options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (_value: unknown, record: ScheduleRow) => (
        <Select
          style={{ width: '100%' }}
          value={record.status}
          onChange={(v) => updateRow(record.key, 'status', v)}
          options={STATUS_OPTIONS.map((o) => ({ label: o.label, value: o.value }))}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      fixed: 'right' as const,
      render: (_value: unknown, record: ScheduleRow) => (
        <Button
          type="text"
          danger
          icon={<Minus size={14} />}
          onClick={() => removeRow(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title="批量新增排班"
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="确认批量新增"
      cancelText="取消"
      width={960}
      destroyOnClose
      footer={(_, { OkBtn, CancelBtn }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button icon={<Plus size={14} />} onClick={addRow}>
            添加一行
          </Button>
          <Space>
            <CancelBtn />
            <OkBtn />
          </Space>
        </div>
      )}
    >
      <div style={{ marginBottom: 12 }}>
        <Tag icon={<AlertCircle size={12} />} color="blue">
          可添加多条排班记录，系统将自动检测时间冲突
        </Tag>
      </div>
      <Divider style={{ margin: '8px 0 16px' }} />
      <Form layout="vertical">
        <Table
          rowKey="key"
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          scroll={{ x: 900 }}
        />
      </Form>
    </Modal>
  );
};
