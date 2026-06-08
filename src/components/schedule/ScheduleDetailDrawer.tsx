import React, { useState } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  List,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  App,
  Empty,
  Tooltip,
} from 'antd';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  User,
  UserCheck,
  Car,
  CalendarDays,
  Clock,
} from 'lucide-react';
import dayjs from 'dayjs';
import { Schedule, CourseRecord } from '@/types';
import { STATUS_OPTIONS, TRAINING_ITEMS } from '@/utils/constants';
import { useScheduleStore } from '@/store/scheduleStore';
import { useCourseRecordStore } from '@/store/courseRecordStore';
import { canTransitionStatus } from '@/utils/helpers';

interface ScheduleDetailDrawerProps {
  open: boolean;
  schedule: Schedule | null;
  onClose: () => void;
}

export const ScheduleDetailDrawer: React.FC<ScheduleDetailDrawerProps> = ({
  open,
  schedule,
  onClose,
}) => {
  const { message, modal } = App.useApp();
  const updateStatus = useScheduleStore((s) => s.updateStatus);
  const markAbsent = useScheduleStore((s) => s.markAbsent);
  const clearAbsent = useScheduleStore((s) => s.clearAbsent);
  const records = useCourseRecordStore((s) =>
    schedule ? s.getRecordsByScheduleId(schedule.id) : []
  );
  const addRecord = useCourseRecordStore((s) => s.addRecord);
  const deleteRecord = useCourseRecordStore((s) => s.deleteRecord);

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [recordForm] = Form.useForm();

  const statusOption = STATUS_OPTIONS.find((o) => o.value === schedule?.status);

  const handleStatusChange = (nextStatus: 'training' | 'completed' | 'cancelled') => {
    if (!schedule) return;
    const result = updateStatus(schedule.id, nextStatus);
    if (result.success) {
      message.success('状态更新成功');
    } else {
      message.error(result.message || '状态更新失败');
    }
  };

  const handleMarkAbsent = () => {
    if (!schedule) return;
    modal.confirm({
      title: '确认标记为异常缺勤？',
      content: (
        <Input.TextArea
          id="absent-note"
          placeholder="请输入缺勤备注（可选）"
          rows={3}
          onChange={(e) => {
            (modal as any)._absentNote = e.target.value;
          }}
        />
      ),
      okText: '确认标记',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        const note = (modal as any)._absentNote || '';
        markAbsent(schedule.id, note);
        message.success('已标记为异常缺勤');
      },
    });
  };

  const handleClearAbsent = () => {
    if (!schedule) return;
    clearAbsent(schedule.id);
    message.success('已取消缺勤标记');
  };

  const handleAddRecord = async () => {
    try {
      const values = await recordForm.validateFields();
      if (!schedule) return;
      addRecord({
        scheduleId: schedule.id,
        trainingItem: values.trainingItem,
        isCompleted: values.isCompleted || false,
        recordDate: values.recordDate.format('YYYY-MM-DD'),
        remark: values.remark,
      });
      message.success('课程记录添加成功');
      setRecordModalOpen(false);
      recordForm.resetFields();
    } catch {}
  };

  const handleDeleteRecord = (record: CourseRecord) => {
    modal.confirm({
      title: '确认删除该课程记录？',
      content: `${record.trainingItem} - ${record.recordDate}`,
      okText: '确认删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteRecord(record.id);
        message.success('删除成功');
      },
    });
  };

  return (
    <>
      <Drawer
        title="排班详情"
        open={open}
        onClose={onClose}
        width={560}
        extra={
          <Space>
            {schedule?.status === 'pending' && (
              <Button
                type="primary"
                icon={<Play size={14} />}
                onClick={() => handleStatusChange('training')}
              >
                开始训练
              </Button>
            )}
            {schedule?.status === 'training' && (
              <Button
                type="primary"
                icon={<CheckCircle2 size={14} />}
                onClick={() => handleStatusChange('completed')}
                style={{ background: '#059669' }}
              >
                完成课程
              </Button>
            )}
            {schedule &&
              schedule.status !== 'completed' &&
              schedule.status !== 'cancelled' && (
                <Button
                  danger
                  icon={<XCircle size={14} />}
                  onClick={() => handleStatusChange('cancelled')}
                >
                  取消排班
                </Button>
              )}
            {schedule && !schedule.isAbsent && (
              <Tooltip title="标记学员未到">
                <Button
                  icon={<AlertTriangle size={14} />}
                  onClick={handleMarkAbsent}
                >
                  标记缺勤
                </Button>
              </Tooltip>
            )}
            {schedule?.isAbsent && (
              <Button
                icon={<AlertTriangle size={14} />}
                onClick={handleClearAbsent}
              >
                取消缺勤
              </Button>
            )}
          </Space>
        }
      >
        {schedule && (
          <>
            <Descriptions
              title={
                <Space>
                  <span>基础信息</span>
                  <Tag color={statusOption?.color}>{statusOption?.label}</Tag>
                  {schedule.isAbsent && (
                    <Tag color="error" icon={<AlertTriangle size={12} />}>
                      异常缺勤
                    </Tag>
                  )}
                </Space>
              }
              column={1}
              bordered
              size="small"
            >
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <CalendarDays size={14} />
                    排班编号
                  </Space>
                }
              >
                {schedule.id}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <User size={14} />
                    学员姓名
                  </Space>
                }
              >
                {schedule.studentName}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <UserCheck size={14} />
                    教练姓名
                  </Space>
                }
              >
                {schedule.coachName}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <Car size={14} />
                    练车车型
                  </Space>
                }
              >
                {schedule.carType}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <CalendarDays size={14} />
                    练车日期
                  </Space>
                }
              >
                {schedule.trainingDate}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Space size={6}>
                    <Clock size={14} />
                    练车时段
                  </Space>
                }
              >
                {schedule.timeSlot}
              </Descriptions.Item>
              {schedule.isAbsent && schedule.absentNote && (
                <Descriptions.Item label="缺勤备注">
                  <span style={{ color: '#dc2626' }}>{schedule.absentNote}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider orientation="left">
              <Space>
                <span>课程训练记录</span>
                <Button
                  type="link"
                  size="small"
                  icon={<Plus size={14} />}
                  onClick={() => setRecordModalOpen(true)}
                  style={{ padding: 0 }}
                >
                  添加记录
                </Button>
              </Space>
            </Divider>

            {records.length === 0 ? (
              <Empty description="暂无训练记录" />
            ) : (
              <List
                dataSource={records}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteRecord(item)}
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox checked={item.isCompleted} disabled />
                      }
                      title={
                        <Space>
                          <span
                            style={{
                              textDecoration: item.isCompleted
                                ? 'line-through'
                                : 'none',
                              color: item.isCompleted ? '#94a3b8' : '#1e293b',
                            }}
                          >
                            {item.trainingItem}
                          </span>
                          {item.isCompleted && (
                            <Tag color="success">已完成</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space size={16}>
                          <span>记录日期：{item.recordDate}</span>
                          {item.remark && <span>备注：{item.remark}</span>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Drawer>

      <Modal
        open={recordModalOpen}
        title="添加课程记录"
        onCancel={() => {
          setRecordModalOpen(false);
          recordForm.resetFields();
        }}
        onOk={handleAddRecord}
        okText="确认添加"
        cancelText="取消"
      >
        <Form form={recordForm} layout="vertical">
          <Form.Item
            label="训练项目"
            name="trainingItem"
            rules={[{ required: true, message: '请选择或输入训练项目' }]}
          >
            <Select
              allowClear
              placeholder="请选择训练项目"
              options={TRAINING_ITEMS.map((t) => ({ label: t, value: t }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            label="完成情况"
            name="isCompleted"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>已完成</Checkbox>
          </Form.Item>
          <Form.Item
            label="记录日期"
            name="recordDate"
            rules={[{ required: true, message: '请选择记录日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
