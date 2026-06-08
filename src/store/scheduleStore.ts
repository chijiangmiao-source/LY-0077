import { create } from 'zustand';
import dayjs from 'dayjs';
import { Schedule, CourseStatus, ScheduleFormData, BatchScheduleAdjustData } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import {
  generateScheduleId,
  canTransitionStatus,
} from '@/utils/helpers';
import { useProgressStore } from './progressStore';

interface BatchResult {
  success: boolean;
  successCount: number;
  failCount: number;
  message?: string;
  errors?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface ScheduleState {
  schedules: Schedule[];
  fetchSchedules: () => void;
  addSchedule: (data: AnyData) => { success: boolean; message?: string };
  updateSchedule: (
    id: string,
    data: AnyData
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
    excludeIds?: string[]
  ) => boolean;
  getScheduleById: (id: string) => Schedule | undefined;
  batchAddSchedules: (dataList: ScheduleFormData[]) => BatchResult;
  batchAdjustSchedules: (ids: string[], data: BatchScheduleAdjustData) => BatchResult;
  batchCancelSchedules: (ids: string[]) => BatchResult;
  batchDeleteSchedules: (ids: string[]) => BatchResult;
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
      trainingDate: now.add(2, 'day').format('YYYY-MM-DD'),
      timeSlot: '14:00-16:00',
      status: 'pending',
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

  hasConflict: (coachName, trainingDate, timeSlot, excludeIds) => {
    const { schedules } = get();
    const excludeArray = excludeIds || [];
    return schedules.some(
      (s) =>
        s.coachName === coachName &&
        s.trainingDate === trainingDate &&
        s.timeSlot === timeSlot &&
        s.status !== 'cancelled' &&
        !excludeArray.includes(s.id)
    );
  },

  addSchedule: (data) => {
    const { schedules, hasConflict } = get();
    if (hasConflict(data.coachName, data.trainingDate, data.timeSlot, [])) {
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

    const progressStore = useProgressStore.getState();
    progressStore.recalculateAllProgresses();

    return { success: true };
  },

  updateSchedule: (id, data) => {
    const { schedules, hasConflict } = get();
    if (hasConflict(data.coachName, data.trainingDate, data.timeSlot, [id])) {
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

    const progressStore = useProgressStore.getState();
    progressStore.updateTrainingStats(schedule.studentName);
    progressStore.recalculateAllProgresses();

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

  batchAddSchedules: (dataList) => {
    const { schedules, hasConflict } = get();
    const errors: string[] = [];
    const newSchedules: Schedule[] = [];
    const currentSchedules = [...schedules];
    const processedIds: string[] = [];

    dataList.forEach((data, index) => {
      const tempCoachName = data.coachName;
      const tempTrainingDate = data.trainingDate;
      const tempTimeSlot = data.timeSlot;
      const excludeIds = [...processedIds];
      if (hasConflict(tempCoachName, tempTrainingDate, tempTimeSlot, excludeIds)) {
        errors.push(`第 ${index + 1} 条：该教练在此日期时段已有排班，已跳过`);
        return;
      }
      const id = generateScheduleId(currentSchedules.map((s) => s.id));
      if (currentSchedules.some((s) => s.id === id)) {
        errors.push(`第 ${index + 1} 条：排班编号已存在，已跳过`);
        return;
      }
      const now = dayjs().toISOString();
      const newSchedule: Schedule = {
        id,
        ...data,
        isAbsent: false,
        createdAt: now,
        updatedAt: now,
      };
      newSchedules.push(newSchedule);
      currentSchedules.push(newSchedule);
      processedIds.push(id);
    });

    if (newSchedules.length > 0) {
      const updated = [...schedules, ...newSchedules];
      set({ schedules: updated });
      storage.set(STORAGE_KEYS.SCHEDULES, updated);
    }

    return {
      success: newSchedules.length > 0,
      successCount: newSchedules.length,
      failCount: errors.length,
      errors,
      message: `成功新增 ${newSchedules.length} 条排班${errors.length > 0 ? `，${errors.length} 条失败` : ''}`,
    };
  },

  batchAdjustSchedules: (ids, data) => {
    const { schedules } = get();
    const errors: string[] = [];
    const updatedIds: string[] = [];
    let currentSchedules = [...schedules];

    const checkConflictInCurrent = (
      coachName: string,
      trainingDate: string,
      timeSlot: string,
      excludeId: string
    ): boolean => {
      return currentSchedules.some(
        (s) =>
          s.coachName === coachName &&
          s.trainingDate === trainingDate &&
          s.timeSlot === timeSlot &&
          s.status !== 'cancelled' &&
          s.id !== excludeId
      );
    };

    ids.forEach((id) => {
      const schedule = currentSchedules.find((s) => s.id === id);
      if (!schedule) {
        errors.push(`排班 ${id} 不存在，已跳过`);
        return;
      }
      const tempCoachName = data.coachName ?? schedule.coachName;
      const tempTrainingDate = data.trainingDate ?? schedule.trainingDate;
      const tempTimeSlot = data.timeSlot ?? schedule.timeSlot;
      if (
        data.trainingDate &&
        dayjs(tempTrainingDate).startOf('day').isBefore(dayjs().startOf('day'))
      ) {
        errors.push(`排班 ${id}（${schedule.studentName}）：练车日期不能早于今天，已跳过`);
        return;
      }
      if (data.coachName || data.trainingDate || data.timeSlot) {
        if (checkConflictInCurrent(tempCoachName, tempTrainingDate, tempTimeSlot, id)) {
          errors.push(`排班 ${id}（${schedule.studentName}）：调整后教练在该日期时段已有排班，已跳过`);
          return;
        }
      }
      currentSchedules = currentSchedules.map((s) =>
        s.id === id
          ? { ...s, ...data, updatedAt: dayjs().toISOString() }
          : s
      );
      updatedIds.push(id);
    });

    if (updatedIds.length > 0) {
      set({ schedules: currentSchedules });
      storage.set(STORAGE_KEYS.SCHEDULES, currentSchedules);
    }

    return {
      success: updatedIds.length > 0,
      successCount: updatedIds.length,
      failCount: errors.length,
      errors,
      message: `成功调整 ${updatedIds.length} 条排班${errors.length > 0 ? `，${errors.length} 条失败` : ''}`,
    };
  },

  batchCancelSchedules: (ids) => {
    const { schedules } = get();
    const errors: string[] = [];
    const updatedIds: string[] = [];

    const updated = schedules.map((s) => {
      if (!ids.includes(s.id)) return s;
      if (!canTransitionStatus(s.status, 'cancelled')) {
        errors.push(`排班 ${s.id}：当前状态无法取消，已跳过`);
        return s;
      }
      updatedIds.push(s.id);
      return { ...s, status: 'cancelled' as CourseStatus, updatedAt: dayjs().toISOString() };
    });

    if (updatedIds.length > 0) {
      set({ schedules: updated });
      storage.set(STORAGE_KEYS.SCHEDULES, updated);
    }

    return {
      success: updatedIds.length > 0,
      successCount: updatedIds.length,
      failCount: errors.length,
      errors,
      message: `成功取消 ${updatedIds.length} 条排班${errors.length > 0 ? `，${errors.length} 条失败` : ''}`,
    };
  },

  batchDeleteSchedules: (ids) => {
    const { schedules } = get();
    const updated = schedules.filter((s) => !ids.includes(s.id));
    const deletedCount = schedules.length - updated.length;
    set({ schedules: updated });
    storage.set(STORAGE_KEYS.SCHEDULES, updated);
    return {
      success: deletedCount > 0,
      successCount: deletedCount,
      failCount: ids.length - deletedCount,
      message: `成功删除 ${deletedCount} 条排班`,
    };
  },
}));
