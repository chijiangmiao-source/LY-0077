import { create } from 'zustand';
import dayjs from 'dayjs';
import { Schedule, CourseStatus, ScheduleFormData } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import {
  generateScheduleId,
  generateId,
  canTransitionStatus,
} from '@/utils/helpers';

interface ScheduleState {
  schedules: Schedule[];
  fetchSchedules: () => void;
  addSchedule: (data: any) => { success: boolean; message?: string };
  updateSchedule: (
    id: string,
    data: any
  ) => { success: boolean; message?: string };
  deleteSchedule: (id: string) => void;
  updateStatus: (
    id: string,
    status: CourseStatus
  ) => { success: boolean; message?: string };
  markAbsent: (id: string, note?: string) => void;
  clearAbsent: (id: string) => void;
  hasConflict: (
    coachName: string,
    trainingDate: string,
    timeSlot: string,
    excludeId?: string
  ) => boolean;
  getScheduleById: (id: string) => Schedule | undefined;
}

const loadInitialData = (): Schedule[] => {
  const saved = storage.get<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
  if (saved.length > 0) return saved;
  const now = dayjs();
  return [
    {
      id: generateScheduleId([]),
      studentName: '张三',
      coachName: '李教练',
      carType: 'C1手动挡',
      trainingDate: now.format('YYYY-MM-DD'),
      timeSlot: '08:00-10:00',
      status: 'training',
      isAbsent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateScheduleId([generateScheduleId([])]),
      studentName: '李四',
      coachName: '王教练',
      carType: 'C2自动挡',
      trainingDate: now.add(1, 'day').format('YYYY-MM-DD'),
      timeSlot: '10:00-12:00',
      status: 'pending',
      isAbsent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: generateScheduleId([
        generateScheduleId([]),
        generateScheduleId([generateScheduleId([])]),
      ]),
      studentName: '王五',
      coachName: '李教练',
      carType: 'C1手动挡',
      trainingDate: now.subtract(1, 'day').format('YYYY-MM-DD'),
      timeSlot: '14:00-16:00',
      status: 'completed',
      isAbsent: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];
};

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  schedules: [],

  fetchSchedules: () => {
    const data = loadInitialData();
    set({ schedules: data });
    storage.set(STORAGE_KEYS.SCHEDULES, data);
  },

  hasConflict: (coachName, trainingDate, timeSlot, excludeId) => {
    const { schedules } = get();
    return schedules.some(
      (s) =>
        s.coachName === coachName &&
        s.trainingDate === trainingDate &&
        s.timeSlot === timeSlot &&
        s.status !== 'cancelled' &&
        s.id !== excludeId
    );
  },

  addSchedule: (data) => {
    const { schedules, hasConflict } = get();
    if (hasConflict(data.coachName, data.trainingDate, data.timeSlot)) {
      return { success: false, message: '该教练在此日期时段已有排班，请更换时间或教练' };
    }
    const id = data.id || generateScheduleId(schedules.map((s) => s.id));
    if (schedules.some((s) => s.id === id)) {
      return { success: false, message: '排班编号已存在' };
    }
    const now = dayjs().toISOString();
    const newSchedule: Schedule = {
      id,
      ...data,
      isAbsent: false,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...schedules, newSchedule];
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
    return { success: true };
  },

  updateSchedule: (id, data) => {
    const { schedules, hasConflict } = get();
    if (hasConflict(data.coachName, data.trainingDate, data.timeSlot, id)) {
      return { success: false, message: '该教练在此日期时段已有排班，请更换时间或教练' };
    }
    const updated = schedules.map((s) =>
      s.id === id
        ? { ...s, ...data, updatedAt: dayjs().toISOString() }
        : s
    );
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
    return { success: true };
  },

  deleteSchedule: (id) => {
    const updated = get().schedules.filter((s) => s.id !== id);
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
  },

  updateStatus: (id, status) => {
    const { schedules } = get();
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return { success: false, message: '排班不存在' };
    if (!canTransitionStatus(schedule.status, status)) {
      return {
        success: false,
        message: `无法从"${schedule.status}"变更为"${status}"`,
      };
    }
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, status, updatedAt: dayjs().toISOString() } : s
    );
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
    return { success: true };
  },

  markAbsent: (id, note) => {
    const updated = get().schedules.map((s) =>
      s.id === id
        ? { ...s, isAbsent: true, absentNote: note, updatedAt: dayjs().toISOString() }
        : s
    );
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
  },

  clearAbsent: (id) => {
    const updated = get().schedules.map((s) =>
      s.id === id
        ? { ...s, isAbsent: false, absentNote: undefined, updatedAt: dayjs().toISOString() }
        : s
    );
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
  },

  getScheduleById: (id) => {
    return get().schedules.find((s) => s.id === id);
  },
}));
