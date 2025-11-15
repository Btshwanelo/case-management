import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface Notification {
  message: string;
  actionLink?: string;
  id?: string | number;
}

interface NotificationAlertProps {
  message: string;
  actionLink?: string;
  onDismiss: (message) => void;
  className?: string;
}

export const NotificationAlert = ({ message, actionLink, onDismiss, className }: NotificationAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = (message) => {
    setIsVisible(false);
    onDismiss(message);
  };

  if (!isVisible) return null;

  return (
    <Alert
      className={cn(
        'relative border-orange-500 bg-orange-50 text-orange-900',
        'shadow-lg transition-all duration-300 ease-in-out',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-orange-500" />
        <div className="flex-1 flex flex-col">
          <AlertDescription className="text-sm">{message}</AlertDescription>
          {actionLink && (
            <Link to={actionLink} className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-2 inline-block">
              Complete Now →
            </Link>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-orange-100 text-orange-500"
          onClick={() => handleDismiss(message)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </Alert>
  );
};
