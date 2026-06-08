import React from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Checkbox,
  App,
  Alert,
} from 'antd';
import dayjs from 'dayjs';
import { TIME_SLOTS, CAR_TYPES } from '@/utils/constants';
import { useScheduleStore } from '@/store/scheduleStore';
import { useCoachStore } from '@/store/coachStore';
import { BatchScheduleAdjustData } from '@/types';

interface BatchAdjustFormProps {
  open: boolean;
  selectedIds: string[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface FormFields {
  adjustCoach: boolean;
  coachName?: string;
  adjustCarType: boolean;
  carType?: string;
  adjustDate: boolean;
  trainingDate?: string;
  adjustTimeSlot: boolean;
  timeSlot?: string;
}

export const BatchAdjustForm: React.FC<BatchAdjustFormProps> = ({
  open,
  selectedIds,
  onCancel,
  onSuccess,
}) => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<FormFields>();
  const batchAdjustSchedules = useScheduleStore((s) => s.batchAdjustSchedules);
  const coachNames = useCoachStore((s) => s.getCoachNames());

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const adjustData: BatchScheduleAdjustData = {};
      if (values.adjustCoach && values.coachName) {
        adjustData.coachName = values.coachName;
      }
      if (values.adjustCarType && values.carType) {
        adjustData.carType = values.carType;
      }
      if (values.adjustDate && values.trainingDate) {
        adjustData.trainingDate = values.trainingDate;
      }
      if (values.adjustTimeSlot && values.timeSlot) {
        adjustData.timeSlot = values.timeSlot;
      }
      if (Object.keys(adjustData).length === 0) {
        message.warning('请至少选择一项要调整的内容');
        return;
      }
      const confirmResult = await new Promise<boolean>((resolve) => {
        modal.confirm({
          title: '确认批量调整',
          content: `即将调整 ${selectedIds.length} 条排班记录，是否继续？`,
          okText: '确认调整',
          cancelText: '取消',
          okButtonProps: { type: 'primary' },
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmResult) return;

      const result = batchAdjustSchedules(selectedIds, adjustData);
      if (result.success) {
        message.success(result.message);
        if (result.errors && result.errors.length > 0) {
          modal.warning({
            title: '部分调整失败',
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
        message.error(result.message || '批量调整失败');
      }
    } catch {
      // 表单验证失败，用户未提交
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={`批量调整排班 (已选 ${selectedIds.length} 条)`}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="确认批量调整"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <Alert
        type="info"
        showIcon
        message="请勾选需要调整的字段，未勾选的字段保持不变"
        style={{ marginBottom: 16 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item name="adjustCoach" valuePropName="checked" initialValue={false}>
          <Checkbox>调整教练</Checkbox>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.adjustCoach !== cur.adjustCoach}
        >
          {({ getFieldValue }) =>
            getFieldValue('adjustCoach') ? (
              <Form.Item
                label="新教练"
                name="coachName"
                rules={[{ required: true, message: '请选择教练' }]}
                style={{ marginLeft: 24 }}
              >
                <Select
                  allowClear
                  placeholder="请选择教练"
                  options={coachNames.map((n) => ({ label: n, value: n }))}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="adjustCarType" valuePropName="checked" initialValue={false}>
          <Checkbox>调整车型</Checkbox>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.adjustCarType !== cur.adjustCarType}
        >
          {({ getFieldValue }) =>
            getFieldValue('adjustCarType') ? (
              <Form.Item
                label="新车型"
                name="carType"
                rules={[{ required: true, message: '请选择车型' }]}
                style={{ marginLeft: 24 }}
              >
                <Select
                  allowClear
                  placeholder="请选择车型"
                  options={CAR_TYPES.map((t) => ({ label: t, value: t }))}
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="adjustDate" valuePropName="checked" initialValue={false}>
          <Checkbox>调整练车日期</Checkbox>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.adjustDate !== cur.adjustDate}
        >
          {({ getFieldValue }) =>
            getFieldValue('adjustDate') ? (
              <Form.Item
                label="新日期"
                name="trainingDate"
                rules={[{ required: true, message: '请选择日期' }]}
                style={{ marginLeft: 24 }}
                getValueFromEvent={(date: dayjs.Dayjs | null) =>
                  date ? date.format('YYYY-MM-DD') : ''
                }
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择日期"
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>

        <Form.Item name="adjustTimeSlot" valuePropName="checked" initialValue={false}>
          <Checkbox>调整练车时段</Checkbox>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prev, cur) => prev.adjustTimeSlot !== cur.adjustTimeSlot}
        >
          {({ getFieldValue }) =>
            getFieldValue('adjustTimeSlot') ? (
              <Form.Item
                label="新时段"
                name="timeSlot"
                rules={[{ required: true, message: '请选择时段' }]}
                style={{ marginLeft: 24 }}
              >
                <Select
                  allowClear
                  placeholder="请选择时段"
                  options={TIME_SLOTS.map((t) => ({ label: t, value: t }))}
                />
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </Form>
    </Modal>
  );
};
