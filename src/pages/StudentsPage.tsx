import React, { useState } from 'react';
import { Button, Input, Space } from 'antd';
import { Plus, Search } from 'lucide-react';
import { StudentTable } from '@/components/student/StudentTable';
import { StudentForm } from '@/components/student/StudentForm';
import { useStudentStore } from '@/store/studentStore';
import { Student } from '@/types';

export const StudentsPage: React.FC = () => {
  const students = useStudentStore((s) => s.students);
  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((s) => {
    if (!keyword) return true;
    const kw = keyword.toLowerCase();
    return (
      s.name.toLowerCase().includes(kw) ||
      s.phone.toLowerCase().includes(kw)
    );
  });

  const handleAdd = () => {
    setEditingStudent(null);
    setFormOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditingStudent(null);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
          学员管理
        </div>
        <Space>
          <Input
            allowClear
            placeholder="搜索学员姓名/手机号"
            prefix={<Search size={16} style={{ color: '#94a3b8' }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            新增学员
          </Button>
        </Space>
      </div>

      <StudentTable
        data={filteredStudents}
        onEdit={handleEdit}
      />

      <StudentForm
        open={formOpen}
        editingStudent={editingStudent}
        onCancel={() => {
          setFormOpen(false);
          setEditingStudent(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
