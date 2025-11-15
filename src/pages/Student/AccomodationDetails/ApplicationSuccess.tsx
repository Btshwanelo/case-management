import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const ApplicationSuccess = ({ propertyName }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-30 flex items-center justify-center mt-20">
      <Card className=" shadow-none border-none">
        <CardContent className="pt-12 pb-8 px-10 flex flex-col items-center space-y-4">
          {/* Success Icon */}

          <div className="rounded-full p-4 border-2 border-zinc-200">
            <Check className="h-8 w-8 text-gray-800" />
          </div>

          {/* Success Message */}
          <div className="text-center max-w-xl space-y-6">
            <h2 className="text-xl font-semibold text-zinc-900">{'Application submitted'}</h2>
            <p className="text-md text-zinc-600">
              {' '}
              Your application for {propertyName} has been received. Your application is pending approval from the institution. Once the
              institution has processed your application and is approved. The accommodation provider will be able to reserve a bed for you
              and arrange a property viewing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button variant="outline" className="px-8" onClick={() => navigate('/student/my-applications/home')}>
              View Applications
            </Button>

            <Button className="bg-orange-500 hover:bg-orange-600 px-8" onClick={() => navigate('/student/search-residence')}>
              Continue Searching
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationSuccess;
