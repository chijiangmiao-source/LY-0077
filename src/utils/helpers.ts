import dayjs from 'dayjs';

export const generateScheduleId = (existingIds: string[]): string => {
  const datePrefix = dayjs().format('YYYYMMDD');
  const prefix = `SCH${datePrefix}`;
  const todayIds = existingIds.filter((id) => id.startsWith(prefix));
  const maxNum = todayIds.reduce((max, id) => {
    const num = parseInt(id.slice(prefix.length), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};

export const generateId = (): string => {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
};

export const cleanText = (text: string): string => {
  return text.replace(/\s+/g, '').replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
};

export const isValidName = (name: string): boolean => {
  const cleaned = cleanText(name);
  return cleaned.length >= 2 && /^[\u4e00-\u9fa5a-zA-Z]+$/.test(cleaned);
};

export const isValidPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone.replace(/\s/g, ''));
};

export const isDateNotBeforeToday = (dateStr: string): boolean => {
  const today = dayjs().startOf('day');
  const target = dayjs(dateStr).startOf('day');
  return target.isSame(today) || target.isAfter(today);
};

export const getStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待开始',
    training: '训练中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return map[status] || status;
};

export const generateExamId = (existingIds: string[]): string => {
  const datePrefix = dayjs().format('YYYYMMDD');
  const prefix = `EX${datePrefix}`;
  const todayIds = existingIds.filter((id) => id.startsWith(prefix));
  const maxNum = todayIds.reduce((max, id) => {
    const num = parseInt(id.slice(prefix.length), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};

export const getExamSubjectLabel = (subject: string): string => {
  const map: Record<string, string> = {
    subject1: '科目一（理论）',
    subject2: '科目二（场地）',
    subject3: '科目三（路考）',
    subject4: '科目四（安全文明）',
  };
  return map[subject] || subject;
};

export const getExamStatusLabel = (status: string): string => {
  const map: Record<string, string> = {
    booked: '已预约',
    confirmed: '已确认',
    completed: '已完成',
    cancelled: '已取消',
    absent: '缺考',
  };
  return map[status] || status;
};

export const canTransitionStatus = (
  current: string,
  next: string
): boolean => {
  const transitions: Record<string, string[]> = {
    pending: ['training', 'cancelled'],
    training: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };
  return transitions[current]?.includes(next) ?? false;
};

export const getProgressStageLabel = (stage: string): string => {
  const map: Record<string, string> = {
    registered: '已报名',
    scheduled: '已排班',
    training: '训练中',
    course_completed: '课程完成',
    exam_booked: '已约考',
    exam_completed: '考试完成',
    certified: '已拿证',
    archived: '已归档',
  };
  return map[stage] || stage;
};

export const getProgressStageColor = (stage: string): string => {
  const map: Record<string, string> = {
    registered: '#64748b',
    scheduled: '#0891b2',
    training: '#d97706',
    course_completed: '#059669',
    exam_booked: '#d97706',
    exam_completed: '#059669',
    certified: '#7c3aed',
    archived: '#64748b',
  };
  return map[stage] || '#64748b';
};

export const getProgressStageOrder = (stage: string): number => {
  const order: Record<string, number> = {
    registered: 0,
    scheduled: 1,
    training: 2,
    course_completed: 3,
    exam_booked: 4,
    exam_completed: 5,
    certified: 6,
    archived: 7,
  };
  return order[stage] ?? 0;
};

export const canTransitionProgressStage = (
  current: string,
  next: string
): boolean => {
  const currentOrder = getProgressStageOrder(current);
  const nextOrder = getProgressStageOrder(next);
  return nextOrder >= currentOrder;
};
