import { ArrowLeft, Check, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useCheckInMutation } from '@/services/apiService';
import { extractBase64FromDataUrl, DocumentType } from '@/utils';
import { useParams } from 'react-router-dom';
import UploadProgress from './UploadProgress';
import { showErrorToast } from '@/components/ErrorToast ';
import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';

const UploadImages = ({ onNextStep, formData, onBack, onClose, selfie, roomBedPic }) => {
  const { id: checkInId } = useParams<{ id: string }>();
  const [checkIn, { isLoading, isSuccess, isError, error }] = useCheckInMutation();

  // Add state to track upload status
  const [uploadAttempted, setUploadAttempted] = useState(false);

  const handleUploadDocuments = async () => {
    try {
      setUploadAttempted(true);
      await checkIn({
        body: {
          entityName: 'CheckIn',
          requestName: 'UpsertRecordReq',
          recordId: checkInId,
          inputParamters: {
            Entity: {
              CheckInDate: new Date().toISOString(),
              RoomNumber: formData.roomName,
              CapacityId: formData.roomType,
              RoomSize: formData.NumberOfBeds,
            },
            Documents: [
              {
                FileName: 'selfie',
                FileExtention: 'jpg',
                DocumentTypeId: DocumentType.selfie,
                FileContent: extractBase64FromDataUrl(formData.selfie),
              },
              {
                FileName: 'roomPicture',
                FileExtention: 'jpg',
                DocumentTypeId: DocumentType.roomPicture,
                FileContent: extractBase64FromDataUrl(formData.roomBedPic),
              },
            ],
          },
        },
      }).unwrap();

      // Success case
      onNextStep();
    } catch (err) {
      // Error will be handled by the useEffect below
      console.error('Upload failed:', err);
    }
  };

  // Handle API error states
  useEffect(() => {
    if (isError && uploadAttempted) {
      showErrorToast(error?.data || 'Failed to upload images. Please try again.');
      setUploadAttempted(false); // Reset for potential retry
    }
  }, [isError, error, uploadAttempted]);

  // Only show loading screen when actually uploading
  if (isLoading && uploadAttempted) {
    return <UploadProgress />;
  }

  const progressValue = Math.min(100, Math.max(0, (10 / 10) * 100));

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="space-y-4 pb-0 px-6">
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

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Selfie Image Container */}
            <div className="relative bg-gray-50 rounded-xl border-2 border-green-500">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              {/* Image wrapper with fixed aspect ratio */}
              <div className="aspect-square w-full relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={selfie} alt="Selfie Preview" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Text content */}
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-gray-900">Selfie Verification</p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
            </div>

            {/* Room Image Container */}
            <div className="relative bg-gray-50 rounded-xl border-2 border-green-500">
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
              {/* Image wrapper with fixed aspect ratio */}
              <div className="aspect-square w-full relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <img src={roomBedPic} alt="Room Preview" className="w-full h-full object-cover" />
                </div>
              </div>
              {/* Text content */}
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-gray-900">Room Photos</p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Ready to Upload</h3>
            <p className="text-sm text-gray-600">
              All required photos have been captured. Click the upload button below to securely submit your verification photos.
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-4">
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-medium rounded-md flex items-center justify-center gap-2"
            onClick={handleUploadDocuments}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Photos
              </>
            )}
          </Button>
        </CardFooter>
      </div>
    </DashboardLayout>
  );
};

export default UploadImages;
