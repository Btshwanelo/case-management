import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface UploadDialogProps {
  checkInId: string;
  roomName: string;
  numberOfBeds: string;
  roomType: string;
  selfie: string;
  roomPicture: string;
  nextStep: 'lease' | 'home';
  onComplete: () => void;
  onCancel?: () => void;
}

type UploadState = 'idle' | 'uploading' | 'success';

const UploadDialog = ({
  open,
  roomName,
  numberOfBeds,
  roomType,
  selfie,
  roomPicture,
  checkInId,
  onComplete,
  onCancel,
}: UploadDialogProps & { open: boolean }) => {
  const [progress, setProgress] = useState(14);
  const [uploadState, setUploadState] = useState<{ state: UploadState }>({
    state: 'idle',
  });

  const progressTimerRef = useRef<NodeJS.Timer>();

  const uploadFiles = async () => {
    try {
      setUploadState({ state: 'uploading' });
      setProgress(14);

      //   const response = await API.post(EXECUTE_REQUEST_PATH, {
      //     entityName: "CheckIn",
      //     requestName: "UpsertRecordReq",
      //     recordId: checkInId,
      //     inputParamters: {
      //       Entity: {
      //         CheckInDate: new Date().toISOString(),
      //         RoomNumber: roomName,
      //         CapacityId: roomType,
      //         RoomSize: numberOfBeds,
      //       },
      //       Documents: [
      //         {
      //           FileName: "selfie",
      //           FileExtention: "jpg",
      //           DocumentTypeId: DocumentType.selfie,
      //           FileContent: UTILS.extractBase64FromDataUrl(selfie),
      //         },
      //         {
      //           FileName: "roomPicture",
      //           FileExtention: "jpg",
      //           DocumentTypeId: DocumentType.roomPicture,
      //           FileContent: UTILS.extractBase64FromDataUrl(roomPicture),
      //         },
      //       ],
      //     },
      //   });

      //   if (response.isSuccess) {
      //     setProgress(95);
      //     setTimeout(() => {
      //       setUploadState({ state: "success" });
      //       onComplete();
      //     }, 1000);
      //   } else {
      //     throw new Error("An error occurred while uploading");
      //   }
    } catch (e) {
      console.error(e);
      setUploadState({ state: 'idle' });
    }
  };

  useEffect(() => {
    uploadFiles();
  }, [selfie]);

  useEffect(() => {
    if (uploadState.state === 'uploading') {
      progressTimerRef.current = setInterval(() => {
        setProgress((prevProgress) => (prevProgress >= 97 ? 97 : prevProgress + 1));
      }, 800);

      return () => {
        clearInterval(progressTimerRef.current);
      };
    } else if (uploadState.state === 'success') {
      setProgress(97);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [uploadState.state]);

  const handleClose = () => {
    if (uploadState.state !== 'uploading') {
      onCancel?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          {uploadState.state !== 'uploading' && (
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content */}
        {uploadState.state === 'uploading' && (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-8">
            {/* Circular Progress with Label */}
            <div className="relative flex items-center justify-center">
              <div className="absolute">
                <span className="text-2xl font-semibold">{Math.round(progress)}%</span>
              </div>
              <svg className="h-24 w-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-muted-foreground/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-primary"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (progress / 100) * 251.2}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
            </div>

            <p className="text-center text-sm text-muted-foreground">Uploading files...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Hook wrapper to maintain compatibility with the original usage
const useUploadDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = (props: Omit<UploadDialogProps, 'open'>) => {
    setIsOpen(true);
    return <UploadDialog {...props} open={isOpen} />;
  };

  const close = () => {
    setIsOpen(false);
  };

  return { open, close };
};

export default useUploadDialog;
