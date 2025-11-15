import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const EmptyCard = ({ onSearchAgain, onInvite }) => {
  return (
    <Card className="w-full  mx-auto border-none">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        {/* Icon */}
        <div className="p-3 bg-gray-100 rounded-full">
          <Users className="w-20 h-20 text-gray-500" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900 max-w-80 text-center">No students found.</h2>
        <h2 className="text-md text-gray-600 font-normal  max-w-96 text-center">
          This student does not have a lease history, you can proceed to invite them to apply to your property below
        </h2>
        <div className="flex gap-4">
          <Button variant="outline" className="mt-4" onClick={onSearchAgain}>
            Search another
          </Button>
          {/* <Button variant="default" className="mt-4" onClick={() => onInvite()}>
            Invite to Apply
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyCard;
