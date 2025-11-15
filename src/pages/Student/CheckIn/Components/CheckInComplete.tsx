import React, { useState } from 'react';
import { X, ArrowRight, Check, ArrowLeft, MapPinCheckInside, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import KeepSearchingModal from './KeepSearching';
import { ButtonLoader } from '@/components/ui/button-loader';
import { Progress } from '@/components/ui/progress';
import UploadProgress from './UploadProgress';
import SignwellLoader from './GenerateSignwellLoader';
import DashboardLayout from '@/layouts/DashboardLayout';
import useCheckIn from '@/hooks/useCheckIn';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CheckInCompleteProps {
  onClose: () => void;
  onContinue: () => void;
  onBack: () => void;
  onNextStep: () => void;
  onCancellApplication: () => void;
  canceIsLoading: boolean;
  signLeaseIsSuccess: boolean;
  signLeaseIsLoading: boolean;
  retriveSignWellIsLoading: boolean;
  retriveSignWellIsSuccess: boolean;
  signWellDelay: boolean;
  retryCount: number;
}

const CheckInComplete = ({
  onClose,
  onContinue,
  onNextStep,
  onCancellApplication,
  onBack,
  signLeaseIsSuccess,
  canceIsLoading,
  signLeaseIsLoading,
  retriveSignWellIsLoading,
  signWellDelay,
  retryCount,
}: CheckInCompleteProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isStay, setIsStay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const progressValue = Math.min(100, Math.max(0, (2 / 10) * 100));
  const currentCheckIn = useCheckIn();

  // if (isLoading) {
  //   return <SignwellLoader />;
  // }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white p-4 ">
        <div className="max-w-3xl mx-auto">
          {showModal && (
            <KeepSearchingModal
              open={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={onCancellApplication}
              canceIsLoading={canceIsLoading}
            />
          )}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {/* <button className="p-2" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </button> */}
              <div></div>
              {!isLoading && (
                <button className="p-2" onClick={onClose}>
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-gray-200 rounded-full">
              <Progress className="bg-gray-300" value={progressValue} />
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">{progressValue}%</div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              Do you want to stay at <span className="text-orange-400">{currentCheckIn.checkInData.studentResidence}</span> ?
            </h1>
            <h4 className="text-lg font-semibold text-gray-900 flex">
              <MapPinCheckInside className="h-6 w-6 shrink-0 mr-1" /> {currentCheckIn.checkInData.address}
            </h4>

            <p className="text-gray-600 leading-relaxed">
              If you want to live at this residence, click "I want to stay" and sign the lease agreement with the accommodation provider. If
              you don't want to stay, click "No, I won't stay there." This will cancel your application, and you can apply for another
              accommodation.
            </p>

            <Alert className="mb-1 bg-red-50 border-red-200">
              <div className="flex justify-between items-center">
                <AlertDescription className="flex items-center font-semibold gap-2 text-red-500">
                  <Info className="h-4 w-4 text-red-500" />
                  You will not be allowed to move out without a written permission from NSFAS
                </AlertDescription>
              </div>
            </Alert>

            {/* Confirmation Card */}
            {isStay && (
              <Card className="p-4 border-2 border-orange-500 rounded-lg mt-auto">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirmation"
                    checked={isConfirmed}
                    onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                    className="mt-1 border-gray-400 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="confirmation" className="font-semibold text-gray-900">
                      I confirm that
                    </Label>
                    <p className="text-sm text-gray-600">I have inspected the property and consent to make it my new residence.</p>
                  </div>
                </div>
              </Card>
            )}
            {isStay === false && (
              <Card className="p-4 border-2 border-orange-500 rounded-lg mt-auto">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirmation"
                    checked={isConfirmed}
                    onCheckedChange={(checked) => setIsConfirmed(checked as boolean)}
                    className="mt-1 border-gray-400 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="confirmation" className="font-semibold text-gray-900">
                      I confirm that
                    </Label>
                    <p className="text-sm text-gray-600">I have inspected the property and i dont want to stay at this property</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Button */}
            {isStay === false && (
              <Button onClick={onCancellApplication} disabled={!isConfirmed} className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
                {canceIsLoading ? (
                  <ButtonLoader size="large" className="text-white" />
                ) : (
                  <>
                    Confirm
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            {isStay && (
              <Button
                onClick={() => {
                  setIsLoading(true);
                  onNextStep();
                }}
                disabled={!isConfirmed || isLoading}
                className="w-full hover:bg-orange-700 text-white mt-4"
              >
                {signLeaseIsLoading ? (
                  <>
                    <ButtonLoader size="large" className="text-white" />
                  </>
                ) : (
                  <>
                    Continue to Sign lease
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {isStay === null && (
              <>
                <Button
                  onClick={() => setIsStay(true)}
                  // disabled={!isConfirmed}
                  className="w-full  hover:bg-orange-700 text-white border-2  mt-4"
                >
                  Yes, I want to stay here (Sign Lease)
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setIsStay(false)}
                  // disabled={!isConfirmed}
                  className="w-full bg-red-600  hover:bg-red-700 text-white mt-4"
                >
                  No, I dont want to stay here <X className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CheckInComplete;
