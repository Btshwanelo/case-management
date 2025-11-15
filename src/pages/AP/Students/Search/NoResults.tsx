import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const NoResultsCard = ({ onSearchAgain }) => {
  return (
    <Card className="w-full  mx-auto border-none">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        {/* Icon */}
        <div className="p-3 bg-gray-100 rounded-full">
          <Users className="w-6 h-6 text-gray-500" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold">No student found</h2>

        {/* Description */}
        <p className="text-gray-500 text-center">This student does not have a lease history</p>

        {/* Search Again Button */}
        <Button variant="outline" className="mt-4" disabled onClick={onSearchAgain}>
          Search another student
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoResultsCard;
