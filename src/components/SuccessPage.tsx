import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, CircleCheck, Cloud, CloudOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import FocusedNavbar from './FocusedNavbar';
import Navbar from './Navbar';

interface SuccessPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const SuccessPage = ({ description, title, action, secondaryAction }: SuccessPageProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="mb-2">
          <div className="h-14 w-14 rounded-lg border border-gray-300 shadow-md flex items-center justify-center mx-auto">
            <CircleCheck className="h-6 w-6 font-semibold text-black" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-8">
          <h1 className="text-4xl font-semibold text-[#101828]">{title}</h1>

          <p className="text-gray-500 text-base font-normal">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-1">
          {action && (
            <Button variant="outline" className="px-8" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button className="bg-orange-500 hover:bg-orange-600 px-8" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
