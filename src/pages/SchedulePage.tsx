import React, { useMemo, useState } from 'react';
import { Button, Space, Alert, App, Dropdown } from 'antd';
import { Plus, AlertTriangle, MoreHorizontal, ListPlus, Edit3, XCircle, Trash2, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';
import { ScheduleFilter } from '@/components/schedule/ScheduleFilter';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { ScheduleDetailDrawer } from '@/components/schedule/ScheduleDetailDrawer';
import { BatchScheduleForm } from '@/components/schedule/BatchScheduleForm';
import { BatchAdjustForm } from '@/components/schedule/BatchAdjustForm';
import { useScheduleStore } from '@/store/scheduleStore';
import { Schedule, ScheduleFilter as FilterType } from '@/types';

const defaultFilters: FilterType = {
  keyword: '',
  dateRange: null,
  coachName: '',
  studentName: '',
  carType: '',
  status: '',
};

export const SchedulePage: React.FC = () => {
  const { message, modal } = App.useApp();
  const schedules = useScheduleStore((s) => s.schedules);
  const batchCancelSchedules = useScheduleStore((s) => s.batchCancelSchedules);
  const batchDeleteSchedules = useScheduleStore((s) => s.batchDeleteSchedules);

  const [filters, setFilters] = useState<FilterType>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState<Schedule | null>(null);
  const [batchAddOpen, setBatchAddOpen] = useState(false);
  const [batchAdjustOpen, setBatchAdjustOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const absentSchedules = schedules.filter((s) => s.isAbsent);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (
          !s.id.toLowerCase().includes(kw) &&
          !s.studentName.toLowerCase().includes(kw) &&
          !s.coachName.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        const date = dayjs(s.trainingDate);
        if (date.isBefore(dayjs(start), 'day') || date.isAfter(dayjs(end), 'day')) {
          return false;
        }
      }
      if (filters.coachName && s.coachName !== filters.coachName) {
        return false;
      }
      if (filters.studentName && s.studentName !== filters.studentName) {
        return false;
      }
      if (filters.carType && s.carType !== filters.carType) {
        return false;
      }
      if (filters.status && s.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [schedules, filters]);

  const handleAdd = () => {
    setEditingSchedule(null);
    setFormOpen(true);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormOpen(true);
  };

  const handleViewDetail = (schedule: Schedule) => {
    setViewingSchedule(schedule);
    setDetailOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingSchedule(null);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleBatchCancel = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要取消的排班');
      return;
    }
    modal.confirm({
      title: '确认批量取消',
      content: `即将取消 ${selectedRowKeys.length} 条排班记录，是否继续？`,
      okText: '确认取消',
      cancelText: '返回',
      okButtonProps: { danger: true },
      onOk: () => {
        const result = batchCancelSchedules(selectedRowKeys.map(String));
        if (result.success) {
          message.success(result.message);
          if (result.errors && result.errors.length > 0) {
            modal.warning({
              title: '部分取消失败',
              content: (
                <div>
                  <p style={{ marginBottom: 8 }}>共 {result.failCount} 条记录失败：</p>
                  <ul style={{ paddingLeft: 16 }}>
                    {result.errors.map((err, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{err}</li>
                    ))}
                  </ul>
                </div>
              ),
            });
          }
        } else {
          message.error(result.message || '批量取消失败');
        }
        setSelectedRowKeys([]);
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的排班');
      return;
    }
    modal.confirm({
      title: '确认批量删除',
      content: `即将删除 ${selectedRowKeys.length} 条排班记录，该操作不可恢复，是否继续？`,
      okText: '确认删除',
      cancelText: '返回',
      okButtonProps: { danger: true },
      onOk: () => {
        const result = batchDeleteSchedules(selectedRowKeys.map(String));
        message.success(result.message);
        setSelectedRowKeys([]);
      },
    });
  };

  const handleBatchAdjust = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要调整的排班');
      return;
    }
    setBatchAdjustOpen(true);
  };

  const batchItems = [
    {
      key: 'add',
      label: '批量新增',
      icon: <ListPlus size={14} />,
      onClick: () => setBatchAddOpen(true),
    },
    {
      key: 'adjust',
      label: `批量调整 (${selectedRowKeys.length})`,
      icon: <Edit3 size={14} />,
      disabled: selectedRowKeys.length === 0,
      onClick: handleBatchAdjust,
    },
    {
      key: 'cancel',
      label: `批量取消 (${selectedRowKeys.length})`,
      icon: <XCircle size={14} />,
      disabled: selectedRowKeys.length === 0,
      onClick: handleBatchCancel,
    },
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
          排班看板
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
            新增排班
          </Button>
        </Space>
      </div>

      {absentSchedules.length > 0 && (
        <Alert
          showIcon
          icon={<AlertTriangle size={16} />}
          type="error"
          message={`当前有 ${absentSchedules.length} 条异常缺勤记录，请及时处理`}
          style={{ marginBottom: 16 }}
        />
      )}

      <ScheduleFilter
        filters={filters}
        onChange={setFilters}
        onReset={handleReset}
      />

      <ScheduleTable
        data={filteredSchedules}
        onEdit={handleEdit}
        onViewDetail={handleViewDetail}
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={(keys) => setSelectedRowKeys(keys)}
      />

      <ScheduleForm
        open={formOpen}
        editingSchedule={editingSchedule}
        onCancel={() => {
          setFormOpen(false);
          setEditingSchedule(null);
        }}
        onSuccess={handleFormSuccess}
      />

      <ScheduleDetailDrawer
        open={detailOpen}
        schedule={viewingSchedule}
        onClose={() => {
          setDetailOpen(false);
          setViewingSchedule(null);
        }}
      />

      <BatchScheduleForm
        open={batchAddOpen}
        onCancel={() => setBatchAddOpen(false)}
        onSuccess={() => setBatchAddOpen(false)}
      />

      <BatchAdjustForm
        open={batchAdjustOpen}
        selectedIds={selectedRowKeys.map(String)}
        onCancel={() => {
          setBatchAdjustOpen(false);
        }}
        onSuccess={() => {
          setBatchAdjustOpen(false);
          setSelectedRowKeys([]);
        }}
      />
    </div>
  );
};
