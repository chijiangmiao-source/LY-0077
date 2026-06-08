import React, { useState } from 'react';
import { Button, Input, Space } from 'antd';
import { Plus, Search } from 'lucide-react';
import { CoachTable } from '@/components/coach/CoachTable';
import { CoachForm } from '@/components/coach/CoachForm';
import { useCoachStore } from '@/store/coachStore';
import { Coach } from '@/types';

export const CoachesPage: React.FC = () => {
  const coaches = useCoachStore((s) => s.coaches);
  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const filteredCoaches = coaches.filter((c) => {
    if (!keyword) return true;
    const kw = keyword.toLowerCase();
    return (
      c.name.toLowerCase().includes(kw) ||
      c.phone.toLowerCase().includes(kw)
    );
  });

  const handleAdd = () => {
    setEditingCoach(null);
    setFormOpen(true);
  };

  const handleEdit = (coach: Coach) => {
    setEditingCoach(coach);
    setFormOpen(true);
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditingCoach(null);
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
          教练管理
        </div>
        <Space>
          <Input
            allowClear
            placeholder="搜索教练姓名/手机号"
            prefix={<Search size={16} style={{ color: '#94a3b8' }} />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
          />
          <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
            新增教练
          </Button>
        </Space>
      </div>

      <CoachTable
        data={filteredCoaches}
        onEdit={handleEdit}
      />

      <CoachForm
        open={formOpen}
        editingCoach={editingCoach}
        onCancel={() => {
          setFormOpen(false);
          setEditingCoach(null);
        }}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
