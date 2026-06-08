import { StatusOption } from '@/types';

export const STORAGE_KEYS = {
  SCHEDULES: 'driving_school_schedules',
  STUDENTS: 'driving_school_students',
  COACHES: 'driving_school_coaches',
  COURSE_RECORDS: 'driving_school_course_records',
};

export const STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: '待开始', color: 'default' },
  { value: 'training', label: '训练中', color: 'processing' },
  { value: 'completed', label: '已完成', color: 'success' },
  { value: 'cancelled', label: '已取消', color: 'error' },
];

export const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '14:00-16:00',
  '16:00-18:00',
  '19:00-21:00',
];

export const CAR_TYPES = ['C1手动挡', 'C2自动挡', 'A1大客车', 'B2大货车'];

export const LICENSE_TYPES = ['C1', 'C2', 'A1', 'A2', 'A3', 'B1', 'B2'];

export const TRAINING_ITEMS = [
  '倒车入库',
  '侧方停车',
  '曲线行驶',
  '直角转弯',
  '坡道定点停车与起步',
  '加减档位操作',
  '变更车道',
  '靠边停车',
  '直线行驶',
  '会车',
  '超车',
  '掉头',
  '夜间行驶',
];
