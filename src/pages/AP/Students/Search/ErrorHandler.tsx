import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const ErrorCard = ({ error, onSearchAgain }) => {
  return (
    <Card className="w-full  mx-auto border-none">
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
        {/* Icon */}
        <div className="p-3 bg-gray-100 rounded-full">
          <Users className="w-20 h-20 text-gray-500" />
        </div>
        {/* Description */}
        <p className="text-lg font-semibold text-red-500 max-w-56 text-center">{error}</p>
        <Button variant="outline" className="mt-4" onClick={onSearchAgain}>
          Search another student
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorCard;
