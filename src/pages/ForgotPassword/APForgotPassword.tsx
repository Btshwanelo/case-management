import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useExternalLogonMutation } from '@/services/apiService';
import SuccessForgotPassword from './SuccessForgotPassword';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';
import { showErrorToast } from '@/components/ErrorToast ';

const APForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [externalLogon, { isError, isLoading, isSuccess, data, error }] = useExternalLogonMutation();
  const handleSubmit = (e) => {
    e.preventDefault();
    externalLogon({
      body: {
        entityName: 'ExternalLogon',
        requestName: 'ForgotPasswordExecuteRequest',
        inputParamters: {
          ForgotPassword: {
            Username: email,
            Channel: 'EMAIL',
          },
        },
      },
    });
  };

  if (isSuccess) {
    return <SuccessForgotPassword email={email} externalLogonId={data?.ExternalLogonId} />;
  }

  if (isError) {
    showErrorToast(error?.data);
  }

  return (
    <UnauthorisedLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription className="text-gray-500">No worries, we'll send you reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                required
                className="w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
              {isLoading ? <Spinner /> : 'Reset password'}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate('/login')}>
              Back to login{' '}
            </Button>
          </form>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default APForgotPassword;
