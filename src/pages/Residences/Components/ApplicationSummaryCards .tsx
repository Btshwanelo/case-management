import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, BanknoteIcon } from 'lucide-react';
import InsightCard from '@/components/InsightCard';

export const ApplicationSummaryCards = ({ summary }) => {
  const cards = [
    {
      title: 'Total Applications',
      value: summary?.totalApplications,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      bgColor: 'bg-green-200',
      subtitle: 'Current Month',
    },
    {
      title: 'Pending Approval',
      value: summary?.pendingApproval,
      icon: <BanknoteIcon className="h-5 w-5 text-yellow-600" />,
      bgColor: 'bg-yellow-200',
      subtitle: 'Current Month',
    },
    {
      title: 'Approved',
      value: summary?.approved,
      icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
      bgColor: 'bg-blue-200',
      subtitle: 'Current Month',
    },
    {
      title: 'Declined',
      value: summary?.rejected,
      icon: <CheckCircle2 className="h-5 w-5 text-red-600" />,
      bgColor: 'bg-red-200',
      subtitle: 'Current Month',
    },
    {
      title: 'Pending Move-In',
      value: summary?.pendingMoveIn,
      icon: <CheckCircle2 className="h-5 w-5 text-purple-600" />,
      bgColor: 'bg-purple-200',
      subtitle: 'Current Month',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 pb-2">
      {cards.map((card, index) => (
        <InsightCard
          key={index}
          icon={card.icon}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          iconBgColor={card.bgColor}
        />
      ))}
    </div>
  );
};
