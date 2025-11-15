import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const CancelPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const amount = searchParams.get('amount');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <>
            <div className="relative">
              <div className="absolute -inset-1 bg-red-500 rounded-full opacity-20 animate-pulse" />
              <CheckCircle className="w-16 h-16 text-red-500 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Payment Cancelled!</h2>
              <p className="text-gray-600">Your transaction has been cancelled successfully</p>
              {amount && <p className="text-2xl font-semibold text-red-600">Amount: R{parseFloat(amount).toLocaleString()}</p>}
            </div>
            {/* <div className="w-full max-w-sm bg-red-50 rounded-lg p-4 border border-red-100">
              <p className="text-sm text-red-800">
                A confirmation email will be sent to your registered email address
              </p>
            </div> */}
            <div className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
              <Button className="" variant="ghost" onClick={() => navigate('/')}>
                <span>Redirecting to homepage</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        </div>
      </Card>
    </div>
  );
};

export default CancelPayment;
