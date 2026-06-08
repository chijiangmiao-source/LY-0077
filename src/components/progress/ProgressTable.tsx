import React from 'react';
import { Table, Tag, Button, Space, App, Avatar } from 'antd';
import { Eye, Award, Clock, BookOpen, CheckCircle, Archive } from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import { StudentProgress } from '@/types';
import { PROGRESS_STAGES, EXAM_SUBJECT_OPTIONS } from '@/utils/constants';
import { useProgressStore } from '@/store/progressStore';
import dayjs from 'dayjs';

interface ProgressTableProps {
  data: StudentProgress[];
  loading?: boolean;
  onViewDetail: (progress: StudentProgress) => void;
}

const getStageTagColor = (stage: string) => {
  const stageInfo = PROGRESS_STAGES.find((s) => s.value === stage);
  const colorMap: Record<string, string> = {
    default: '#64748b',
    processing: '#d97706',
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
  };
  return colorMap[stageInfo?.color || 'default'];
};

export const ProgressTable: React.FC<ProgressTableProps> = ({
  data,
  loading,
  onViewDetail,
}) => {
  const { message, modal } = App.useApp();
  const certifyStudent = useProgressStore((s) => s.certifyStudent);
  const archiveStudent = useProgressStore((s) => s.archiveStudent);

  const handleCertify = (record: StudentProgress) => {
    modal.confirm({
      title: '确认学员已拿证？',
      content: `学员 ${record.studentName} 将标记为"已拿证"阶段`,
      okText: '确认拿证',
      cancelText: '取消',
      onOk: () => {
        certifyStudent(record.studentName);
        message.success('已标记拿证');
      },
    });
  };

  const handleArchive = (record: StudentProgress) => {
    modal.confirm({
      title: '确认归档该学员档案？',
      content: `学员 ${record.studentName} 的档案将被归档`,
      okText: '确认归档',
      cancelText: '取消',
      onOk: () => {
        archiveStudent(record.studentName);
        message.success('档案已归档');
      },
    });
  };

  const columns: ColumnsType<StudentProgress> = [
    {
      title: '学员信息',
      key: 'studentInfo',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <Space>
          <Avatar
            size={36}
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              fontWeight: 600,
            }}
          >
            {record.studentName.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>
              {record.studentName}
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              {record.licenseType} 证
            </div>
          </div>
        </Space>
      ),
      sorter: (a, b) => a.studentName.localeCompare(b.studentName, 'zh'),
    },
    {
      title: '当前阶段',
      dataIndex: 'currentStage',
      key: 'currentStage',
      width: 130,
      render: (stage) => {
        const stageInfo = PROGRESS_STAGES.find((s) => s.value === stage);
        return (
          <Tag
            color={getStageTagColor(stage)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {stageInfo?.label || stage}
          </Tag>
        );
      },
      filters: PROGRESS_STAGES.map((s) => ({ text: s.label, value: s.value })),
      onFilter: (value, record) => record.currentStage === value,
    },
    {
      title: '已通过科目',
      dataIndex: 'passedSubjects',
      key: 'passedSubjects',
      width: 220,
      render: (subjects: string[]) => {
        if (subjects.length === 0) {
          return <span style={{ color: '#94a3b8' }}>暂无通过科目</span>;
        }
        return (
          <Space wrap>
            {subjects.map((subject) => {
              const subjectInfo = EXAM_SUBJECT_OPTIONS.find((s) => s.value === subject);
              return (
                <Tag
                  key={subject}
                  color="#059669"
                  icon={<CheckCircle size={12} />}
                  style={{ borderRadius: 4 }}
                >
                  {subjectInfo?.label || subject}
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: '训练数据',
      key: 'training',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={14} style={{ color: '#64748b' }} />
            <span style={{ fontSize: 13 }}>
              完成课程：<strong>{record.completedSchedules}</strong> 次
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} style={{ color: '#64748b' }} />
            <span style={{ fontSize: 13 }}>
              训练时长：<strong>{record.totalTrainingHours}</strong> 小时
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: '报名时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
    },
    {
      title: '最近更新',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<Eye size={14} />}
            onClick={() => onViewDetail(record)}
          >
            查看详情
          </Button>
          {record.currentStage === 'exam_completed' && (
            <Button
              type="link"
              size="small"
              icon={<Award size={14} />}
              style={{ color: '#7c3aed' }}
              onClick={() => handleCertify(record)}
            >
              标记拿证
            </Button>
          )}
          {record.currentStage === 'certified' && (
            <Button
              type="link"
              size="small"
              icon={<Archive size={14} />}
              onClick={() => handleArchive(record)}
            >
              归档
            </Button>
          )}
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
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 名学员`,
      }}
    />
  );
};
