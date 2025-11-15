import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UnauthorisedLayout from '@/layouts/UnauthorisedLayout';
import { Clock, Lock } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignWellError = ({ home, refresh, isLoadingSignWell, isLoadingSignLease }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-30 flex items-center justify-center h-screen">
      <Card className="border-none shadow-none">
        <CardContent className="pt-12 pb-8 px-10 flex flex-col items-center space-y-6">
          {/* Clock Icon */}
          <div className="rounded-full p-2 border-2 border-zinc-200">
            <Clock className="w-8 h-8 text-zinc-800" />
          </div>

          {/* Error Message */}
          <div className="text-center space-y-6 max-w-md">
            <h2 className="text-xl font-semibold text-zinc-900">{'Your lease is still being prepared!'}</h2>
            <p className="text-md text-zinc-600">
              You'll receive an email with the lease agreement shortly. You can also check your dashboard in a few minutes to sign it.
            </p>
          </div>

          {/* Back to Home Button */}
          <div className="flex gap-4">
            {/* <Button variant="outline" className="mt-6 min-w-28" onClick={refresh}>
              {isLoadingSignWell || isLoadingSignLease ? 'retrieve lease...' : 'Refresh'}
            </Button> */}
            <Button variant="default" className="mt-6 text-white hover:bg-orange-700 min-w-28" onClick={home}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignWellError;
