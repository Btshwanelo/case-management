import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleX, Clock, Cloud, CloudOff, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ErrorPage = ({ message }: any) => {
  const navigate = useNavigate();
  return (
    <div className="mt-30 bg-inherit max-w-4xl w-full mx-auto flex items-center justify-center min-h-96">
      <Card className="shadow-none bg-inherit border-none">
        <CardContent className="pt-8 pb-8 px-10 flex flex-col items-center space-y-2 sm:space-y-6">
          {/* Clock Icon */}
          <div className="rounded-lg p-3 sm:p-4 border border-[#E4E7EC] shadow-md">
            <CloudOff className="w-7 h-7 text-black" />
          </div>

          {/* Error Message */}
          <div className="text-center space-y-6 sm:space-y-8 max-w-3xl">
            <h2 className="text-[30px] sm:text-6xl font-semibold text-[#101828]">Something's Wrong</h2>
            {message && <p className="text-base font-normal text-[#475467]">{message}</p>}
            <p className="text-base font-normal text-[#475467]">
              If the issue persists please contact support at
              <a href="mailto:support@xiquelgroup.com" className="text-base ml-2 font-normal text-blue-700 hover:text-blue-700">
                support@xiquelgroup.com
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-5">
            {/* Back to Home Button */}
            <Button variant="outline" className="mt-6 min-w-28 py-5" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button variant="default" className="mt-6 min-w-28 py-5 text-white hover:bg-orange-700" onClick={() => navigate('/')}>
              <ArrowLeft /> Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
