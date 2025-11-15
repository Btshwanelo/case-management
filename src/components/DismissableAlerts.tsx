import React, { useState } from 'react';
import { CircleAlert, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from './ui/button';

const DismissableAlerts = ({ alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismissAlert = (index) => {
    setAlerts(alerts.filter((_, i) => i !== index));
  };

  if (!alerts?.length) return null;

  return (
    <div className=" h-8 w-full mt-[-4px]">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          className={`
            absolute 
            w-full 
            transition-all 
            duration-300 
            ease-in-out
            rounded-none
            border-none
            py-[10px]
            bg-[#3163c9]
            text-white
            ${index === 0 ? 'z-30' : ''}
            ${index === 1 ? 'z-20 translate-y-2 opacity-90 scale-[0.98]' : ''}
            ${index === 2 ? 'z-10 translate-y-4 opacity-80 scale-[0.96]' : ''}
            ${index > 2 ? 'hidden' : ''}
          `}
        >
          <AlertDescription className="container relative px-4 mx-auto">
            <div className="flex items-start justify-center">
              <span className=" flex gap-3 font-extralight capitalize align-text-bottom text-sm">
                <CircleAlert strokeWidth={'3px'} size={20} /> {alert.message}
              </span>
              <button
                onClick={() => dismissAlert(index)}
                className="absolute right-0 top-[-7px] p-1 font-bold rounded-lg transition-colors"
                aria-label="Dismiss alert"
              >
                <X strokeWidth={'3px'} className="h-5 w-5 text-white" />
              </button>
            </div>
            {/* <Button
              href={alert.actionLink}
              className="block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Take Action →
            </Button> */}
            {/* <a href={alert.actionLink} className="block mt-1 text-sm font-medium text-blue-600 hover:text-blue-800">
              Take Action →
            </a> */}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default DismissableAlerts;
