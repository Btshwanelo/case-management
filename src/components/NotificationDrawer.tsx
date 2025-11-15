import React from 'react';
import { Bell, X, FileText, Building, Calendar } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ title, action, description }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-100 cursor-pointer rounded-lg">
      <div className="mt-1 border-2 p-2 rounded-md">
        <FileText className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate(action)}
        size="sm"
        className="border-2 border-red-500 text-red-500 font-bold hover:bg-red-500 hover:text-white"
      >
        Action
      </Button>
      {/* <span className="text-xs text-red-500 font-bold border border-red-500 rounded-md p-1 cursor-pointer">Action</span> */}
    </div>
  );
};

const NotificationDrawer = ({ open, onOpenChange }) => {
  const notifications = [
    {
      icon: FileText,
      title: 'You have 12 new Applications to approve',
      description: 'Tap here to review the applications',
      time: 'Just now',
    },
    {
      icon: Building,
      title: 'There are 2 new cases at Hax properties',
      description: 'Tap here to review the cases',
      time: '2 mins ago',
    },
    {
      icon: Calendar,
      title: '3 property viewings will expire today',
      description: 'Tap here to review the the viewings',
      time: '2 mins ago',
    },
    {
      icon: FileText,
      title: '18 Leases are about to expire',
      description: 'Tap here to review',
      time: '3 hours ago',
    },
    {
      icon: FileText,
      title: 'You have pending leases to sign',
      description: 'Tap here to review',
      time: '3 hours ago',
    },
  ];

  const QuickActions = useSelector((state: RootState) => state.quickActions.quickActions);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between px-1 pb-4">
          <SheetTitle>Notification centre</SheetTitle>
          {/* <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose> */}
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="flex flex-col gap-1">
            {QuickActions.map((notification, index) => (
              <NotificationItem
                key={index}
                action={notification.actionLink}
                title={notification.title}
                // message={notification.message}
                description={notification.description}
                // time={notification.time}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationDrawer;
