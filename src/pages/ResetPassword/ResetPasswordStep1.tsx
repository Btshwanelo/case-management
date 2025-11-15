import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle2, X, Eye, EyeOff } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useExternalLogonMutation } from '@/services/apiService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SuccessResetPassword from './ResetPasswordStep2';
import { showErrorToast } from '@/components/ErrorToast ';
import SuccessPage from '@/components/SuccessPage';

const ResetPasswordStep1 = () => {
  const [secureCode, setSecureCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [validations, setValidations] = useState({
    length: false,
    special: false,
    uppercase: false,
    number: false,
    match: false,
    otp: false,
  });

  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const codeRefs = [useRef(), useRef(), useRef(), useRef()];

  const validateOTP = (code) => {
    return code.every((digit) => digit !== '');
  };

  const handleCodeChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...secureCode];
      newCode[index] = value;
      setSecureCode(newCode);

      // Update OTP validation
      setValidations((prev) => ({
        ...prev,
        otp: validateOTP(newCode),
      }));

      // Move to next input if value is entered
      if (value && index < 3) {
        codeRefs[index + 1].current.focus();
      }
    }
  };

  const handleBackspace = (index, e) => {
    if (e.key === 'Backspace') {
      if (!secureCode[index] && index > 0) {
        codeRefs[index - 1].current.focus();
      }
      const newCode = [...secureCode];
      newCode[index] = '';
      setSecureCode(newCode);
      setValidations((prev) => ({
        ...prev,
        otp: validateOTP(newCode),
      }));
    }
  };

  useEffect(() => {
    setValidations((prev) => ({
      ...prev,
      length: password.length >= 8,
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      match: password && password === confirmPassword,
    }));
  }, [password, confirmPassword]);

  const isFormValid = () => {
    return Object.values(validations).every((v) => v);
  };

  const [externalLogon, { isLoading, isSuccess, isError, error }] = useExternalLogonMutation();

  const handleSubmit = async () => {
    try {
      await externalLogon({
        body: {
          entityName: 'ExternalLogon',
          requestName: 'ResetPasswordExecuteRequest',
          inputParamters: {
            ResetPassword: {
              ExternalLogonId: id,
              Code: secureCode.join(''),
              Password: password,
            },
          },
        },
      }).unwrap();
    } catch (error) {
      showErrorToast(error?.data || 'Error resetting password');
    }
  };

  if (isSuccess) {
    return (
      <SuccessPage
        description={'Your password has been successfully reset. Continue to login.'}
        title={'Password Reset'}
        secondaryAction={{
          label: 'Continue to Loging',
          onClick: () => navigate('/login'),
        }}
      />
    );
  }

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center space-x-2">
      {isValid ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-red-600" />}
      <span className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-600'}`}>{text}</span>
    </div>
  );

  return (
    <UnauthorisedLayout>
      <Card className="w-full max-w-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-1">
            <div className="rounded-full border p-3">
              <Lock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">New Password</CardTitle>
          {/* <CardDescription className="text-gray-500 text-base">
            Your new password must be different from previously used passwords.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Secure Code Input */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 text-center mb-4">Enter Secure Code</div>
            <div className="flex gap-2 justify-center">
              {secureCode.map((code, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  className={`w-14 h-14 text-center text-lg ${code ? 'border-2 border-green-500' : 'border-2 border-orange-400'}`}
                  value={code}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  ref={codeRefs[index]}
                />
              ))}
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Reset Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-400 focus-visible:ring-orange-200 py-5 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-400 focus-visible:ring-orange-200 py-5 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Enhanced Validation Rules */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Password Requirements:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ValidationItem isValid={validations.otp} text="Valid secure code entered" />
              <ValidationItem isValid={validations.length} text="At least 8 characters" />
              <ValidationItem isValid={validations.special} text="One special character" />
              <ValidationItem isValid={validations.uppercase} text="One uppercase letter" />
              <ValidationItem isValid={validations.number} text="One number" />
              <ValidationItem isValid={validations.match} text="Passwords match" />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200"
            disabled={!isFormValid() || isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          {/* Back to Login */}
          <Button
            variant="secondary"
            className="w-full text-gray-500 hover:text-gray-600"
            onClick={() => (window.location.href = '/login')}
          >
            ← Back to login
          </Button>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default ResetPasswordStep1;
