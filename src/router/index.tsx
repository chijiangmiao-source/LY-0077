import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppLayout } from '@/components/layout/AppLayout';
import { SchedulePage } from '@/pages/SchedulePage';
import { StudentsPage } from '@/pages/StudentsPage';
import { CoachesPage } from '@/pages/CoachesPage';
import { StatisticsPage } from '@/pages/StatisticsPage';
import { ExamsPage } from '@/pages/ExamsPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { useInitData } from '@/hooks/useInitData';

const AppContent: React.FC = () => {
  useInitData();
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/schedule" replace />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/coaches" element={<CoachesPage />} />
        <Route path="/exams" element={<ExamsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </AppLayout>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1e40af',
          colorInfo: '#1e40af',
          borderRadius: 6,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: {
            colorPrimary: '#1e40af',
            algorithm: true,
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#334155',
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};
