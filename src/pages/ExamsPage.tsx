import React, { useMemo, useState } from 'react';
import { Button, Space, App, Dropdown } from 'antd';
import { Plus, MoreHorizontal, Trash2, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { ExamFilter } from '@/components/exam/ExamFilter';
import { ExamTable } from '@/components/exam/ExamTable';
import { ExamForm } from '@/components/exam/ExamForm';
import { useExamStore } from '@/store/examStore';
import { ExamAppointment, ExamFilter as FilterType } from '@/types';

const defaultFilters: FilterType = {
  keyword: '',
  studentName: '',
  subject: '',
  dateRange: null,
  status: '',
};

export const ExamsPage: React.FC = () => {
  const { message, modal } = App.useApp();
  const appointments = useExamStore((s) => s.appointments);
  const batchDeleteAppointments = useExamStore((s) => s.batchDeleteAppointments);

  const [filters, setFilters] = useState<FilterType>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ExamAppointment | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (
          !a.id.toLowerCase().includes(kw) &&
          !a.studentName.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      if (filters.studentName && a.studentName !== filters.studentName) {
        return false;
      }
      if (filters.subject && a.subject !== filters.subject) {
        return false;
      }
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        const date = dayjs(a.appointmentDate);
        if (date.isBefore(dayjs(start), 'day') || date.isAfter(dayjs(end), 'day')) {
          return false;
        }
      }
      if (filters.status && a.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [appointments, filters]);

  const handleAdd = () => {
    setEditingAppointment(null);
    setFormOpen(true);
  };

  const handleEdit = (appointment: ExamAppointment) => {
    setEditingAppointment(appointment);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingAppointment(null);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的考试预约记录');
      return;
    }
    modal.confirm({
      title: '确认批量删除',
      content: `即将删除 ${selectedRowKeys.length} 条考试预约记录，该操作不可恢复，是否继续？`,
      okText: '确认删除',
      cancelText: '返回',
      okButtonProps: { danger: true },
      onOk: () => {
        const result = batchDeleteAppointments(selectedRowKeys.map(String));
        message.success(result.message);
        setSelectedRowKeys([]);
      },
    });
  };

  const batchItems = [
    {
      key: 'delete',
      label: `批量删除 (${selectedRowKeys.length})`,
      icon: <Trash2 size={14} />,
      disabled: selectedRowKeys.length === 0,
      danger: true,
      onClick: handleBatchDelete,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          考试预约与通过跟踪
        </div>
        <Space>
          <Dropdown
            menu={{ items: batchItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button icon={<MoreHorizontal size={16} />}>
              <Space size={4}>
                批量操作
                <ChevronDown size={14} />
              </Space>
            </Button>
          </Dropdown>
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            新增预约
          </Button>
        </Space>
      </div>

      <ExamFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
      />

      <ExamTable
        data={filteredAppointments}
        onEdit={handleEdit}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={(keys) => setSelectedRowKeys(keys)}
      />

      <ExamForm
        open={formOpen}
        editingAppointment={editingAppointment}
        onCancel={() => {
          setFormOpen(false);
          setEditingAppointment(null);
        }}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};
