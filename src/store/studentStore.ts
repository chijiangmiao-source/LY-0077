import { create } from 'zustand';
import dayjs from 'dayjs';
import { Student } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateId, cleanText } from '@/utils/helpers';
import { useScheduleStore } from './scheduleStore';

interface StudentState {
  students: Student[];
  fetchStudents: () => void;
  addStudent: (data: any) => { success: boolean; message?: string };
  updateStudent: (id: string, data: any) => void;
  deleteStudent: (id: string) => void;
  getStudentNames: () => string[];
}

const loadInitialData = (): Student[] => {
  const saved = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
  if (saved.length > 0) return saved;
  return [
    {
      id: generateId(),
      name: '张三',
      phone: '13800138001',
      licenseType: 'C1',
      createdAt: dayjs().toISOString(),
    },
    {
      id: generateId(),
      name: '李四',
      phone: '13800138002',
      licenseType: 'C2',
      createdAt: dayjs().toISOString(),
    },
    {
      id: generateId(),
      name: '王五',
      phone: '13800138003',
      licenseType: 'C1',
      createdAt: dayjs().toISOString(),
    },
  ];
};

export const useStudentStore = create<StudentState>((set, get) => ({
  students: [],

  fetchStudents: () => {
    const data = loadInitialData();
    set({ students: data });
    storage.set(STORAGE_KEYS.STUDENTS, data);
  },

  addStudent: (data) => {
    const { students } = get();
    const cleanedName = cleanText(data.name);
    if (students.some((s) => s.name === cleanedName)) {
      return { success: false, message: '该学员已存在' };
    }
    const newStudent: Student = {
      ...data,
      name: cleanedName,
      id: generateId(),
      createdAt: dayjs().toISOString(),
    };
    const updated = [...students, newStudent];
    set({ students: updated });
    storage.set(STORAGE_KEYS.STUDENTS, updated);
    return { success: true };
  },

  updateStudent: (id, data) => {
    const oldStudent = get().students.find((s) => s.id === id);
    const cleanedName = data.name ? cleanText(data.name) : undefined;
    const updated = get().students.map((s) =>
      s.id === id
        ? { ...s, ...data, name: cleanedName ?? s.name }
        : s
    );
    set({ students: updated });
    storage.set(STORAGE_KEYS.STUDENTS, updated);

    if (oldStudent && cleanedName && oldStudent.name !== cleanedName) {
      const scheduleState = useScheduleStore.getState();
      const updatedSchedules = scheduleState.schedules.map((sc) =>
        sc.studentName === oldStudent.name
          ? { ...sc, studentName: cleanedName, updatedAt: dayjs().toISOString() }
          : sc
      );
      useScheduleStore.setState({ schedules: updatedSchedules });
      storage.set(STORAGE_KEYS.SCHEDULES, updatedSchedules);
    }
  },

  deleteStudent: (id) => {
    const updated = get().students.filter((s) => s.id !== id);
    set({ students: updated });
    storage.set(STORAGE_KEYS.STUDENTS, updated);
  },

  getStudentNames: () => {
    return get().students.map((s) => s.name);
  },
}));
