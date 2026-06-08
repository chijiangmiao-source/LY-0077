import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, DatePicker, Input, Radio, App, AutoComplete } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { examFormSchema, ExamFormValues } from '@/utils/validators';
import { EXAM_SUBJECT_OPTIONS, EXAM_STATUS_OPTIONS, EXAM_SESSIONS } from '@/utils/constants';
import { useExamStore } from '@/store/examStore';
import { useStudentStore } from '@/store/studentStore';
import { ExamAppointment } from '@/types';
import { cleanText, isDateNotBeforeToday } from '@/utils/helpers';

interface ExamFormProps {
  open: boolean;
  editingAppointment?: ExamAppointment | null;
  initialStudentName?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ExamForm: React.FC<ExamFormProps> = ({
  open,
  editingAppointment,
  initialStudentName,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const addAppointment = useExamStore((s) => s.addAppointment);
  const updateAppointment = useExamStore((s) => s.updateAppointment);
  const studentNames = useStudentStore((s) => s.getStudentNames());

  const [statusValue, setStatusValue] = useState<string>('booked');

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      studentName: '',
      subject: 'subject2',
      appointmentDate: '',
      session: '',
      status: 'booked',
      isPassed: undefined,
      remark: '',
    },
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    if (watchedStatus) {
      setStatusValue(watchedStatus);
    }
  }, [watchedStatus]);

  useEffect(() => {
    if (open) {
      if (editingAppointment) {
        reset({
          id: editingAppointment.id,
          studentName: editingAppointment.studentName,
          subject: editingAppointment.subject,
          appointmentDate: editingAppointment.appointmentDate,
          session: editingAppointment.session,
          status: editingAppointment.status,
          isPassed: editingAppointment.isPassed,
          remark: editingAppointment.remark,
        });
        setStatusValue(editingAppointment.status);
      } else {
        reset({
          studentName: initialStudentName || '',
          subject: 'subject2',
          appointmentDate: '',
          session: '',
          status: 'booked',
          isPassed: undefined,
          remark: '',
        });
        setStatusValue('booked');
      }
    }
  }, [open, editingAppointment, initialStudentName, reset]);

  const onSubmit = async (data: ExamFormValues) => {
    const cleanedData = {
      ...data,
      studentName: cleanText(data.studentName),
    } as ExamFormValues;
    let result;
    if (editingAppointment) {
      result = updateAppointment(editingAppointment.id, cleanedData);
    } else {
      result = addAppointment(cleanedData);
    }
    if (result.success) {
      message.success(editingAppointment ? '考试预约更新成功' : '考试预约创建成功');
      onSuccess();
    } else {
      message.error(result.message || '操作失败');
    }
  };

  return (
    <Modal
      open={open}
      title={editingAppointment ? '编辑考试预约' : '新增考试预约'}
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
                <AutoComplete
                  {...field}
                  allowClear
                  placeholder="请选择或输入学员姓名"
                  options={studentNames.map((n) => ({ label: n, value: n }))}
                  filterOption={(inputValue, option) =>
                    (option?.label ?? '').toString().toLowerCase().includes(inputValue.toLowerCase())
                  }
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="考试科目"
            required
            validateStatus={errors.subject ? 'error' : ''}
            help={errors.subject?.message}
          >
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="请选择考试科目">
                  {EXAM_SUBJECT_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="预约日期"
            required
            validateStatus={errors.appointmentDate ? 'error' : ''}
            help={errors.appointmentDate?.message}
          >
            <Controller
              name="appointmentDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="请选择预约日期"
                  disabledDate={(current) =>
                    current && current.isBefore(dayjs().startOf('day'))
                  }
                  value={field.value ? dayjs(field.value) : null}
                  onChange={(date) =>
                    setValue(
                      'appointmentDate',
                      date ? date.format('YYYY-MM-DD') : '',
                      { shouldValidate: true }
                    )
                  }
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="考试场次"
            required
            validateStatus={errors.session ? 'error' : ''}
            help={errors.session?.message}
          >
            <Controller
              name="session"
              control={control}
              render={({ field }) => (
                <Select {...field} allowClear placeholder="请选择考试场次">
                  {EXAM_SESSIONS.map((s) => (
                    <Select.Option key={s} value={s}>
                      {s}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="考试状态"
            required
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="请选择考试状态">
                  {EXAM_STATUS_OPTIONS.map((o) => (
                    <Select.Option key={o.value} value={o.value}>
                      {o.label}
                    </Select.Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          {statusValue === 'completed' && (
            <Form.Item
              label="是否通过"
              required
              validateStatus={errors.isPassed ? 'error' : ''}
              help={errors.isPassed?.message}
            >
              <Controller
                name="isPassed"
                control={control}
                render={({ field }) => (
                  <Radio.Group
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setValue('isPassed', e.target.value, { shouldValidate: true });
                    }}
                  >
                    <Radio value={true}>通过</Radio>
                    <Radio value={false}>未通过</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          )}
        </div>

        <Form.Item
          label="备注"
          validateStatus={errors.remark ? 'error' : ''}
          help={errors.remark?.message}
        >
          <Controller
            name="remark"
            control={control}
            render={({ field }) => (
              <Input.TextArea
                {...field}
                rows={3}
                placeholder="请输入备注信息（可选）"
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
