import React, { useEffect } from 'react';
import { Modal, Form, Select, DatePicker, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import {
  scheduleFormSchema,
  ScheduleFormValues,
} from '@/utils/validators';
import { TIME_SLOTS, CAR_TYPES, STATUS_OPTIONS } from '@/utils/constants';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';
import { Schedule } from '@/types';
import { cleanText } from '@/utils/helpers';

interface ScheduleFormProps {
  open: boolean;
  editingSchedule?: Schedule | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  open,
  editingSchedule,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const addSchedule = useScheduleStore((s) => s.addSchedule);
  const updateSchedule = useScheduleStore((s) => s.updateSchedule);
  const studentNames = useStudentStore((s) => s.getStudentNames());
  const coachNames = useCoachStore((s) => s.getCoachNames());

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      studentName: '',
      coachName: '',
      carType: '',
      trainingDate: '',
      timeSlot: '',
      status: 'pending',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingSchedule) {
        reset({
          id: editingSchedule.id,
          studentName: editingSchedule.studentName,
          coachName: editingSchedule.coachName,
          carType: editingSchedule.carType,
          trainingDate: editingSchedule.trainingDate,
          timeSlot: editingSchedule.timeSlot,
          status: editingSchedule.status,
        });
      } else {
        reset({
          studentName: '',
          coachName: '',
          carType: '',
          trainingDate: '',
          timeSlot: '',
          status: 'pending',
        });
      }
    }
  }, [open, editingSchedule, reset]);

  const onSubmit = async (data: ScheduleFormValues) => {
    const cleanedData = {
      ...data,
      studentName: cleanText(data.studentName),
      coachName: cleanText(data.coachName),
    } as ScheduleFormValues;
    let result;
    if (editingSchedule) {
      result = updateSchedule(editingSchedule.id, cleanedData);
    } else {
      result = addSchedule(cleanedData);
    }
    if (result.success) {
      message.success(editingSchedule ? '排班更新成功' : '排班创建成功');
      onSuccess();
    } else {
      message.error(result.message || '操作失败');
    }
  };

  return (
    <Modal
      open={open}
      title={editingSchedule ? '编辑排班' : '新增排班'}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isSubmitting}
      okText="确认"
      cancelText="取消"
      width={640}
      destroyOnClose
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            label="学员姓名"
            required
            validateStatus={errors.studentName ? 'error' : ''}
            help={errors.studentName?.message}
          >
            <Controller
              name="studentName"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  placeholder="请选择或输入学员姓名"
                  mode={undefined}
                  options={studentNames.map((n) => ({ label: n, value: n }))}
                  showSearch
                  optionFilterProp="label"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="教练姓名"
            required
            validateStatus={errors.coachName ? 'error' : ''}
            help={errors.coachName?.message}
          >
            <Controller
              name="coachName"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  placeholder="请选择教练姓名"
                  options={coachNames.map((n) => ({ label: n, value: n }))}
                  showSearch
                  optionFilterProp="label"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="练车车型"
            required
            validateStatus={errors.carType ? 'error' : ''}
            help={errors.carType?.message}
          >
            <Controller
              name="carType"
              control={control}
              render={({ field }) => (
                <Select {...field} allowClear placeholder="请选择练车车型">
                  {CAR_TYPES.map((t) => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="练车日期"
            required
            validateStatus={errors.trainingDate ? 'error' : ''}
            help={errors.trainingDate?.message}
          >
            <Controller
              name="trainingDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择练车日期"
                  disabledDate={(current) =>
                    current && current.isBefore(dayjs().startOf('day'))
                  }
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    setValue(
                      'trainingDate',
                      date ? date.format('YYYY-MM-DD') : '',
                      { shouldValidate: true }
                    )
                  }
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="练车时段"
            required
            validateStatus={errors.timeSlot ? 'error' : ''}
            help={errors.timeSlot?.message}
          >
            <Controller
              name="timeSlot"
              control={control}
              render={({ field }) => (
                <Select {...field} allowClear placeholder="请选择练车时段">
                  {TIME_SLOTS.map((t) => (
                    <Select.Option key={t} value={t}>
                      {t}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="课程状态"
            required
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="请选择课程状态">
                  {STATUS_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};
