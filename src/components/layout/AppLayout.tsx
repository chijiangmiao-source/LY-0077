import React from 'react';
import { Layout, Menu, Badge, theme } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  UserCheck,
  BarChart3,
  Car,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useScheduleStore } from '@/store/scheduleStore';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/schedule',
    icon: <CalendarDays size={18} />,
    label: '排班看板',
  },
  {
    key: '/students',
    icon: <Users size={18} />,
    label: '学员管理',
  },
  {
    key: '/coaches',
    icon: <UserCheck size={18} />,
    label: '教练管理',
  },
  {
    key: '/exams',
    icon: <FileText size={18} />,
    label: '考试预约',
  },
  {
    key: '/statistics',
    icon: <BarChart3 size={18} />,
    label: '统计看板',
  },
];

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const absentCount = useScheduleStore(
    (s) => s.schedules.filter((sc) => sc.isAbsent).length
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        style={{ background: '#0f172a' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '0 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Car color="#60a5fa" size={28} />
          <span
            style={{
              color: '#fff',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}
          >
            驾校排班系统
          </span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: '#0f172a', border: 'none', paddingTop: 16 }}
          onClick={({ key }) => navigate(key)}
          items={menuItems.map((item) => ({
            ...item,
            label: item.key === '/schedule' && absentCount > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{item.label}</span>
                <Badge
                  count={absentCount}
                  size="small"
                  style={{ backgroundColor: '#ef4444' }}
                />
              </div>
            ) : (
              item.label
            ),
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>
            {menuItems.find((m) => m.key === location.pathname)?.label ||
              '管理系统'}
          </div>
          {absentCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                color: '#dc2626',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <AlertTriangle size={16} />
              <span>异常缺勤：{absentCount} 条</span>
            </div>
          )}
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
