import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => void;
  isLoading: boolean;
  isError: boolean;
  isLoadingSubmit: boolean;
  length?: number; // Number of OTP characters
  title?: string; // Customizable title
  errorMessage?: string; // Customizable title
  description?: string; // Customizable description
  icon?: React.ReactNode; // Customizable icon
}

const OTPModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  isLoadingSubmit,
  errorMessage,
  isError,
  length = 4, // Default length is 4
  title = 'Confirm your OTP',
  description = 'OTP successfully created and sms sent',
  icon = <Mail className="h-6 w-6 text-gray-600" />,
}: OTPModalProps) => {
  const [otp, setOtp] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [inputRefs, setInputRefs] = useState<React.RefObject<HTMLInputElement>[]>([]);

  // Initialize OTP array and refs based on length
  useEffect(() => {
    setOtp(Array(length).fill(''));
    setInputRefs(
      Array(length)
        .fill(null)
        .map(() => React.createRef<HTMLInputElement>())
    );
  }, [length]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(Array(length).fill(''));
      setIsValid(false);
      inputRefs[0]?.current?.focus();
    }
  }, [isOpen, length]);

  // Validate OTP
  useEffect(() => {
    setIsValid(otp.every((digit) => digit !== ''));
  }, [otp]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < length - 1) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const regex = new RegExp(`^\\d{${length}}$`);
    if (!regex.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    inputRefs[length - 1]?.current?.focus();
  };

  const handleConfirm = () => {
    onConfirm(otp.join(''));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#6B7280]/40 backdrop-blur-[2px]" aria-hidden="true" />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[400px] pt-10">
          {isError && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-600 font-medium text-center">{errorMessage}</AlertDescription>
            </Alert>
          )}
          {isLoading && <Spinner />}
          {!isLoading && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">{icon}</div>
                <DialogTitle className="text-xl mb-2 mx-auto">{title}</DialogTitle>
                <DialogDescription className="text-center">{description}</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center gap-2 my-6">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    ref={inputRefs[index]}
                    className="w-14 h-14 text-center text-lg"
                  />
                ))}
              </div>
              <DialogFooter>
                <div className="flex w-full gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1" variant="default" disabled={!isValid} onClick={handleConfirm}>
                    {isLoadingSubmit ? <Spinner /> : 'Confirm'}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OTPModal;
