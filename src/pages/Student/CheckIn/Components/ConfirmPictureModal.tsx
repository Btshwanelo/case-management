import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PhotoPreviewDialogProps {
  open: boolean;
  isSelfieDone?: boolean;
  isRoomPictureDone?: boolean;
  photoUrl: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onRetake: () => void;
}

const PhotoPreviewDialog = ({
  open,
  isSelfieDone = false,
  isRoomPictureDone = false,
  photoUrl,
  onConfirm,
  onCancel,
  onRetake,
}: PhotoPreviewDialogProps) => {
  const handleClose = (open: boolean) => {
    if (!open) {
      onCancel?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center">
            <button
              onClick={() => onCancel?.()}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogTitle className="flex-1 text-center">Picture Preview</DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          <div className="flex justify-center rounded-lg overflow-hidden">
            <img src={photoUrl} alt="Preview" className="max-w-full h-auto object-contain" />
          </div>

          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1" onClick={onRetake}>
              Retake
            </Button>
            <Button variant="default" className="flex-1" onClick={onConfirm}>
              Use photo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoPreviewDialog;
