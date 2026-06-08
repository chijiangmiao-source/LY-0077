import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { useStudentStore } from '@/store/studentStore';
import { useCoachStore } from '@/store/coachStore';
import { useCourseRecordStore } from '@/store/courseRecordStore';
import { useExamStore } from '@/store/examStore';
import { useProgressStore } from '@/store/progressStore';

export const useInitData = () => {
  const fetchSchedules = useScheduleStore((s) => s.fetchSchedules);
  const fetchStudents = useStudentStore((s) => s.fetchStudents);
  const fetchCoaches = useCoachStore((s) => s.fetchCoaches);
  const fetchRecords = useCourseRecordStore((s) => s.fetchRecords);
  const fetchExamAppointments = useExamStore((s) => s.fetchAppointments);
  const fetchProgresses = useProgressStore((s) => s.fetchProgresses);
  const fetchTransitions = useProgressStore((s) => s.fetchTransitions);
  const recalculateAllProgresses = useProgressStore((s) => s.recalculateAllProgresses);
  const students = useStudentStore((s) => s.students);
  const initProgressForStudent = useProgressStore((s) => s.initProgressForStudent);

  useEffect(() => {
    fetchSchedules();
    fetchStudents();
    fetchCoaches();
    fetchRecords();
    fetchExamAppointments();
    fetchProgresses();
    fetchTransitions();
  }, [fetchSchedules, fetchStudents, fetchCoaches, fetchRecords, fetchExamAppointments, fetchProgresses, fetchTransitions]);

  useEffect(() => {
    if (students.length > 0) {
      students.forEach((student) => {
        initProgressForStudent(student.id, student.name, student.licenseType);
      });
      setTimeout(() => {
        recalculateAllProgresses();
      }, 100);
    }
  }, [students, initProgressForStudent, recalculateAllProgresses]);
};
