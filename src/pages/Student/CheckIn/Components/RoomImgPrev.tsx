import React from 'react';
import { ArrowLeft, RefreshCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import DashboardLayout from '@/layouts/DashboardLayout';

interface ImagePreviewScreenProps {
  photoUrl: string;
  onBack: () => void;
  onRetake: () => void;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
}

const RoomImagePreviewScreen = ({
  photoUrl,
  onBack,
  onRetake,
  onConfirm,
  onClose,
  title = 'Verify your identity',
}: ImagePreviewScreenProps) => {
  const progressValue = Math.min(100, Math.max(0, (8 / 10) * 100));

  return (
    <DashboardLayout>
      <div className="  text-black">
        <div className="max-w-xl mx-auto px-4 ">
          <div className="space-y-4 pb-0">
            <div className="flex justify-between items-center">
              {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 text-black" />
            </button> */}
              <div></div>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
            <div className="space-y-1">
              <Progress value={progressValue} className="h-2" />
              <div className="text-right text-sm text-black">{progressValue}%</div>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-black font-medium mb-4 text-center">Room Picture Preview</p>

          {/* Image Preview */}
          <div className="flex-1 flex flex-col">
            <div className="relative rounded-lg overflow-hidden mb-6">
              <img src={photoUrl} alt="Preview" className="w-full h-auto object-cover" />
            </div>

            {/* Action Buttons */}
            <div className="mt-auto flex justify-between items-center gap-4">
              <Button variant="ghost" className="text-orange-500 hover:text-orange-600" onClick={onRetake}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Retake
              </Button>

              <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={onConfirm}>
                Use photo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoomImagePreviewScreen;
