import React from 'react';
import { Table, Button, Space, App } from 'antd';
import { Pencil, Trash2, Phone, User } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { Student } from '@/types';
import { useStudentStore } from '@/store/studentStore';

interface StudentTableProps {
  data: Student[];
  loading?: boolean;
  onEdit: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  data,
  loading,
  onEdit,
}) => {
  const { message, modal } = App.useApp();
  const deleteStudent = useStudentStore((s) => s.deleteStudent);

  const handleDelete = (student: Student) => {
    modal.confirm({
      title: '确认删除该学员？',
      content: `学员姓名：${student.name}，手机号：${student.phone}`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteStudent(student.id);
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<Student> = [
    {
      title: '学员姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh'),
      render: (text) => (
        <Space>
          <User size={14} style={{ color: '#64748b' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '联系方式',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text) => (
        <Space>
          <Phone size={14} style={{ color: '#64748b' }} />
          <span style={{ fontFamily: 'monospace' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '学车类型',
      dataIndex: 'licenseType',
      key: 'licenseType',
      width: 120,
      render: (text) => (
        <span
          style={{
            padding: '2px 10px',
            background: '#eff6ff',
            color: '#1e40af',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (text) => new Date(text).toLocaleString('zh-CN'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: 700 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
      }}
    />
  );
};
