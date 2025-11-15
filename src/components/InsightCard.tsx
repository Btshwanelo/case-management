import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  // Icon from lucide-react library
  icon: LucideIcon | React.ReactNode;
  // Title displayed next to the icon
  title: string;
  // Main value to be displayed
  value: number | string;
  // Optional subtitle/description
  subtitle?: string;
  // Background color for icon container (Tailwind class)
  iconBgColor?: string;
  borderColor?: string;
  // Text color for the value (Tailwind class)
  valueColor?: string;
  // Custom formatter function for the value
  formatValue?: (value: number | string) => string;
  // Optional className for additional styling
  className?: string;
}

const InsightCard = ({
  icon,
  title,
  value,
  subtitle,
  iconBgColor = 'bg-blue-100',
  borderColor,
  valueColor = 'text-gray-900',
  formatValue = (val) => String(val),
  className = '',
}: InsightCardProps) => {
  // If icon is a Lucide icon component, clone it with default props
  const IconComponent = React.isValidElement(icon)
    ? icon
    : React.createElement(icon as React.ComponentType, {
        className: 'w-5 h-5',
      });

  return (
    <Card className={className}>
      <CardContent className="p-5 flex flex-col md:flex-row gap-4">
        <div className="flex items-center">
          <div className={`p-2 rounded-xl border ${borderColor}`}>{IconComponent}</div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-gray-600">{title}</span>
          <span className={`text-lg font-semibold`}>{formatValue(value)}</span>
          {/* {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>} */}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
