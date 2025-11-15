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

const StudentForgotPassword = () => {
  const [id, setId] = useState('');
  const [idError, setIdError] = useState(''); // To hold error message for ID validation
  const [externalLogon, { isError, isLoading, isSuccess, data, error }] = useExternalLogonMutation();
  const navigate = useNavigate();
  const validateId = (value) => {
    const idRegex = /^\d{13}$/; // Regex for 13-digit South African ID
    if (!idRegex.test(value)) {
      setIdError('ID number must be exactly 13 digits.');
    } else {
      setIdError('');
    }
  };

  const handleIdChange = (e) => {
    const value = e.target.value;
    setId(value);
    validateId(value); // Call the validator on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idError) return; // Prevent submission if ID is invalid
    externalLogon({
      body: {
        entityName: 'ExternalLogon',
        requestName: 'ForgotPasswordExecuteRequest',
        inputParamters: {
          ForgotPassword: {
            Username: id,
            Channel: 'RSAID',
          },
        },
      },
    });
  };

  if (isSuccess) {
    return <SuccessForgotPassword email={''} externalLogonId={data?.ExternalLogonId} />;
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
          <CardDescription className="text-gray-500 text-base">No worries, we'll send you reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 mb-4">
              <Input type="text" placeholder="ID Number" required className="w-full py-5" value={id} onChange={handleIdChange} />
              {idError && <p className="text-red-500 text-sm">{idError}</p>} {/* Display validation error */}
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={!!idError} // Disable button if there's an error
            >
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

export default StudentForgotPassword;
