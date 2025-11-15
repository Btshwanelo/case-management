// components/tenant/TenantSummary.tsx
import React from 'react';
import { CheckCircle, Clock, XCircle, FolderOpen } from 'lucide-react';
import InsightCard from '@/components/InsightCard';
import { TenantSummary as TenantSummaryType } from '@/types/tenant';

interface TenantSummaryProps {
  summary: TenantSummaryType;
}

const TenantSummary: React.FC<TenantSummaryProps> = ({ summary }) => {
  const summaryData = [
    {
      title: 'Scheduled Viewings',
      value: summary.pendingPropertyViewing,
      subtitle: 'Current month',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-200',
    },
    {
      title: 'Pending Signature',
      value: summary.pendingSignature,
      subtitle: 'Current month',
      icon: <FolderOpen className="h-5 w-5 text-purple-500" />,
      bgColor: 'bg-purple-200',
    },
    {
      title: 'Active Tenants',
      value: summary.active,
      subtitle: 'Current Month',
      icon: <CheckCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: 'bg-yellow-200',
    },
    {
      title: 'On Notice',
      value: summary.notice,
      subtitle: 'Current month',
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-200',
    },
    {
      title: 'Terminated',
      value: summary.terminated,
      subtitle: 'Current month',
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pb-2">
      {summaryData.map((item, index) => (
        <InsightCard
          key={index}
          icon={item.icon}
          title={item.title}
          value={item.value}
          subtitle={item.subtitle}
          iconBgColor={item.bgColor}
        />
      ))}
    </div>
  );
};

export default TenantSummary;
