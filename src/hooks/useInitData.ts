import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';
import { useCourseRecordStore } from '@/store/courseRecordStore';
import { useExamStore } from '@/store/examStore';

export const useInitData = () => {
  const fetchSchedules = useScheduleStore((s) => s.fetchSchedules);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const fetchCoaches = useCoachStore((s) => s.fetchCoaches);
  const fetchRecords = useCourseRecordStore((s) => s.fetchRecords);
  const fetchExamAppointments = useExamStore((s) => s.fetchAppointments);

  useEffect(() => {
    fetchSchedules();
    fetchStudents();
    fetchCoaches();
    fetchRecords();
    fetchExamAppointments();
  }, [fetchSchedules, fetchStudents, fetchCoaches, fetchRecords, fetchExamAppointments]);
};
