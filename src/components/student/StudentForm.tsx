import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentFormSchema, StudentFormValues } from '@/utils/validators';
import { LICENSE_TYPES } from '@/utils/constants';
import { useStudentStore } from '@/store/studentStore';
import { Student } from '@/types';
import { cleanText } from '@/utils/helpers';

interface StudentFormProps {
  open: boolean;
  editingStudent?: Student | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  open,
  editingStudent,
  onCancel,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const addStudent = useStudentStore((s) => s.addStudent);
  const updateStudent = useStudentStore((s) => s.updateStudent);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      licenseType: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (editingStudent) {
        reset({
          id: editingStudent.id,
          name: editingStudent.name,
          phone: editingStudent.phone,
          licenseType: editingStudent.licenseType,
        });
      } else {
        reset({ name: '', phone: '', licenseType: '' });
      }
    }
  }, [open, editingStudent, reset]);

  const onSubmit = async (data: StudentFormValues) => {
    const cleanedData = {
      ...data,
      name: cleanText(data.name),
      phone: data.phone.replace(/\s/g, ''),
    } as StudentFormValues;
    if (editingStudent) {
      updateStudent(editingStudent.id, cleanedData);
      message.success('学员信息更新成功');
      onSuccess();
    } else {
      const result = addStudent(cleanedData);
      if (result.success) {
        message.success('学员添加成功');
        onSuccess();
      } else {
        message.error(result.message || '添加失败');
      }
    }
  };

  return (
    <Modal
      open={open}
      title={editingStudent ? '编辑学员' : '新增学员'}
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
          label="学员姓名"
          required
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="请输入学员姓名" allowClear />
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
          label="学车类型"
          required
          validateStatus={errors.licenseType ? 'error' : ''}
          help={errors.licenseType?.message}
        >
          <Controller
            name="licenseType"
            control={control}
            render={({ field }) => (
              <Select {...field} allowClear placeholder="请选择学车类型">
                {LICENSE_TYPES.map((t) => (
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
