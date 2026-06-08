import { create } from 'zustand';
import dayjs from 'dayjs';
import { StudentProgress, StageTransition, ProgressStage, ExamSubject } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';
import { storage } from '@/utils/storage';
import { generateId, getProgressStageOrder } from '@/utils/helpers';
import { useStudentStore } from './studentStore';
import { useScheduleStore } from './scheduleStore';
import { useExamStore } from './examStore';

interface ProgressState {
  progresses: StudentProgress[];
  transitions: StageTransition[];
  fetchProgresses: () => void;
  fetchTransitions: () => void;
  initProgressForStudent: (studentId: string, studentName: string, licenseType: string) => void;
  updateStage: (
    studentName: string,
    newStage: ProgressStage,
    triggerType: 'schedule' | 'course' | 'exam' | 'manual' | 'certify',
    triggerId?: string,
    remark?: string,
    operator?: string
  ) => void;
  addPassedSubject: (studentName: string, subject: ExamSubject) => void;
  updateTrainingStats: (studentName: string) => void;
  updateRemark: (studentName: string, remark: string) => void;
  certifyStudent: (studentName: string, remark?: string) => void;
  archiveStudent: (studentName: string, remark?: string) => void;
  getProgressByStudentName: (studentName: string) => StudentProgress | undefined;
  getTransitionsByStudentName: (studentName: string) => StageTransition[];
  recalculateAllProgresses: () => void;
}

const loadInitialProgresses = (): StudentProgress[] => {
  const saved = storage.get<StudentProgress[]>(STORAGE_KEYS.STUDENT_PROGRESSES, []);
  return saved;
};

const loadInitialTransitions = (): StageTransition[] => {
  const saved = storage.get<StageTransition[]>(STORAGE_KEYS.STAGE_TRANSITIONS, []);
  return saved;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progresses: [],
  transitions: [],

  fetchProgresses: () => {
    const data = loadInitialProgresses();
    set({ progresses: data });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, data);
  },

  fetchTransitions: () => {
    const data = loadInitialTransitions();
    set({ transitions: data });
    storage.set(STORAGE_KEYS.STAGE_TRANSITIONS, data);
  },

  initProgressForStudent: (studentId, studentName, licenseType) => {
    const { progresses } = get();
    if (progresses.some((p) => p.studentName === studentName)) return;

    const now = dayjs().toISOString();
    const newProgress: StudentProgress = {
      id: generateId(),
      studentId,
      studentName,
      licenseType,
      currentStage: 'registered',
      stageTimeline: [
        {
          stage: 'registered',
          enteredAt: now,
          note: '学员报名注册',
        },
      ],
      passedSubjects: [],
      totalTrainingHours: 0,
      completedSchedules: 0,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...progresses, newProgress];
    set({ progresses: updated });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updated);

    const transition: StageTransition = {
      id: generateId(),
      studentName,
      fromStage: null,
      toStage: 'registered',
      triggerType: 'manual',
      operator: '系统',
      remark: '学员报名注册',
      createdAt: now,
    };
    const transitionsUpdated = [...get().transitions, transition];
    set({ transitions: transitionsUpdated });
    storage.set(STORAGE_KEYS.STAGE_TRANSITIONS, transitionsUpdated);
  },

  updateStage: (studentName, newStage, triggerType, triggerId, remark, operator = '系统') => {
    const { progresses, transitions } = get();
    const progress = progresses.find((p) => p.studentName === studentName);
    if (!progress) return;

    const currentOrder = getProgressStageOrder(progress.currentStage);
    const newOrder = getProgressStageOrder(newStage);
    if (newOrder < currentOrder) return;
    if (progress.currentStage === newStage) return;

    const now = dayjs().toISOString();
    const updatedProgresses = progresses.map((p) => {
      if (p.studentName !== studentName) return p;
      const newTimeline = [...p.stageTimeline];
      if (!newTimeline.some((t) => t.stage === newStage)) {
        newTimeline.push({
          stage: newStage,
          enteredAt: now,
          note: remark,
        });
      }
      return {
        ...p,
        currentStage: newStage,
        stageTimeline: newTimeline,
        updatedAt: now,
      };
    });
    set({ progresses: updatedProgresses });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updatedProgresses);

    const transition: StageTransition = {
      id: generateId(),
      studentName,
      fromStage: progress.currentStage,
      toStage: newStage,
      triggerType,
      triggerId,
      remark,
      operator,
      createdAt: now,
    };
    const updatedTransitions = [...transitions, transition];
    set({ transitions: updatedTransitions });
    storage.set(STORAGE_KEYS.STAGE_TRANSITIONS, updatedTransitions);
  },

  addPassedSubject: (studentName, subject) => {
    const { progresses } = get();
    const progress = progresses.find((p) => p.studentName === studentName);
    if (!progress) return;
    if (progress.passedSubjects.includes(subject)) return;

    const now = dayjs().toISOString();
    const updatedProgresses = progresses.map((p) => {
      if (p.studentName !== studentName) return p;
      return {
        ...p,
        passedSubjects: [...p.passedSubjects, subject],
        updatedAt: now,
      };
    });
    set({ progresses: updatedProgresses });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updatedProgresses);
  },

  updateTrainingStats: (studentName) => {
    const { progresses } = get();
    const schedules = useScheduleStore.getState().schedules;
    const studentSchedules = schedules.filter((s) => s.studentName === studentName);
    const completed = studentSchedules.filter((s) => s.status === 'completed');
    const totalTrainingHours = completed.length * 2;

    const progress = progresses.find((p) => p.studentName === studentName);
    if (!progress) return;

    const now = dayjs().toISOString();
    const updatedProgresses = progresses.map((p) => {
      if (p.studentName !== studentName) return p;
      return {
        ...p,
        completedSchedules: completed.length,
        totalTrainingHours,
        updatedAt: now,
      };
    });
    set({ progresses: updatedProgresses });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updatedProgresses);
  },

  updateRemark: (studentName, remark) => {
    const { progresses } = get();
    const now = dayjs().toISOString();
    const updatedProgresses = progresses.map((p) => {
      if (p.studentName !== studentName) return p;
      return {
        ...p,
        remark,
        updatedAt: now,
      };
    });
    set({ progresses: updatedProgresses });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updatedProgresses);
  },

  certifyStudent: (studentName, remark) => {
    get().updateStage(studentName, 'certified', 'certify', undefined, remark || '已领取驾驶证');
  },

  archiveStudent: (studentName, remark) => {
    get().updateStage(studentName, 'archived', 'manual', undefined, remark || '学员档案已归档');
  },

  getProgressByStudentName: (studentName) => {
    return get().progresses.find((p) => p.studentName === studentName);
  },

  getTransitionsByStudentName: (studentName) => {
    return get()
      .transitions.filter((t) => t.studentName === studentName)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  },

  recalculateAllProgresses: () => {
    const students = useStudentStore.getState().students;
    const schedules = useScheduleStore.getState().schedules;
    const appointments = useExamStore.getState().appointments;
    const { progresses } = get();

    students.forEach((student) => {
      if (!progresses.some((p) => p.studentName === student.name)) {
        get().initProgressForStudent(student.id, student.name, student.licenseType);
      }
    });

    const updatedProgresses = get().progresses.map((progress) => {
      const studentName = progress.studentName;
      const studentSchedules = schedules.filter((s) => s.studentName === studentName);
      const completedSchedules = studentSchedules.filter((s) => s.status === 'completed');
      const totalHours = completedSchedules.length * 2;
      const hasSchedules = studentSchedules.length > 0;
      const hasTraining = studentSchedules.some((s) => s.status === 'training');
      const allCompleted = hasSchedules && studentSchedules.every((s) => s.status === 'completed' || s.status === 'cancelled') && completedSchedules.length > 0;

      const studentExams = appointments.filter((a) => a.studentName === studentName);
      const passedSubjects = Array.from(
        new Set(
          studentExams
            .filter((a) => a.status === 'completed' && a.isPassed)
            .map((a) => a.subject)
        )
      );
      const hasBookedExam = studentExams.some((a) => a.status === 'booked' || a.status === 'confirmed');
      const allSubjectsPassed = (['subject1', 'subject2', 'subject3', 'subject4'] as ExamSubject[]).every((s) =>
        passedSubjects.includes(s)
      );

      let currentStage = progress.currentStage;
      const currentOrder = getProgressStageOrder(currentStage);

      if (allSubjectsPassed && currentOrder < getProgressStageOrder('exam_completed')) {
        currentStage = 'exam_completed';
      } else if (hasBookedExam && currentOrder < getProgressStageOrder('exam_booked')) {
        currentStage = 'exam_booked';
      } else if (allCompleted && currentOrder < getProgressStageOrder('course_completed')) {
        currentStage = 'course_completed';
      } else if (hasTraining && currentOrder < getProgressStageOrder('training')) {
        currentStage = 'training';
      } else if (hasSchedules && currentOrder < getProgressStageOrder('scheduled')) {
        currentStage = 'scheduled';
      }

      const now = dayjs().toISOString();
      const newTimeline = [...progress.stageTimeline];
      if (!newTimeline.some((t) => t.stage === currentStage)) {
        newTimeline.push({
          stage: currentStage,
          enteredAt: now,
          note: '系统自动同步阶段',
        });
      }

      return {
        ...progress,
        currentStage,
        stageTimeline: newTimeline,
        passedSubjects,
        completedSchedules: completedSchedules.length,
        totalTrainingHours: totalHours,
        updatedAt: now,
      };
    });

    set({ progresses: updatedProgresses });
    storage.set(STORAGE_KEYS.STUDENT_PROGRESSES, updatedProgresses);
  },
}));
