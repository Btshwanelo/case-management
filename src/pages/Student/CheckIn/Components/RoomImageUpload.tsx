import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { ArrowLeft, X, SwitchCamera, Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Constants for image compression
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const INITIAL_QUALITY = 0.6;
const MIN_QUALITY = 0.1;
const TARGET_WIDTH = 640;
const TARGET_HEIGHT = 480;

interface VerificationScreenProps {
  onBack: () => void;
  onCapture: (photo: string) => void;
  onClose: () => void;
}

const getImageSize = (dataUrl: string): number => {
  const base64Length = dataUrl.split(',')[1].length;
  return Math.round((base64Length * 3) / 4);
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const compressImage = async (imageSrc: string): Promise<string> => {
  const originalSize = getImageSize(imageSrc);

  // If image is already small enough, return it as-is
  if (originalSize < MAX_FILE_SIZE) {
    return imageSrc;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

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
      } catch (err) {
        reject(err);
      }
    };
    img.src = imageSrc;
  });
};

const RoomVerificationScreen = ({ onBack, onCapture, onClose }: VerificationScreenProps) => {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 720, height: 1280 });
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isMobile] = useState(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: dimensions.width },
            height: { ideal: dimensions.height },
          },
        });
        setHasPermission(true);
        stream.getTracks().forEach((track) => track.stop());
        setError(null);
      } catch (err) {
        setHasPermission(false);
        setError('Camera permission denied or camera not available');
        console.error('Camera permission error:', err);
      }
    };

    checkPermissions();
  }, [facingMode]);

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth, 720);
      const height = Math.min(window.innerHeight - 180, isMobile ? (width * 4) / 3 : width * 1.33);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  const videoConstraints = {
    width: { ideal: dimensions.width },
    height: { ideal: dimensions.height },
    facingMode,
    aspectRatio: { ideal: 4 / 3 },
    focusMode: { ideal: 'continuous' },
    advanced: [
      {
        zoom: isMobile ? { ideal: 1 } : undefined,
        autoFocus: { ideal: true },
      },
    ],
  };

  const toggleCamera = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  }, []);

  const capture = useCallback(async () => {
    if (!webcamRef.current) {
      setError('Camera not initialized properly');
      return;
    }

    setIsCapturing(true);
    try {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        // Log the actual dimensions of the captured image
        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => (img.onload = resolve));

        // Compress the image before sending
        const compressedImage = await compressImage(imageSrc);
        onCapture(compressedImage);
      }
    } catch (error) {
      console.error('Failed to capture or compress photo:', error);
      setError('Failed to capture photo');
    } finally {
      setIsCapturing(false);
    }
  }, [onCapture]);

  const progressValue = Math.min(100, Math.max(0, (8 / 10) * 100));

  if (!hasPermission || error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'Please enable camera access to continue'}</AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={onBack}>Go Back</Button>
          {!hasPermission && (
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry Camera Access
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col max-w-lg mx-auto bg-gray-900">
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        <CardHeader className="flex-shrink-0 space-y-4 pb-0 px-4">
          <div className="flex justify-between items-center">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={onBack}>
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={onClose}>
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="space-y-1">
            <Progress value={progressValue} className="h-2" />
            <div className="text-right text-sm text-white">{progressValue}%</div>
          </div>
        </CardHeader>

        <p className="text-white font-medium text-center py-2">Take a clear picture of the bed</p>

        <div className="flex-1 relative flex items-center justify-center min-h-0 p-4">
          <div className="relative w-full h-full max-h-[80vh]">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored={facingMode === 'user'}
              className="w-full h-full object-cover rounded-lg"
              onUserMediaError={(err) => {
                console.error('Webcam error:', err);
                setError('Failed to access camera');
              }}
            />

            <Button
              variant="secondary"
              className="absolute top-4 right-4 p-2 bg-gray-800 bg-opacity-50 hover:bg-gray-700 rounded-full"
              onClick={toggleCamera}
            >
              <SwitchCamera className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>

        <div className="flex-shrink-0 flex justify-center p-4 safe-bottom">
          <Button
            size="lg"
            variant="outline"
            className={`h-16 w-16 rounded-full border-4 
              ${isCapturing ? 'border-orange-500' : 'border-white'} 
              hover:border-orange-500 transition-colors
              flex items-center justify-center`}
            onClick={capture}
            disabled={isCapturing}
          >
            <div
              className={`h-12 w-12 rounded-full 
                ${isCapturing ? 'bg-orange-500' : 'bg-white'} 
                hover:bg-orange-500 transition-colors`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomVerificationScreen;
