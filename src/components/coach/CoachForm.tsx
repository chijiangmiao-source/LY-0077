import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { coachFormSchema, CoachFormValues } from '@/utils/validators';
import { CAR_TYPES } from '@/utils/constants';
import { useCoachStore } from '@/store/coachStore';
import { Coach } from '@/types';
import { cleanText } from '@/utils/helpers';

interface CoachFormProps {
  open: boolean;
  editingCoach?: Coach | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CoachForm: React.FC<CoachFormProps> = ({
  open,
  editingCoach,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const addCoach = useCoachStore((s) => s.addCoach);
  const updateCoach = useCoachStore((s) => s.updateCoach);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CoachFormValues>({
    resolver: zodResolver(coachFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      carType: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingCoach) {
        reset({
          id: editingCoach.id,
          name: editingCoach.name,
          phone: editingCoach.phone,
          carType: editingCoach.carType,
        });
      } else {
        reset({ name: '', phone: '', carType: '' });
      }
    }
  }, [open, editingCoach, reset]);

  const onSubmit = async (data: CoachFormValues) => {
    const cleanedData = {
      ...data,
      name: cleanText(data.name),
      phone: data.phone.replace(/\s/g, ''),
    } as CoachFormValues;
    if (editingCoach) {
      updateCoach(editingCoach.id, cleanedData);
      message.success('教练信息更新成功');
      onSuccess();
    } else {
      const result = addCoach(cleanedData);
      if (result.success) {
        message.success('教练添加成功');
        onSuccess();
      } else {
        message.error(result.message || '添加失败');
      }
    }
  };

  return (
    <Modal
      open={open}
      title={editingCoach ? '编辑教练' : '新增教练'}
      onCancel={onCancel}
      onOk={handleSubmit(onSubmit)}
      confirmLoading={isSubmitting}
      okText="确认"
      cancelText="取消"
      width={480}
      destroyOnClose
    >
      <Form layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label="教练姓名"
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入教练姓名" allowClear />
            )}
          />
        </Form.Item>

        <Form.Item
          label="联系方式"
          required
          validateStatus={errors.phone ? 'error' : ''}
          help={errors.phone?.message}
        >
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入手机号码" allowClear />
            )}
          />
        </Form.Item>

        <Form.Item
          label="所教车型"
          required
          validateStatus={errors.carType ? 'error' : ''}
          help={errors.carType?.message}
        >
          <Controller
            name="carType"
            control={control}
            render={({ field }) => (
              <Select {...field} allowClear placeholder="请选择所教车型">
                {CAR_TYPES.map((t) => (
                  <Select.Option key={t} value={t}>
                    {t}
                  </Select.Option>
                ))}
              </Select>
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
