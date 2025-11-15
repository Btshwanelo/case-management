import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, CheckCircle2, X, Eye, EyeOff, Mail } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { useExternalLogonMutation } from '@/services/apiService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showErrorToast } from '@/components/ErrorToast ';
import SuccessPage from '@/components/SuccessPage';
import { DialogDescription } from '@/components/ui/dialog';

const ResetPassword = () => {
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
      {isValid ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <CheckCircle2 className="h-5 w-5 text-red-600" />}
      <span className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-600'}`}>{text}</span>
    </div>
  );

  return (
    <UnauthorisedLayout>
      <Card className="w-full bg-none border-none max-w-md">
        <CardHeader className=" text-center">
          <div className="flex justify-center">
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-[#FFE6D5] flex items-center justify-center">
              {<Mail className="h-6 w-6 text-[#FF692E]" />}
            </div>
          </div>
          <CardTitle className="text-2xl font-medium">Please check your email.</CardTitle>
          <CardTitle className="text-center text-[#535862] font-normal text-sm">
            A one-time password (OTP) has been sent to your email. Please enter it below to continue with resetting your password.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Secure Code Input */}
          <div className="space-y-2">
            <div className="text-sm font-normal text-gray-700 text-left mb-1">Enter Secure Code</div>
            <div className="flex justify-between gap-2">
              {secureCode.map((code, index) => (
                <Input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-14 h-14 text-center text-4xl border-2 border-orange-500 text-[#FF692E]"
                  value={code}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleBackspace(index, e)}
                  ref={codeRefs[index]}
                />
              ))}
            </div>
          </div>

          {/* Password Fields */}
          <div className="space-y-6">
            <div className="relative">
              <div className="text-sm font-normal text-gray-700 text-left mb-1">New Password</div>

              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className=""
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="relative">
              <div className="text-sm font-normal text-gray-700 text-left mb-1">Confirm Password</div>

              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className=""
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2/3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
          <div className="flex flew-row gap-3">
            {/* Back to Login */}
            <Button variant="outline" className="w-full text-black" onClick={() => (window.location.href = '/login')}>
              ← Back to login
            </Button>
            <Button className="w-full bg-orange-500 hover:bg-orange-600" disabled={!isFormValid() || isLoading} onClick={handleSubmit}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default ResetPassword;
