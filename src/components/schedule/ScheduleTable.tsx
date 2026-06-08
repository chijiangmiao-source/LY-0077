import React from 'react';
import { Table, Tag, Button, Space, App } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import { Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { Schedule, CourseStatus } from '@/types';
import { STATUS_OPTIONS } from '@/utils/constants';
import { useScheduleStore } from '@/store/scheduleStore';

interface ScheduleTableProps {
  data: Schedule[];
  loading?: boolean;
  onEdit: (schedule: Schedule) => void;
  onViewDetail: (schedule: Schedule) => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  data,
  loading,
  onEdit,
  onViewDetail,
  selectedRowKeys,
  onSelectionChange,
}) => {
  const { message, modal } = App.useApp();
  const deleteSchedule = useScheduleStore((s) => s.deleteSchedule);

  const handleDelete = (schedule: Schedule) => {
    modal.confirm({
      title: '确认删除该排班？',
      content: `排班编号：${schedule.id}，学员：${schedule.studentName}`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteSchedule(schedule.id);
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<Schedule> = [
    {
      title: '排班编号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
            {text}
          </span>
          {record.isAbsent && (
            <AlertTriangle size={14} color="#dc2626" />
          )}
        </Space>
      ),
    },
    {
      title: '学员姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 100,
      sorter: (a, b) => a.studentName.localeCompare(b.studentName, 'zh'),
    },
    {
      title: '教练姓名',
      dataIndex: 'coachName',
      key: 'coachName',
      width: 100,
      sorter: (a, b) => a.coachName.localeCompare(b.coachName, 'zh'),
    },
    {
      title: '练车车型',
      dataIndex: 'carType',
      key: 'carType',
      width: 110,
    },
    {
      title: '练车日期',
      dataIndex: 'trainingDate',
      key: 'trainingDate',
      width: 120,
      sorter: (a, b) => a.trainingDate.localeCompare(b.trainingDate),
    },
    {
      title: '练车时段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 110,
    },
    {
      title: '课程状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CourseStatus) => {
        const option = STATUS_OPTIONS.find((o) => o.value === status);
        return <Tag color={option?.color}>{option?.label}</Tag>;
      },
      filters: STATUS_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => onViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<Pencil size={14} />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection: TableRowSelection<Schedule> | undefined =
    onSelectionChange
      ? {
          selectedRowKeys,
          onChange: onSelectionChange,
          preserveSelectedRowKeys: true,
        }
      : undefined;

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 1000 }}
      rowSelection={rowSelection}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
      rowClassName={(record) =>
        record.isAbsent ? '!bg-red-50 hover:!bg-red-100' : ''
      }
    />
  );
};
