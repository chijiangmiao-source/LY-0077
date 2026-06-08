import React from 'react';
import { Table, Tag, Button, Space, App } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import { Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { ExamAppointment, ExamStatus, ExamSubject } from '@/types';
import { EXAM_STATUS_OPTIONS, EXAM_SUBJECT_OPTIONS } from '@/utils/constants';
import { useExamStore } from '@/store/examStore';

interface ExamTableProps {
  data: ExamAppointment[];
  loading?: boolean;
  onEdit: (appointment: ExamAppointment) => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
}

const getSubjectLabel = (subject: ExamSubject): string => {
  return EXAM_SUBJECT_OPTIONS.find((o) => o.value === subject)?.label || subject;
};

export const ExamTable: React.FC<ExamTableProps> = ({
  data,
  loading,
  onEdit,
  selectedRowKeys,
  onSelectionChange,
}) => {
  const { message, modal } = App.useApp();
  const deleteAppointment = useExamStore((s) => s.deleteAppointment);

  const handleDelete = (appointment: ExamAppointment) => {
    modal.confirm({
      title: '确认删除该考试预约？',
      content: `预约编号：${appointment.id}，学员：${appointment.studentName}，科目：${getSubjectLabel(appointment.subject)}`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteAppointment(appointment.id);
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<ExamAppointment> = [
    {
      title: '预约编号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      fixed: 'left',
      render: (text) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{text}</span>
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
      title: '考试科目',
      dataIndex: 'subject',
      key: 'subject',
      width: 140,
      render: (subject: ExamSubject) => getSubjectLabel(subject),
      filters: EXAM_SUBJECT_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.subject === value,
    },
    {
      title: '预约日期',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      width: 120,
      sorter: (a, b) => a.appointmentDate.localeCompare(b.appointmentDate),
    },
    {
      title: '考试场次',
      dataIndex: 'session',
      key: 'session',
      width: 170,
    },
    {
      title: '考试状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ExamStatus) => {
        const option = EXAM_STATUS_OPTIONS.find((o) => o.value === status);
        return <Tag color={option?.color}>{option?.label}</Tag>;
      },
      filters: EXAM_STATUS_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '是否通过',
      dataIndex: 'isPassed',
      key: 'isPassed',
      width: 100,
      render: (isPassed: boolean | undefined, record) => {
        if (record.status !== 'completed') {
          return <span style={{ color: '#94a3b8' }}>—</span>;
        }
        if (isPassed === undefined) {
          return <span style={{ color: '#94a3b8' }}>—</span>;
        }
        return isPassed ? (
          <Space size={4}>
            <CheckCircle size={14} color="#059669" />
            <span style={{ color: '#059669', fontWeight: 500 }}>已通过</span>
          </Space>
        ) : (
          <Space size={4}>
            <XCircle size={14} color="#dc2626" />
            <span style={{ color: '#dc2626', fontWeight: 500 }}>未通过</span>
          </Space>
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
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

  const rowSelection: TableRowSelection<ExamAppointment> | undefined =
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
      scroll={{ x: 1100 }}
      rowSelection={rowSelection}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
    />
  );
};
