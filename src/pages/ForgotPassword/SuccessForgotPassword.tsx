import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useNavigate } from 'react-router-dom';

const SuccessForgotPassword = ({ email, externalLogonId }) => {
  const navigate = useNavigate();
  const handleOpenEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  const handleResend = () => {
    // Handle resend logic
  };

  return (
    <UnauthorisedLayout>
      {' '}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-gray-500 text-base">
            We sent a password reset link and OTP to your email
            <br />
            {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Button onClick={() => navigate(`/reset-password?id=${externalLogonId}`)} className="w-full bg-orange-500 hover:bg-orange-600">
            ← Reset Password
          </Button>

          <div className="text-center text-sm space-y-8"></div>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default SuccessForgotPassword;
