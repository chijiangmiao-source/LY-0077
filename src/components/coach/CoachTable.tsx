import React from 'react';
import { Table, Button, Space, Popconfirm, App } from 'antd';
import { Pencil, Trash2, Phone, UserCheck, Car } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { Coach } from '@/types';
import { useCoachStore } from '@/store/coachStore';

interface CoachTableProps {
  data: Coach[];
  loading?: boolean;
  onEdit: (coach: Coach) => void;
}

export const CoachTable: React.FC<CoachTableProps> = ({
  data,
  loading,
  onEdit,
}) => {
  const { message, modal } = App.useApp();
  const deleteCoach = useCoachStore((s) => s.deleteCoach);

  const handleDelete = (coach: Coach) => {
    modal.confirm({
      title: '确认删除该教练？',
      content: `教练姓名：${coach.name}，手机号：${coach.phone}`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteCoach(coach.id);
        message.success('删除成功');
      },
    });
  };

  const columns: ColumnsType<Coach> = [
    {
      title: '教练姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name, 'zh'),
      render: (text) => (
        <Space>
          <UserCheck size={14} style={{ color: '#64748b' }} />
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
      title: '所教车型',
      dataIndex: 'carType',
      key: 'carType',
      width: 150,
      render: (text) => (
        <Space>
          <Car size={14} style={{ color: '#64748b' }} />
          <span
            style={{
              padding: '2px 10px',
              background: '#ecfdf5',
              color: '#059669',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {text}
          </span>
        </Space>
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
          <Popconfirm title="确认删除？">
            <Button
              type="link"
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Popconfirm>
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
