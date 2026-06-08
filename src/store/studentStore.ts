import { create } from 'zustand';
import dayjs from 'dayjs';
import { Student } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateId, cleanText } from '@/utils/helpers';

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
    const updated = get().students.map((s) =>
      s.id === id
        ? { ...s, ...data, name: data.name ? cleanText(data.name) : s.name }
        : s
    );
    set({ students: updated });
    storage.set(STORAGE_KEYS.STUDENTS, updated);
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
