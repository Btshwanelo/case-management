import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FormMessage } from '@/components/ui/form';

const ApplicationSuccess = ({ message, isGeneralCase = false }) => {
  const navigate = useNavigate();

  const formattedMessage = message?.split('\n').map((line, index) => (
    <p key={index} className="text-gray-600 text-lg">
      {line.trim()}
    </p>
  ));
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="h-16 w-16 rounded-full border-2 border-zinc-200 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-gray-800" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          {/* <h1 className="text-3xl font-semibold text-gray-900">
            Case
            <br /> 
            Successfully submitted 
          </h1> */}

          {formattedMessage}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          {/* {!isGeneralCase ? (
            <Button
              variant="outline"
              className="px-8"
              onClick={() => navigate("/cases")}
            >
              View Cases
            </Button>
          ) : null} */}

          <Button
            className="bg-[#a11b23] hover:bg-[#a11b23] px-8"
            onClick={() => navigate("/cases")}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
