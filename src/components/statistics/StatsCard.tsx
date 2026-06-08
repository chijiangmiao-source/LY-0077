import React from 'react';
import { Card } from 'antd';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  suffix?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  suffix,
}) => {
  return (
    <Card
      style={{
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div
            style={{
              fontSize: 13,
              color: '#64748b',
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            {value}
            {suffix && (
              <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 4 }}>{suffix}</span>
            )}
          </div>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={26} color={color} />
        </div>
      </div>
    </Card>
  );
};
