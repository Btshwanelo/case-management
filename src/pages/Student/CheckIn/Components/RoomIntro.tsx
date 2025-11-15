import React from 'react';
import { ArrowLeft, X, Camera, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/layouts/DashboardLayout';

const RoomIntroScreen = ({ onNextStep, onBack, onClose }) => {
  const progressValue = Math.min(100, Math.max(0, (8 / 10) * 100));

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="space-y-4 pb-2 px-6">
          <div className="flex justify-between items-center">
            {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button> */}
            <div></div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-1">
            <Progress value={progressValue} className="h-2" />
            <div className="text-right text-sm text-black">{progressValue}%</div>
          </div>
        </div>

        <CardContent className="space-y-8 pt-1">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Take your room picture</h1>
            {/* <p className="text-gray-600">Let's verify your identity with a quick photo</p> */}
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Camera className="w-12 h-12 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
              <Clock className="w-6 h-6 text-gray-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Quick Process</h3>
                <p className="text-sm text-gray-600">Takes only 1-3 minutes to complete</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-md" onClick={onNextStep}>
            Continue
          </Button>
        </CardFooter>
      </div>
    </DashboardLayout>
  );
};

export default RoomIntroScreen;
