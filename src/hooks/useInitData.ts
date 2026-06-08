import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';
import { useCourseRecordStore } from '@/store/courseRecordStore';

export const useInitData = () => {
  const fetchSchedules = useScheduleStore((s) => s.fetchSchedules);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const fetchCoaches = useCoachStore((s) => s.fetchCoaches);
  const fetchRecords = useCourseRecordStore((s) => s.fetchRecords);

  useEffect(() => {
    fetchSchedules();
    fetchStudents();
    fetchCoaches();
    fetchRecords();
  }, [fetchSchedules, fetchStudents, fetchCoaches, fetchRecords]);
};
