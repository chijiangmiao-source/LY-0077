export type CourseStatus = 'pending' | 'training' | 'completed' | 'cancelled';

export type ProgressStage =
  | 'registered'
  | 'scheduled'
  | 'training'
  | 'course_completed'
  | 'exam_booked'
  | 'exam_completed'
  | 'certified'
  | 'archived';

export interface StageTransition {
  id: string;
  studentName: string;
  fromStage: ProgressStage | null;
  toStage: ProgressStage;
  triggerType: 'schedule' | 'course' | 'exam' | 'manual' | 'certify';
  triggerId?: string;
  remark?: string;
  operator: string;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  studentName: string;
  licenseType: string;
  currentStage: ProgressStage;
  stageTimeline: {
    stage: ProgressStage;
    enteredAt: string;
    note?: string;
  }[];
  passedSubjects: ExamSubject[];
  totalTrainingHours: number;
  completedSchedules: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressFilter {
  keyword?: string;
  studentName?: string;
  currentStage?: ProgressStage | '';
  licenseType?: string;
  examSubject?: ExamSubject | '';
  dateRange?: [string, string] | null;
  dateField?: 'createdAt' | 'updatedAt' | 'stageEntered';
}

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
  carType?: string;
  status?: CourseStatus | '';
}

export interface BatchScheduleAdjustData {
  coachName?: string;
  carType?: string;
  trainingDate?: string;
  timeSlot?: string;
}

export interface StatisticsFilter {
  dateRange?: [string, string] | null;
  coachName?: string;
  carType?: string;
  status?: CourseStatus | '';
}

export type ExamSubject = 'subject1' | 'subject2' | 'subject3' | 'subject4';

export type ExamStatus = 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'absent';

export interface ExamAppointment {
  id: string;
  studentName: string;
  subject: ExamSubject;
  appointmentDate: string;
  session: string;
  status: ExamStatus;
  isPassed?: boolean;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExamFormData {
  id?: string;
  studentName: string;
  subject: ExamSubject;
  appointmentDate: string;
  session: string;
  status: ExamStatus;
  isPassed?: boolean;
  remark?: string;
}

export interface ExamFilter {
  keyword?: string;
  studentName?: string;
  subject?: ExamSubject | '';
  dateRange?: [string, string] | null;
  status?: ExamStatus | '';
}

export interface ExamStatusOption {
  value: ExamStatus;
  label: string;
  color: 'default' | 'processing' | 'success' | 'error' | 'warning';
}

export interface ExamSubjectOption {
  value: ExamSubject;
  label: string;
}
