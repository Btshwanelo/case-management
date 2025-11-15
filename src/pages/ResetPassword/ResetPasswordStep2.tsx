import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useNavigate } from 'react-router-dom';

const SuccessResetPassword = () => {
  const email = 'bucibot@gmail.com';
  const navigate = useNavigate();

  const handleOpenEmail = () => {
    navigate('/login');
  };

  const handleResend = () => {
    // Handle resend logic
  };

  return (
    <UnauthorisedLayout>
      {' '}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Password reset</CardTitle>
          <CardDescription className="text-gray-500">
            Your password has been successfully reset. Click below to log in magically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => (window.location.href = '/login')} className="w-full bg-orange-500 hover:bg-orange-600">
            ← Back to login
          </Button>

          {/* <div className="text-center text-sm space-y-4">
            <Button variant="ghost" className="text-gray-500 hover:text-gray-600" onClick={() => (window.location.href = '/login')}>
              ← Back to login
            </Button>
          </div> */}
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default SuccessResetPassword;
