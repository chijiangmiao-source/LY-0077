import { create } from 'zustand';
import dayjs from 'dayjs';
import { CourseRecord } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateId } from '@/utils/helpers';

interface CourseRecordState {
  records: CourseRecord[];
  fetchRecords: () => void;
  addRecord: (data: Omit<CourseRecord, 'id'>) => void;
  updateRecord: (id: string, data: Partial<CourseRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByScheduleId: (scheduleId: string) => CourseRecord[];
}

const loadInitialData = (): CourseRecord[] => {
  const saved = storage.get<CourseRecord[]>(STORAGE_KEYS.COURSE_RECORDS, []);
  if (saved.length > 0) return saved;
  return [];
};

export const useCourseRecordStore = create<CourseRecordState>((set, get) => ({
  records: [],

  fetchRecords: () => {
    const data = loadInitialData();
    set({ records: data });
    storage.set(STORAGE_KEYS.COURSE_RECORDS, data);
  },

  addRecord: (data) => {
    const newRecord: CourseRecord = {
      ...data,
      id: generateId(),
    };
    const updated = [...get().records, newRecord];
    set({ records: updated });
    storage.set(STORAGE_KEYS.COURSE_RECORDS, updated);
  },

  updateRecord: (id, data) => {
    const updated = get().records.map((r) =>
      r.id === id ? { ...r, ...data } : r
    );
    set({ records: updated });
    storage.set(STORAGE_KEYS.COURSE_RECORDS, updated);
  },

  deleteRecord: (id) => {
    const updated = get().records.filter((r) => r.id !== id);
    set({ records: updated });
    storage.set(STORAGE_KEYS.COURSE_RECORDS, updated);
  },

  getRecordsByScheduleId: (scheduleId) => {
    return get().records
      .filter((r) => r.scheduleId === scheduleId)
      .sort((a, b) => dayjs(b.recordDate).valueOf() - dayjs(a.recordDate).valueOf());
  },
}));
