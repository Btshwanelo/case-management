import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';

const InviteSuccess = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="mt-14 bg-white flex flex-col items-center justify-center px-4">
        <div className="max-w-xl w-full text-center space-y-6">
          <div className="mb-8">
            <div className="h-16 w-16 rounded-xl bg-green-200 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-gray-800" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-gray-900">Student Successfully invited</h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Button variant="outline" className="px-8" onClick={() => navigate('/ap/students/search')}>
              Invite Another Student
            </Button>

            <Button className="bg-orange-500 hover:bg-orange-600 px-8" onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>{' '}
    </DashboardLayout>
  );
};

export default InviteSuccess;
