import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useExternalLogonMutation } from '@/services/apiService';
import SuccessForgotPassword from './SuccessForgotPassword';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordStep1 = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(''); // For email validation error messages
  const [externalLogon, { isError, isLoading, isSuccess, data }] = useExternalLogonMutation();

  const navigate = useNavigate();
  // Email validation function
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation regex
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
  };

  // Handle input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value); // Validate email on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (emailError) return; // Prevent submission if email is invalid
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
    return <SuccessForgotPassword email={email} />;
  }
  return (
    <UnauthorisedLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-gray-100 p-3">
              <Lock className="w-6 h-6 text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
          <CardDescription className="text-gray-500">No worries, we'll send you reset instructions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8">
              <Input type="text" placeholder="Email" required className="w-full" value={email} onChange={handleEmailChange} />
              {emailError && <p className="text-red-500 text-sm">{emailError}</p>} {/* Display validation error */}
            </div>
            <Button
              type="submit"
              className="w-full bg-orange-500 mb-4 hover:bg-orange-600"
              disabled={!!emailError} // Disable button if there's an error
            >
              Reset password
            </Button>
            <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-600" onClick={() => navigate('/login')}>
              ← Back to login
            </Button>
          </form>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default ForgotPasswordStep1;
