import { create } from 'zustand';
import dayjs from 'dayjs';
import { Coach } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateId, cleanText } from '@/utils/helpers';
import { useScheduleStore } from './scheduleStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any;

interface CoachState {
  coaches: Coach[];
  fetchCoaches: () => void;
  addCoach: (data: AnyData) => { success: boolean; message?: string };
  updateCoach: (id: string, data: AnyData) => void;
  deleteCoach: (id: string) => void;
  getCoachNames: () => string[];
}

const loadInitialData = (): Coach[] => {
  const saved = storage.get<Coach[]>(STORAGE_KEYS.COACHES, []);
  if (saved.length > 0) return saved;
  return [
    {
      id: generateId(),
      name: '李教练',
      phone: '13900139001',
      carType: 'C1手动挡',
      createdAt: dayjs().toISOString(),
    },
    {
      id: generateId(),
      name: '王教练',
      phone: '13900139002',
      carType: 'C2自动挡',
      createdAt: dayjs().toISOString(),
    },
    {
      id: generateId(),
      name: '赵教练',
      phone: '13900139003',
      carType: 'C1手动挡',
      createdAt: dayjs().toISOString(),
    },
  ];
};

export const useCoachStore = create<CoachState>((set, get) => ({
  coaches: [],

  fetchCoaches: () => {
    const data = loadInitialData();
    set({ coaches: data });
    storage.set(STORAGE_KEYS.COACHES, data);
  },

  addCoach: (data) => {
    const { coaches } = get();
    const cleanedName = cleanText(data.name);
    if (coaches.some((c) => c.name === cleanedName)) {
      return { success: false, message: '该教练已存在' };
    }
    const newCoach: Coach = {
      ...data,
      name: cleanedName,
      id: generateId(),
      createdAt: dayjs().toISOString(),
    };
    const updated = [...coaches, newCoach];
    set({ coaches: updated });
    storage.set(STORAGE_KEYS.COACHES, updated);
    return { success: true };
  },

  updateCoach: (id, data) => {
    const oldCoach = get().coaches.find((c) => c.id === id);
    const cleanedName = data.name ? cleanText(data.name) : undefined;
    const updated = get().coaches.map((c) =>
      c.id === id
        ? { ...c, ...data, name: cleanedName ?? c.name }
        : c
    );
    set({ coaches: updated });
    storage.set(STORAGE_KEYS.COACHES, updated);

    if (oldCoach) {
      const scheduleState = useScheduleStore.getState();
      let needsUpdate = false;
      const updatedSchedules = scheduleState.schedules.map((sc) => {
        let newSc = sc;
        if (sc.coachName === oldCoach.name) {
          if (cleanedName && oldCoach.name !== cleanedName) {
            newSc = { ...newSc, coachName: cleanedName };
            needsUpdate = true;
          }
          if (data.carType && oldCoach.carType !== data.carType) {
            newSc = { ...newSc, carType: data.carType };
            needsUpdate = true;
          }
          if (needsUpdate) {
            newSc = { ...newSc, updatedAt: dayjs().toISOString() };
          }
        }
        return newSc;
      });
      if (needsUpdate) {
        useScheduleStore.setState({ schedules: updatedSchedules });
        storage.set(STORAGE_KEYS.SCHEDULES, updatedSchedules);
      }
    }
  },

  deleteCoach: (id) => {
    const updated = get().coaches.filter((c) => c.id !== id);
    set({ coaches: updated });
    storage.set(STORAGE_KEYS.COACHES, updated);
  },

  getCoachNames: () => {
    return get().coaches.map((c) => c.name);
  },
}));
