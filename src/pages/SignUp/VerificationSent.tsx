import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';

interface VerificationSentProps {
  email: string;
  onBackToSignIn: () => void;
}

const VerificationSent = ({ email = '', onBackToSignIn }: VerificationSentProps) => {
  return (
    <UnauthorisedLayout data-testid="verification-sent-layout">
      <Card className="w-full max-w-md border-none shadow-none" data-testid="verification-sent-card">
        <CardHeader className="space-y-1 text-center" data-testid="verification-sent-header">
          <div className="flex justify-center mb-2" data-testid="verification-sent-icon-container">
            <div className="rounded-full p-4 border-2 border-zinc-200" data-testid="verification-sent-icon-wrapper">
              <Mail className="h-8 w-8 text-gray-800" data-testid="verification-sent-mail-icon" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold" data-testid="verification-sent-title">
            Account Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1" data-testid="verification-sent-content">
          <div className="text-center space-y-4" data-testid="verification-sent-message-container">
            {/* <p className="text-gray-600">Continue to log</p> */}
          </div>
          <Button
            className=" mx-auto  flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 px-8"
            onClick={onBackToSignIn}
            data-testid="verification-sent-continue-btn"
          >
            <ArrowLeft className="h-4 w-4" data-testid="verification-sent-arrow-icon" />
            Continue
          </Button>
        </CardContent>
      </Card>
    </UnauthorisedLayout>
  );
};

export default VerificationSent;
