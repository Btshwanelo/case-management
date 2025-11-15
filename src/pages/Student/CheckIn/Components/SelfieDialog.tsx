import React, { useCallback, useRef, useState } from 'react';
import { ArrowLeft, Circle, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Webcam from 'react-webcam';

// Constants for image compression
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const INITIAL_QUALITY = 0.6; // Start with lower quality
const MIN_QUALITY = 0.1;
const TARGET_WIDTH = 640;
const TARGET_HEIGHT = 480;

const videoConstraints = {
  width: 720,
  height: 1280,
  facingMode: 'user',
};

interface SelfieDialogState {
  title: string;
  subtitle: string;
  facingMode: 'user' | 'environment';
  _open: boolean;
}

const compressImage = (imageSrc: string): string => {
  // Create an image element
  const img = new Image();

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Set better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return new Promise<string>((resolve) => {
    img.onload = () => {
      // Draw resized image
      ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // Start with lower quality
      let quality = INITIAL_QUALITY;
      let photoData = canvas.toDataURL('image/jpeg', quality);
      let sizeInBytes = photoData.length * 0.75;

      // Progressively reduce quality if still too large
      while (sizeInBytes > MAX_FILE_SIZE && quality > MIN_QUALITY) {
        quality -= 0.1;
        photoData = canvas.toDataURL('image/jpeg', quality);
        sizeInBytes = photoData.length * 0.75;
      }

      resolve(photoData);
    };

    img.src = imageSrc;
  });
};

function SelfieDialog({ fullScreen: _fullScreen }: { fullScreen?: boolean } = {}) {
  const [{ title, subtitle, facingMode, _open }, setState] = useState<SelfieDialogState>({
    title: 'Take Picture',
    subtitle: '',
    facingMode: 'user',
    _open: false,
  });

  const onCloseRef = useRef<(selfie: string | null) => void>(() => {});
  const webcamRef = useRef<Webcam>(null);

  const handleClose = () => {
    setState((current) => ({ ...current, _open: false }));
    onCloseRef.current?.(null);
  };

  const takeSelfie = useCallback(async () => {
    if (!webcamRef.current) {
      console.error('Error getting camera. Please check camera permissions');
      return;
    }

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.error('Error getting camera. Please check camera permissions');
      return;
    }

    try {
      // Compress the image before returning
      const compressedImage = await compressImage(imageSrc);
      onCloseRef.current?.(compressedImage);
      setState((current) => ({ ...current, _open: false }));
    } catch (error) {
      console.error('Error compressing image:', error);
      // Fallback to uncompressed image if compression fails
      onCloseRef.current?.(imageSrc);
      setState((current) => ({ ...current, _open: false }));
    }
  }, [webcamRef]);

  const component = (
    <Dialog open={_open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md md:max-w-lg p-0 bg-black text-white">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-border/10">
            <Button variant="ghost" size="icon" className="absolute left-2 text-white hover:text-white/80" onClick={handleClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <h2 className="flex-1 text-center text-lg font-semibold text-white">{title || 'Take a selfie'}</h2>
          </div>

          {/* Content */}
          <div className="space-y-4 p-4">
            {subtitle && <p className="text-white/90">{subtitle}</p>}

            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  ...videoConstraints,
                  facingMode,
                }}
                mirrored={true}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-center mt-4">
              <Button size="icon" className="h-12 w-12 rounded-full bg-white hover:bg-white/90" onClick={takeSelfie}>
                <Circle className="h-10 w-10 text-black" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const open = ({
    title = 'Take Picture',
    onClose,
    subtitle = '',
    facingMode: _facingMode = 'user',
  }: {
    onClose: (selfie: string | null) => void;
    title?: string;
    subtitle?: string;
    facingMode?: 'user' | 'environment';
  }) => {
    onCloseRef.current = onClose;
    setState({
      title,
      subtitle,
      facingMode: _facingMode,
      _open: true,
    });
  };

  const close = () => {
    setState((current) => ({ ...current, _open: false }));
    onCloseRef.current?.(null);
  };

  return { open, close, component };
}

export default SelfieDialog;
