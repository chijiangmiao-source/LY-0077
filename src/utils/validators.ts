import { z } from 'zod';
import dayjs from 'dayjs';
import { cleanText, isDateNotBeforeToday, isValidPhone } from './helpers';

const nameSchema = z
  .string()
  .min(1, '姓名不能为空')
  .transform((v) => cleanText(v))
  .refine((v) => v.length >= 2, '姓名至少2个字符')
  .refine(
    (v) => /^[\u4e00-\u9fa5a-zA-Z]+$/.test(v),
    '姓名只能包含中文或英文字母'
  );

export const scheduleFormSchema = z
  .object({
    id: z.string().optional(),
    studentName: nameSchema,
    coachName: nameSchema,
    carType: z.string().min(1, '请选择练车车型'),
    trainingDate: z
      .string()
      .min(1, '请选择练车日期')
      .refine((v) => dayjs(v).isValid(), '日期格式无效')
      .refine(isDateNotBeforeToday, '练车日期不能早于当前日期'),
    timeSlot: z.string().min(1, '请选择练车时段'),
    status: z.enum(['pending', 'training', 'completed', 'cancelled']),
  })
  .strict();

export const studentFormSchema = z.object({
  id: z.string().optional(),
  name: nameSchema,
  phone: z
    .string()
    .min(1, '请输入联系方式')
    .transform((v) => v.replace(/\s/g, ''))
    .refine(isValidPhone, '请输入有效的手机号码'),
  licenseType: z.string().min(1, '请选择学车类型'),
});

export const coachFormSchema = z.object({
  id: z.string().optional(),
  name: nameSchema,
  phone: z
    .string()
    .min(1, '请输入联系方式')
    .transform((v) => v.replace(/\s/g, ''))
    .refine(isValidPhone, '请输入有效的手机号码'),
  carType: z.string().min(1, '请选择所教车型'),
});

export const courseRecordSchema = z.object({
  trainingItem: z.string().min(1, '请输入训练项目'),
  isCompleted: z.boolean().default(false),
  recordDate: z
    .string()
    .min(1, '请选择记录日期')
    .refine((v) => dayjs(v).isValid(), '日期格式无效'),
  remark: z.string().optional(),
});

export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type CoachFormValues = z.infer<typeof coachFormSchema>;
export type CourseRecordValues = z.infer<typeof courseRecordSchema>;
