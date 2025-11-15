import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderOpen, Plus, RefreshCcw } from 'lucide-react';
import EmptyStateIcon from '@/assets/Illustration.png';

interface EmptyStateProps {
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

const EmptyState = ({
  title = 'No items found',
  description = 'Get started by creating your first item',
  icon = <FolderOpen className="w-12 h-12 text-gray-400" />,
  action,
  secondaryAction,
}: EmptyStateProps) => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex max-w-64 h-16 mt-2 mb-14 items-center justify-center rounded-full bg-inherit">
          {/* {icon} */}
          <img src={EmptyStateIcon} alt="no-applications-image" width={'100%'} />
        </div>

        <h3 className=" text-base font-semibold text-gray-600">{title}</h3>

        {/* <p className="mt-2 text-lg text-gray-500 font-semibold max-w-sm">
          {description}
        </p> */}

        <div className="mt-2 flex gap-3">
          {action && (
            <Button variant="outline" onClick={action.onClick} className="flex items-center gap-2">
              {action.icon || <Plus className="w-4 h-4" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick} className="flex items-center gap-2">
              {secondaryAction.icon || <RefreshCcw className="w-4 h-4" />}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
