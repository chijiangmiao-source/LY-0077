export type CourseStatus = 'pending' | 'training' | 'completed' | 'cancelled';

export interface Schedule {
  id: string;
  studentName: string;
  coachName: string;
  carType: string;
  trainingDate: string;
  timeSlot: string;
  status: CourseStatus;
  isAbsent: boolean;
  absentNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseRecord {
  id: string;
  scheduleId: string;
  trainingItem: string;
  isCompleted: boolean;
  recordDate: string;
  remark?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  licenseType: string;
  createdAt: string;
}

export interface Coach {
  id: string;
  name: string;
  phone: string;
  carType: string;
  createdAt: string;
}

export interface StatusOption {
  value: CourseStatus;
  label: string;
  color: 'default' | 'processing' | 'success' | 'error' | 'warning';
}

export interface ScheduleFormData {
  id?: string;
  studentName: string;
  coachName: string;
  carType: string;
  trainingDate: string;
  timeSlot: string;
  status: CourseStatus;
}

export interface ScheduleFilter {
  keyword?: string;
  dateRange?: [string, string] | null;
  coachName?: string;
  studentName?: string;
  status?: CourseStatus | '';
}
