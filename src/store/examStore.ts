import { create } from 'zustand';
import dayjs from 'dayjs';
import { ExamAppointment, ExamStatus, ExamFormData } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateExamId, cleanText } from '@/utils/helpers';
import { useStudentStore } from './studentStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface ExamState {
  appointments: ExamAppointment[];
  fetchAppointments: () => void;
  addAppointment: (data: AnyData) => { success: boolean; message?: string };
  updateAppointment: (
    id: string,
    data: AnyData
  ) => { success: boolean; message?: string };
  deleteAppointment: (id: string) => void;
  updateStatus: (
    id: string,
    status: ExamStatus,
    isPassed?: boolean
  ) => { success: boolean; message?: string };
  getAppointmentById: (id: string) => ExamAppointment | undefined;
  getAppointmentsByStudent: (studentName: string) => ExamAppointment[];
  batchDeleteAppointments: (ids: string[]) => { success: boolean; successCount: number; failCount: number; message?: string };
}

const loadInitialData = (): ExamAppointment[] => {
  const saved = storage.get<ExamAppointment[]>(STORAGE_KEYS.EXAM_APPOINTMENTS, []);
  if (saved.length > 0) return saved;
  const now = dayjs();
  return [
    {
      id: generateExamId([]),
      studentName: '张三',
      subject: 'subject2',
      appointmentDate: now.add(3, 'day').format('YYYY-MM-DD'),
      session: '上午场 08:00-10:00',
      status: 'confirmed',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateExamId([generateExamId([])]),
      studentName: '李四',
      subject: 'subject3',
      appointmentDate: now.add(5, 'day').format('YYYY-MM-DD'),
      session: '下午场 13:30-15:30',
      status: 'booked',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateExamId([
        generateExamId([]),
        generateExamId([generateExamId([])]),
      ]),
      studentName: '王五',
      subject: 'subject1',
      appointmentDate: now.subtract(2, 'day').format('YYYY-MM-DD'),
      session: '上午场 10:00-12:00',
      status: 'completed',
      isPassed: true,
      remark: '一次性通过，成绩优异',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};

export const useExamStore = create<ExamState>((set, get) => ({
  appointments: [],

  fetchAppointments: () => {
    const data = loadInitialData();
    set({ appointments: data });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, data);
  },

  addAppointment: (data) => {
    const { appointments } = get();
    const id = data.id || generateExamId(appointments.map((a) => a.id));
    if (appointments.some((a) => a.id === id)) {
      return { success: false, message: '考试预约编号已存在' };
    }
    const now = dayjs().toISOString();
    const cleanedData: ExamFormData = {
      ...data,
      studentName: cleanText(data.studentName),
    };
    const newAppointment: ExamAppointment = {
      id,
      ...cleanedData,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...appointments, newAppointment];
    set({ appointments: updated });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, updated);
    return { success: true };
  },

  updateAppointment: (id, data) => {
    const { appointments } = get();
    const oldAppointment = appointments.find((a) => a.id === id);
    if (!oldAppointment) {
      return { success: false, message: '考试预约不存在' };
    }
    const cleanedData: ExamFormData = {
      ...data,
      studentName: data.studentName ? cleanText(data.studentName) : oldAppointment.studentName,
    };
    const updated = appointments.map((a) =>
      a.id === id
        ? { ...a, ...cleanedData, updatedAt: dayjs().toISOString() }
        : a
    );
    set({ appointments: updated });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, updated);

    if (oldAppointment && cleanedData.studentName && oldAppointment.studentName !== cleanedData.studentName) {
      const studentState = useStudentStore.getState();
      const studentExists = studentState.students.some((s) => s.name === cleanedData.studentName);
      if (!studentExists) {
        studentState.addStudent({
          name: cleanedData.studentName,
          phone: '',
          licenseType: 'C1',
        });
      }
    }

    return { success: true };
  },

  deleteAppointment: (id) => {
    const updated = get().appointments.filter((a) => a.id !== id);
    set({ appointments: updated });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, updated);
  },

  updateStatus: (id, status, isPassed) => {
    const { appointments } = get();
    const appointment = appointments.find((a) => a.id === id);
    if (!appointment) return { success: false, message: '考试预约不存在' };
    const updated = appointments.map((a) =>
      a.id === id
        ? {
            ...a,
            status,
            isPassed: status === 'completed' ? isPassed : undefined,
            updatedAt: dayjs().toISOString(),
          }
        : a
    );
    set({ appointments: updated });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, updated);
    return { success: true };
  },

  getAppointmentById: (id) => {
    return get().appointments.find((a) => a.id === id);
  },

  getAppointmentsByStudent: (studentName) => {
    return get().appointments.filter((a) => a.studentName === studentName);
  },

  batchDeleteAppointments: (ids) => {
    const { appointments } = get();
    const updated = appointments.filter((a) => !ids.includes(a.id));
    const deletedCount = appointments.length - updated.length;
    set({ appointments: updated });
    storage.set(STORAGE_KEYS.EXAM_APPOINTMENTS, updated);
    return {
      success: deletedCount > 0,
      successCount: deletedCount,
      failCount: ids.length - deletedCount,
      message: `成功删除 ${deletedCount} 条考试预约记录`,
    };
  },
}));
