import React, { useState, useEffect } from 'react';
import { Drawer, Descriptions, Tag, Timeline, Button, Input, Space, App, Avatar, Divider } from 'antd';
import {
  UserPlus,
  CalendarDays,
  PlayCircle,
  BookOpen,
  FileText,
  CheckCircle,
  Award,
  Archive,
  Edit3,
  Save,
  X,
  Clock,
  BookCheck,
  UserCheck,
} from 'lucide-react';
import dayjs from 'dayjs';
import { StudentProgress, StageTransition } from '@/types';
import { PROGRESS_STAGES, EXAM_SUBJECT_OPTIONS } from '@/utils/constants';
import { getProgressStageColor } from '@/utils/helpers';
import { useProgressStore } from '@/store/progressStore';
import { useStudentStore } from '@/store/studentStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useExamStore } from '@/store/examStore';

const { TextArea } = Input;

interface ProgressDetailDrawerProps {
  open: boolean;
  progress: StudentProgress | null;
  onClose: () => void;
}

const getStageIcon = (stage: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    registered: <UserPlus size={16} />,
    scheduled: <CalendarDays size={16} />,
    training: <PlayCircle size={16} />,
    course_completed: <BookOpen size={16} />,
    exam_booked: <FileText size={16} />,
    exam_completed: <CheckCircle size={16} />,
    certified: <Award size={16} />,
    archived: <Archive size={16} />,
  };
  return iconMap[stage] || <Clock size={16} />;
};

const getTriggerIcon = (triggerType: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    schedule: <CalendarDays size={14} />,
    course: <BookCheck size={14} />,
    exam: <FileText size={14} />,
    manual: <UserCheck size={14} />,
    certify: <Award size={14} />,
  };
  return iconMap[triggerType] || <Clock size={14} />;
};

const getTriggerLabel = (triggerType: string) => {
  const labelMap: Record<string, string> = {
    schedule: '排班操作',
    course: '课程更新',
    exam: '考试更新',
    manual: '手动操作',
    certify: '拿证操作',
  };
  return labelMap[triggerType] || triggerType;
};

export const ProgressDetailDrawer: React.FC<ProgressDetailDrawerProps> = ({
  open,
  progress,
  onClose,
}) => {
  const { message } = App.useApp();
  const updateRemark = useProgressStore((s) => s.updateRemark);
  const getTransitionsByStudentName = useProgressStore((s) => s.getTransitionsByStudentName);
  const students = useStudentStore((s) => s.students);
  const schedules = useScheduleStore((s) => s.schedules);
  const appointments = useExamStore((s) => s.appointments);

  const [remarkText, setRemarkText] = useState('');
  const [isEditingRemark, setIsEditingRemark] = useState(false);
  const [transitions, setTransitions] = useState<StageTransition[]>([]);

  useEffect(() => {
    if (progress) {
      setRemarkText(progress.remark || '');
      setTransitions(getTransitionsByStudentName(progress.studentName));
    }
  }, [progress, getTransitionsByStudentName]);

  if (!progress) return null;

  const student = students.find((s) => s.name === progress.studentName);
  const studentSchedules = schedules.filter((s) => s.studentName === progress.studentName);
  const studentExams = appointments.filter((a) => a.studentName === progress.studentName);

  const handleSaveRemark = () => {
    updateRemark(progress.studentName, remarkText);
    setIsEditingRemark(false);
    message.success('备注已更新');
  };

  const handleCancelRemark = () => {
    setRemarkText(progress.remark || '');
    setIsEditingRemark(false);
  };

  const sortedTimeline = [...progress.stageTimeline].sort(
    (a, b) => dayjs(a.enteredAt).valueOf() - dayjs(b.enteredAt).valueOf()
  );

  const stageInfo = PROGRESS_STAGES.find((s) => s.value === progress.currentStage);

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            size={40}
            style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              fontWeight: 600,
            }}
          >
            {progress.studentName.slice(0, 1)}
          </Avatar>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
              {progress.studentName} - 拿证进度详情
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              当前阶段：
              <Tag color={getProgressStageColor(progress.currentStage)} style={{ marginLeft: 4 }}>
                {stageInfo?.label || progress.currentStage}
              </Tag>
            </div>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
    >
      <Descriptions
        title="基本信息"
        column={2}
        bordered
        size="small"
        style={{ marginBottom: 24 }}
      >
        <Descriptions.Item label="学员姓名">{progress.studentName}</Descriptions.Item>
        <Descriptions.Item label="学车证型">{progress.licenseType}</Descriptions.Item>
        <Descriptions.Item label="联系电话">{student?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="报名时间">
          {dayjs(progress.createdAt).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="完成课程数">{progress.completedSchedules} 次</Descriptions.Item>
        <Descriptions.Item label="累计训练时长">{progress.totalTrainingHours} 小时</Descriptions.Item>
        <Descriptions.Item label="已通过科目" span={2}>
          {progress.passedSubjects.length === 0 ? (
            <span style={{ color: '#94a3b8' }}>暂无通过科目</span>
          ) : (
            <Space wrap>
              {progress.passedSubjects.map((subject) => {
                const subjectInfo = EXAM_SUBJECT_OPTIONS.find((s) => s.value === subject);
                return (
                  <Tag key={subject} color="#059669" icon={<CheckCircle size={12} />}>
                    {subjectInfo?.label || subject}
                  </Tag>
                );
              })}
            </Space>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left" style={{ fontWeight: 600, color: '#1e293b', paddingLeft: 0 }}>
        阶段进度时间轴
      </Divider>
      <div
        style={{
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        <Timeline
          mode="left"
          items={sortedTimeline.map((item) => {
            const stageInfo = PROGRESS_STAGES.find((s) => s.value === item.stage);
            const isCurrent = item.stage === progress.currentStage;
            return {
              color: isCurrent ? getProgressStageColor(item.stage) : '#cbd5e1',
              dot: (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isCurrent ? getProgressStageColor(item.stage) : '#e2e8f0',
                    color: isCurrent ? '#fff' : '#64748b',
                  }}
                >
                  {getStageIcon(item.stage)}
                </div>
              ),
              label: dayjs(item.enteredAt).format('YYYY-MM-DD HH:mm'),
              children: (
                <div>
                  <div style={{ fontWeight: isCurrent ? 700 : 500, fontSize: 14, color: '#0f172a' }}>
                    {stageInfo?.label || item.stage}
                    {isCurrent && (
                      <Tag color="processing" style={{ marginLeft: 8 }}>
                        当前阶段
                      </Tag>
                    )}
                  </div>
                  {item.note && (
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      {item.note}
                    </div>
                  )}
                </div>
              ),
            };
          })}
        />
      </div>

      <Divider orientation="left" style={{ fontWeight: 600, color: '#1e293b', paddingLeft: 0 }}>
        阶段流转记录
      </Divider>
      <div
        style={{
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: 12,
          marginBottom: 24,
          maxHeight: 320,
          overflowY: 'auto',
        }}
      >
        {transitions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            暂无流转记录
          </div>
        ) : (
          transitions.map((transition, index) => {
            const fromStageInfo = transition.fromStage
              ? PROGRESS_STAGES.find((s) => s.value === transition.fromStage)
              : null;
            const toStageInfo = PROGRESS_STAGES.find((s) => s.value === transition.toStage);
            return (
              <div
                key={transition.id}
                style={{
                  padding: 12,
                  marginBottom: index < transitions.length - 1 ? 8 : 0,
                  background: '#fff',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag
                      color="blue"
                      icon={getTriggerIcon(transition.triggerType)}
                      style={{ borderRadius: 4 }}
                    >
                      {getTriggerLabel(transition.triggerType)}
                    </Tag>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>
                      {fromStageInfo ? fromStageInfo.label : '无'}
                      <span style={{ margin: '0 6px', color: '#94a3b8' }}>→</span>
                      <span style={{ color: getProgressStageColor(transition.toStage) }}>
                        {toStageInfo?.label || transition.toStage}
                      </span>
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>
                    {dayjs(transition.createdAt).format('YYYY-MM-DD HH:mm')}
                  </span>
                </div>
                {transition.remark && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
                    备注：{transition.remark}
                  </div>
                )}
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  操作人：{transition.operator}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Divider orientation="left" style={{ fontWeight: 600, color: '#1e293b', paddingLeft: 0 }}>
        备注信息
      </Divider>
      <div
        style={{
          padding: '16px 20px',
          background: '#f8fafc',
          borderRadius: 12,
          marginBottom: 24,
        }}
      >
        {isEditingRemark ? (
          <div>
            <TextArea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="请输入备注信息..."
              rows={4}
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ marginBottom: 12 }}
            />
            <Space>
              <Button type="primary" icon={<Save size={14} />} onClick={handleSaveRemark}>
                保存
              </Button>
              <Button icon={<X size={14} />} onClick={handleCancelRemark}>
                取消
              </Button>
            </Space>
          </div>
        ) : (
          <div>
            <div
              style={{
                minHeight: 60,
                padding: 12,
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                whiteSpace: 'pre-wrap',
                color: remarkText ? '#334155' : '#94a3b8',
              }}
            >
              {remarkText || '暂无备注信息'}
            </div>
            <Button
              type="link"
              icon={<Edit3 size={14} />}
              onClick={() => setIsEditingRemark(true)}
              style={{ paddingLeft: 0, marginTop: 8 }}
            >
              编辑备注
            </Button>
          </div>
        )}
      </div>

      <Divider orientation="left" style={{ fontWeight: 600, color: '#1e293b', paddingLeft: 0 }}>
        相关记录
      </Divider>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="练车排班记录">
          <div>
            共 {studentSchedules.length} 条排班记录，其中已完成 {studentSchedules.filter((s) => s.status === 'completed').length} 条
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="考试预约记录">
          <div>
            共 {studentExams.length} 条考试记录，其中已通过 {studentExams.filter((a) => a.status === 'completed' && a.isPassed).length} 条
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Drawer>
  );
};
